create extension if not exists "pgcrypto";

create sequence if not exists public.order_bill_sequence;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  phone text,
  currency text not null default '$',
  tax_rate numeric(6, 3) not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner', 'manager', 'cashier')),
  created_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  is_active boolean not null default true,
  prep_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  unit text not null,
  quantity_on_hand numeric(14, 4) not null default 0 check (quantity_on_hand >= 0),
  reorder_level numeric(14, 4) not null default 0,
  cost_per_unit numeric(12, 4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_item_ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity numeric(14, 4) not null check (quantity > 0),
  unit text not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, menu_item_id, inventory_item_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  bill_number text not null,
  cashier_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'paid' check (status in ('open', 'paid', 'void')),
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (restaurant_id, bill_number)
);

create table if not exists public.order_items (
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

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null check (method in ('cash', 'card', 'upi', 'split')),
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  movement_type text not null check (movement_type in ('sale_deduction', 'manual_adjustment', 'purchase')),
  quantity_delta numeric(14, 4) not null,
  quantity_after numeric(14, 4) not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_sales_summary (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  sales_date date not null,
  order_count integer not null default 0,
  gross_sales numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  net_sales numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (restaurant_id, sales_date)
);

create table if not exists public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  email text not null,
  role text not null check (role in ('manager', 'cashier')),
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references public.restaurants(id) on delete cascade,
  bill_prefix text not null default 'TS',
  receipt_footer text not null default 'Thank you for dining with us.',
  print_kitchen_copy boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_restaurant_id on public.profiles(restaurant_id);
create index if not exists idx_menu_items_restaurant_id on public.menu_items(restaurant_id);
create index if not exists idx_inventory_items_restaurant_id on public.inventory_items(restaurant_id);
create index if not exists idx_orders_restaurant_created on public.orders(restaurant_id, created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_inventory_movements_restaurant_item on public.inventory_movements(restaurant_id, inventory_item_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_menu_items_updated_at on public.menu_items;
create trigger touch_menu_items_updated_at
before update on public.menu_items
for each row execute function public.touch_updated_at();

drop trigger if exists touch_inventory_items_updated_at on public.inventory_items;
create trigger touch_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.touch_updated_at();

drop trigger if exists touch_restaurant_settings_updated_at on public.restaurant_settings;
create trigger touch_restaurant_settings_updated_at
before update on public.restaurant_settings
for each row execute function public.touch_updated_at();
