-- ======================================================================================
-- RESTAURANT POS: MASTER SCHEMA
-- ======================================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  address text,
  phone text,
  currency text default '$',
  tax_rate numeric(5, 2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  restaurant_id uuid primary key references public.restaurants(id) on delete cascade,
  bill_prefix text default 'INV',
  receipt_footer text,
  print_kitchen_copy boolean default true,
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin', 'manager', 'cashier')),
  is_active boolean default true,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  prep_minutes integer default 0,
  packaging_cost numeric(12, 2) default 0,
  other_cost numeric(12, 2) default 0,
  is_active boolean default true,
  is_favorite boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  unit text not null,
  quantity_on_hand numeric(14, 4) not null default 0,
  reorder_level numeric(14, 4) not null default 0,
  cost_per_unit numeric(12, 2) not null default 0,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity_required numeric(14, 4) not null check (quantity_required > 0),
  created_at timestamptz not null default now(),
  unique(restaurant_id, menu_item_id, inventory_item_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  cashier_id uuid not null references public.profiles(id) on delete restrict,
  bill_number text not null,
  status text not null check (status in ('pending', 'paid', 'void')),
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  total_cost numeric(12, 2) not null default 0,
  gross_profit numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  item_name text not null,
  unit_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null,
  note text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null check (method in ('cash', 'card', 'upi', 'split')),
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  description text not null,
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  recorded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.daily_sales_summary (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  sales_date date not null,
  order_count integer not null default 0,
  gross_sales numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  net_sales numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(restaurant_id, sales_date)
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  movement_type text not null check (movement_type in ('sale_deduction', 'manual_adjustment', 'purchase', 'waste')),
  quantity_delta numeric(14, 4) not null,
  quantity_after numeric(14, 4) not null,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

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
AS $func$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_menu_item_id uuid;
  v_menu_item_name text;
  v_menu_item_price numeric(12, 2);
  v_quantity integer;
  v_note text;
  v_required record;
  v_inventory record;
  v_requester_role text;
BEGIN
  IF p_payment_method NOT IN ('cash', 'card', 'upi', 'split') THEN
    RAISE EXCEPTION 'Invalid payment method: %', p_payment_method;
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  SELECT p.role INTO v_requester_role
  FROM public.profiles p
  WHERE p.id = auth.uid() AND p.restaurant_id = p_restaurant_id;

  IF v_requester_role NOT IN ('admin', 'manager', 'cashier') THEN
    RAISE EXCEPTION 'Unauthorized to create orders.';
  END IF;

  INSERT INTO public.orders (
    restaurant_id, cashier_id, bill_number, status, subtotal, discount, tax, total, total_cost, gross_profit
  ) VALUES (
    p_restaurant_id, p_cashier_id, p_bill_number, 'paid', p_subtotal, p_discount, p_tax, p_total, p_total_cost, p_gross_profit
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_quantity := (v_item->>'quantity')::integer;
    v_note := nullif(v_item->>'note', '');

    SELECT id, name, price INTO v_menu_item_id, v_menu_item_name, v_menu_item_price
    FROM public.menu_items
    WHERE id = (v_item->>'menu_item_id')::uuid AND restaurant_id = p_restaurant_id AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Menu item % is unavailable', v_item->>'menu_item_id';
    END IF;

    INSERT INTO public.order_items (
      restaurant_id, order_id, menu_item_id, item_name, unit_price, quantity, line_total, note
    ) VALUES (
      p_restaurant_id, v_order_id, v_menu_item_id, v_menu_item_name, v_menu_item_price, v_quantity, v_menu_item_price * v_quantity, v_note
    );
  END LOOP;

  FOR v_required IN
    SELECT ri.inventory_item_id, sum(ri.quantity_required * ((item.value->>'quantity')::integer)) as required_qty
    FROM jsonb_array_elements(p_items) as item(value)
    JOIN public.recipe_ingredients ri ON ri.menu_item_id = (item.value->>'menu_item_id')::uuid
    WHERE ri.restaurant_id = p_restaurant_id
    GROUP BY ri.inventory_item_id
  LOOP
    SELECT id, quantity_on_hand, name INTO v_inventory
    FROM public.inventory_items
    WHERE id = v_required.inventory_item_id AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF v_inventory.quantity_on_hand < v_required.required_qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_inventory.name;
    END IF;

    UPDATE public.inventory_items
    SET quantity_on_hand = quantity_on_hand - v_required.required_qty
    WHERE id = v_required.inventory_item_id;

    INSERT INTO public.inventory_movements (
      restaurant_id, inventory_item_id, order_id, movement_type, quantity_delta, quantity_after, note, created_by
    ) VALUES (
      p_restaurant_id, v_required.inventory_item_id, v_order_id, 'sale_deduction', -v_required.required_qty, v_inventory.quantity_on_hand - v_required.required_qty, 'BOM deduction', p_cashier_id
    );
  END LOOP;

  INSERT INTO public.payments (restaurant_id, order_id, method, amount)
  VALUES (p_restaurant_id, v_order_id, p_payment_method, p_total);

  INSERT INTO public.daily_sales_summary (restaurant_id, sales_date, order_count, gross_sales, discount_total, tax_total, net_sales)
  VALUES (p_restaurant_id, current_date, 1, p_subtotal, p_discount, p_tax, p_total)
  ON CONFLICT (restaurant_id, sales_date) DO UPDATE SET
    order_count = daily_sales_summary.order_count + 1,
    gross_sales = daily_sales_summary.gross_sales + excluded.gross_sales,
    discount_total = daily_sales_summary.discount_total + excluded.discount_total,
    tax_total = daily_sales_summary.tax_total + excluded.tax_total,
    net_sales = daily_sales_summary.net_sales + excluded.net_sales,
    updated_at = now();

  order_id := v_order_id;
  bill_number := p_bill_number;
  RETURN NEXT;
END;
$func$;
GRANT EXECUTE ON FUNCTION public.create_order_with_inventory_deduction TO authenticated;

CREATE OR REPLACE FUNCTION public.get_daily_profit_loss(p_restaurant_id uuid, p_date date)
RETURNS TABLE (
  total_orders bigint,
  gross_sales numeric,
  net_sales numeric,
  total_cogs numeric,
  total_expenses numeric,
  net_profit numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  RETURN QUERY
  WITH SalesData AS (
    SELECT 
      COUNT(id) AS orders_count,
      COALESCE(SUM(subtotal), 0) AS gross,
      COALESCE(SUM(total), 0) AS net,
      COALESCE(SUM(total_cost), 0) AS cogs
    FROM public.orders
    WHERE restaurant_id = p_restaurant_id AND DATE(created_at) = p_date AND status != 'void'
  ),
  ExpenseData AS (
    SELECT COALESCE(SUM(amount), 0) AS expenses
    FROM public.expenses
    WHERE restaurant_id = p_restaurant_id AND expense_date = p_date
  )
  SELECT 
    s.orders_count AS total_orders,
    s.gross AS gross_sales,
    s.net AS net_sales,
    s.cogs AS total_cogs,
    e.expenses AS total_expenses,
    (s.net - s.cogs - e.expenses) AS net_profit
  FROM SalesData s
  CROSS JOIN ExpenseData e;
END;
$func$;
GRANT EXECUTE ON FUNCTION public.get_daily_profit_loss TO authenticated;

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.restaurants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON public.restaurants FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow auth read" ON public.restaurant_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON public.restaurant_settings FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow auth all" ON public.menu_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all" ON public.menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all" ON public.inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all" ON public.recipe_ingredients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all" ON public.daily_sales_summary FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all" ON public.inventory_movements FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow auth select" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth insert" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow admin delete" ON public.orders FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow auth select" ON public.payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth insert" ON public.payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON public.payments FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow admin delete" ON public.payments FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow auth all" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
