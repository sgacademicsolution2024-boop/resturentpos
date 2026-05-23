-- Transactional order creation with recipe-based inventory deduction.
-- Run after supabase/schema.sql and before supabase/rls.sql.
-- Safe to rerun.

drop function if exists public.create_order_with_inventory_deduction(uuid, uuid, text, numeric, numeric, jsonb);

create or replace function public.create_order_with_inventory_deduction(
  p_restaurant_id uuid,
  p_cashier_id uuid,
  p_payment_method text,
  p_discount numeric,
  p_tax numeric,
  p_items jsonb
)
returns table(order_id uuid, bill_number text)
language plpgsql
security definer
set search_path = public
as $create_order_with_inventory_deduction$
declare
  v_order_id uuid;
  v_bill_number text;
  v_subtotal numeric(12, 2) := 0;
  v_discount numeric(12, 2) := coalesce(p_discount, 0);
  v_tax numeric(12, 2) := coalesce(p_tax, 0);
  v_total numeric(12, 2);
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
begin
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

    v_subtotal := v_subtotal + (v_menu_item_price * v_quantity);
  end loop;

  v_total := greatest(v_subtotal - v_discount, 0) + v_tax;

  v_bill_number := concat(
    coalesce(
      (
        select rs.bill_prefix
        from public.restaurant_settings rs
        where rs.restaurant_id = p_restaurant_id
      ),
      'TS'
    ),
    '-',
    to_char(now(), 'YYYYMMDD'),
    '-',
    lpad(nextval('public.order_bill_sequence')::text, 5, '0')
  );

  insert into public.orders (
    restaurant_id,
    bill_number,
    cashier_id,
    status,
    subtotal,
    discount,
    tax,
    total
  )
  values (
    p_restaurant_id,
    v_bill_number,
    p_cashier_id,
    'paid',
    v_subtotal,
    v_discount,
    v_tax,
    v_total
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

    if not found then
      raise exception 'Menu item % is not available', v_item->>'menu_item_id';
    end if;

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
end;
$create_order_with_inventory_deduction$;

grant execute on function public.create_order_with_inventory_deduction(uuid, uuid, text, numeric, numeric, jsonb) to authenticated;
