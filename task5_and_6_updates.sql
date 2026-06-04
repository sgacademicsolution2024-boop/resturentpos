-- task5_and_6_updates.sql

-- ======================================================================================
-- TASK 5: RECIPE-BASED INVENTORY DEDUCTION (BOM)
-- ======================================================================================

-- 1. Create the recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity_required numeric(14, 4) not null check (quantity_required > 0),
  created_at timestamptz not null default now(),
  unique (restaurant_id, menu_item_id, inventory_item_id)
);

-- Enable RLS and create standard policies
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable SELECT for authenticated users" ON public.recipe_ingredients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable INSERT for authenticated users" ON public.recipe_ingredients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable UPDATE for authenticated users" ON public.recipe_ingredients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable DELETE for authenticated users" ON public.recipe_ingredients FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Update the menu_item_cost_view to use recipe_ingredients
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
        (SELECT SUM(ri.quantity_required * ii.cost_per_unit)
         FROM public.recipe_ingredients ri
         JOIN public.inventory_items ii ON ii.id = ri.inventory_item_id
         WHERE ri.menu_item_id = m.id), 0
    ) AS food_cost,
    (m.packaging_cost + m.other_cost + 
      COALESCE(
        (SELECT SUM(ri.quantity_required * ii.cost_per_unit)
         FROM public.recipe_ingredients ri
         JOIN public.inventory_items ii ON ii.id = ri.inventory_item_id
         WHERE ri.menu_item_id = m.id), 0
      )
    ) AS total_cost
FROM public.menu_items m;

GRANT SELECT ON public.menu_item_cost_view TO authenticated;
GRANT SELECT ON public.menu_item_cost_view TO anon;

-- 3. Update the create_order_with_inventory_deduction RPC to use recipe_ingredients and check for admin/manager/cashier correctly
DROP FUNCTION IF EXISTS public.create_order_with_inventory_deduction(uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, text, numeric, jsonb);
DROP FUNCTION IF EXISTS public.create_order_with_inventory_deduction(uuid, uuid, text, numeric, numeric, numeric, numeric, jsonb);

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

  if v_cashier_role is null or v_cashier_role not in ('admin', 'owner', 'manager', 'cashier') then
    raise exception 'Cashier is not allowed to create orders for this restaurant. Found role: %', v_cashier_role;
  end if;

  select p.role
  into v_requester_role
  from public.profiles p
  where p.id = auth.uid()
    and p.restaurant_id = p_restaurant_id;

  if v_requester_role is null or v_requester_role not in ('admin', 'owner', 'manager', 'cashier') then
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

  -- Use recipe_ingredients for BOM deduction!
  for v_required in
    select
      ri.inventory_item_id,
      sum(ri.quantity_required * ((item.value->>'quantity')::integer)) as required_quantity
    from jsonb_array_elements(p_items) as item(value)
    join public.recipe_ingredients ri
      on ri.menu_item_id = (item.value->>'menu_item_id')::uuid
     and ri.restaurant_id = p_restaurant_id
    group by ri.inventory_item_id
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
      concat('Auto BOM deduction for bill ', v_bill_number),
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

-- ======================================================================================
-- TASK 6: STRICT ADMIN OVERRIDES FOR BILLS AND PAYMENTS
-- ======================================================================================

-- 1. Orders RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON public.orders;
CREATE POLICY "Enable SELECT for authenticated users" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON public.orders;
CREATE POLICY "Enable INSERT for authenticated users" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable UPDATE for admins only" ON public.orders;
CREATE POLICY "Enable UPDATE for admins only" ON public.orders FOR UPDATE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

DROP POLICY IF EXISTS "Enable DELETE for admins only" ON public.orders;
CREATE POLICY "Enable DELETE for admins only" ON public.orders FOR DELETE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 2. Payments RLS Policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON public.payments;
CREATE POLICY "Enable SELECT for authenticated users" ON public.payments FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON public.payments;
CREATE POLICY "Enable INSERT for authenticated users" ON public.payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable UPDATE for admins only" ON public.payments;
CREATE POLICY "Enable UPDATE for admins only" ON public.payments FOR UPDATE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

DROP POLICY IF EXISTS "Enable DELETE for admins only" ON public.payments;
CREATE POLICY "Enable DELETE for admins only" ON public.payments FOR DELETE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

