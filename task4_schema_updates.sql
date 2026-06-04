-- task4_schema_updates.sql

-- 1. Add flat costs to menu_items
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS packaging_cost numeric(12, 2) not null default 0,
ADD COLUMN IF NOT EXISTS other_cost numeric(12, 2) not null default 0;

-- 2. Add historical cost tracking to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS total_cost numeric(12, 2) not null default 0,
ADD COLUMN IF NOT EXISTS gross_profit numeric(12, 2) not null default 0;

-- 3. Create a view to easily get the live total cost of a menu item (raw food + packaging + other)
CREATE OR REPLACE VIEW public.menu_item_cost_view AS
SELECT 
    m.id AS menu_item_id,
    m.restaurant_id,
    m.category_id,
    m.name,
    m.description,
    m.price AS selling_price,
    m.is_active,
    m.is_favorite,
    m.prep_minutes,
    m.packaging_cost,
    m.other_cost,
    COALESCE(
        (SELECT SUM(mii.quantity * ii.cost_per_unit)
         FROM public.menu_item_ingredients mii
         JOIN public.inventory_items ii ON ii.id = mii.inventory_item_id
         WHERE mii.menu_item_id = m.id), 0
    ) AS food_cost,
    (m.packaging_cost + m.other_cost + 
      COALESCE(
        (SELECT SUM(mii.quantity * ii.cost_per_unit)
         FROM public.menu_item_ingredients mii
         JOIN public.inventory_items ii ON ii.id = mii.inventory_item_id
         WHERE mii.menu_item_id = m.id), 0
      )
    ) AS total_cost
FROM public.menu_items m;

-- Grant permissions on view
GRANT SELECT ON public.menu_item_cost_view TO authenticated;
GRANT SELECT ON public.menu_item_cost_view TO anon;

-- 4. RPC for daily profit loss summary
CREATE OR REPLACE FUNCTION public.get_daily_profit_loss(p_restaurant_id uuid, p_date date)
RETURNS TABLE (
  total_sales numeric,
  total_cogs numeric,
  total_expenses numeric,
  net_profit numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sales numeric := 0;
  v_cogs numeric := 0;
  v_expenses numeric := 0;
BEGIN
  -- Total Sales and COGS from orders
  SELECT COALESCE(SUM(total), 0), COALESCE(SUM(total_cost), 0)
  INTO v_sales, v_cogs
  FROM public.orders
  WHERE restaurant_id = p_restaurant_id
  AND DATE(created_at) = p_date
  AND status = 'paid';

  -- Total Expenses
  SELECT COALESCE(SUM(amount), 0)
  INTO v_expenses
  FROM public.expenses
  WHERE restaurant_id = p_restaurant_id
  AND expense_date = p_date;

  RETURN QUERY SELECT v_sales, v_cogs, v_expenses, (v_sales - v_cogs - v_expenses);
END;
$$;

-- 5. Drop old version of create_order_with_inventory_deduction and recreate with total_cost & gross_profit
DROP FUNCTION IF EXISTS public.create_order_with_inventory_deduction(uuid, uuid, text, numeric, numeric, jsonb);

CREATE OR REPLACE FUNCTION public.create_order_with_inventory_deduction(
  p_restaurant_id uuid,
  p_cashier_id uuid,
  p_bill_number text,
  p_subtotal numeric,
  p_discount numeric,
  p_tax numeric,
  p_total numeric,
  p_total_cost numeric,
  p_gross_profit numeric,
  p_payment_method text,
  p_payment_amount numeric,
  p_items jsonb
)
RETURNS TABLE(order_id uuid, bill_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $create_order_with_inventory_deduction$
DECLARE
  v_order_id uuid;
  v_bill_number text := p_bill_number;
  v_subtotal numeric(12, 2) := coalesce(p_subtotal, 0);
  v_discount numeric(12, 2) := coalesce(p_discount, 0);
  v_tax numeric(12, 2) := coalesce(p_tax, 0);
  v_total_cost numeric(12, 2) := coalesce(p_total_cost, 0);
  v_gross_profit numeric(12, 2) := coalesce(p_gross_profit, 0);
  v_total numeric(12, 2) := coalesce(p_total, 0);
  v_item jsonb;
  v_menu_item_id uuid;
  v_menu_item_name text;
  v_menu_item_price numeric(12, 2);
  v_quantity integer;
  v_note text;
  v_required record;
  v_inventory record;
  v_sales_date date := current_date;
  v_cashier_role text;
  v_requester_role text;
BEGIN
  if p_payment_method not in ('cash', 'card', 'upi', 'split') then
    raise exception 'Invalid payment method: %', p_payment_method;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  select p.role
  into v_cashier_role
  from public.profiles p
  where p.id = p_cashier_id
    and p.restaurant_id = p_restaurant_id;

  if v_cashier_role is null or v_cashier_role not in ('owner', 'manager', 'cashier') then
    raise exception 'Cashier is not allowed to create orders for this restaurant';
  end if;

  select p.role
  into v_requester_role
  from public.profiles p
  where p.id = auth.uid()
    and p.restaurant_id = p_restaurant_id;

  if v_requester_role is null or v_requester_role not in ('owner', 'manager', 'cashier') then
    raise exception 'Current user is not allowed to create orders for this restaurant';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := coalesce((v_item->>'quantity')::integer, 0);

    if v_quantity <= 0 then
      raise exception 'Order item quantity must be greater than zero';
    end if;

    select mi.id, mi.name, mi.price
    into v_menu_item_id, v_menu_item_name, v_menu_item_price
    from public.menu_items mi
    where mi.id = (v_item->>'menu_item_id')::uuid
      and mi.restaurant_id = p_restaurant_id
      and mi.is_active = true;

    if not found then
      raise exception 'Menu item % is not available', v_item->>'menu_item_id';
    end if;

  end loop;

  insert into public.orders (
    restaurant_id,
    bill_number,
    cashier_id,
    status,
    subtotal,
    discount,
    tax,
    total,
    total_cost,
    gross_profit
  )
  values (
    p_restaurant_id,
    v_bill_number,
    p_cashier_id,
    'paid',
    v_subtotal,
    v_discount,
    v_tax,
    v_total,
    v_total_cost,
    v_gross_profit
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    v_note := nullif(v_item->>'note', '');

    select mi.id, mi.name, mi.price
    into v_menu_item_id, v_menu_item_name, v_menu_item_price
    from public.menu_items mi
    where mi.id = (v_item->>'menu_item_id')::uuid
      and mi.restaurant_id = p_restaurant_id
      and mi.is_active = true;

    insert into public.order_items (
      restaurant_id,
      order_id,
      menu_item_id,
      item_name,
      unit_price,
      quantity,
      line_total,
      note
    )
    values (
      p_restaurant_id,
      v_order_id,
      v_menu_item_id,
      v_menu_item_name,
      v_menu_item_price,
      v_quantity,
      v_menu_item_price * v_quantity,
      v_note
    );
  end loop;

  for v_required in
    select
      mii.inventory_item_id,
      sum(mii.quantity * ((item.value->>'quantity')::integer)) as required_quantity
    from jsonb_array_elements(p_items) as item(value)
    join public.menu_item_ingredients mii
      on mii.menu_item_id = (item.value->>'menu_item_id')::uuid
     and mii.restaurant_id = p_restaurant_id
    group by mii.inventory_item_id
  loop
    select ii.id, ii.quantity_on_hand, ii.name
    into v_inventory
    from public.inventory_items ii
    where ii.id = v_required.inventory_item_id
      and ii.restaurant_id = p_restaurant_id
    for update;

    if not found then
      raise exception 'Inventory item % not found', v_required.inventory_item_id;
    end if;

    if v_inventory.quantity_on_hand < v_required.required_quantity then
      raise exception 'Insufficient stock for %. Required %, available %',
        v_inventory.name,
        v_required.required_quantity,
        v_inventory.quantity_on_hand;
    end if;

    update public.inventory_items
    set quantity_on_hand = quantity_on_hand - v_required.required_quantity
    where id = v_required.inventory_item_id
      and restaurant_id = p_restaurant_id
    returning quantity_on_hand into v_inventory.quantity_on_hand;

    insert into public.inventory_movements (
      restaurant_id,
      inventory_item_id,
      order_id,
      movement_type,
      quantity_delta,
      quantity_after,
      note,
      created_by
    )
    values (
      p_restaurant_id,
      v_required.inventory_item_id,
      v_order_id,
      'sale_deduction',
      -v_required.required_quantity,
      v_inventory.quantity_on_hand,
      concat('Auto deduction for bill ', v_bill_number),
      p_cashier_id
    );
  end loop;

  insert into public.payments (
    restaurant_id,
    order_id,
    method,
    amount
  )
  values (
    p_restaurant_id,
    v_order_id,
    p_payment_method,
    v_total
  );

  insert into public.daily_sales_summary (
    restaurant_id,
    sales_date,
    order_count,
    gross_sales,
    discount_total,
    tax_total,
    net_sales
  )
  values (
    p_restaurant_id,
    v_sales_date,
    1,
    v_subtotal,
    v_discount,
    v_tax,
    v_total
  )
  on conflict (restaurant_id, sales_date)
  do update set
    order_count = public.daily_sales_summary.order_count + 1,
    gross_sales = public.daily_sales_summary.gross_sales + excluded.gross_sales,
    discount_total = public.daily_sales_summary.discount_total + excluded.discount_total,
    tax_total = public.daily_sales_summary.tax_total + excluded.tax_total,
    net_sales = public.daily_sales_summary.net_sales + excluded.net_sales,
    updated_at = now();

  order_id := v_order_id;
  bill_number := v_bill_number;
  return next;
END;
$create_order_with_inventory_deduction$;

GRANT EXECUTE ON FUNCTION public.create_order_with_inventory_deduction(uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, text, numeric, jsonb) TO authenticated;
