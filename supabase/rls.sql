-- Restaurant POS SaaS RLS policies.
-- Run after supabase/schema.sql.
-- Safe to rerun. Existing policies on these app tables are removed first.

alter table public.restaurants enable row level security;
alter table public.profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.menu_item_ingredients enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.daily_sales_summary enable row level security;
alter table public.staff_invites enable row level security;
alter table public.restaurant_settings enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'restaurants',
        'profiles',
        'menu_categories',
        'menu_items',
        'inventory_items',
        'menu_item_ingredients',
        'orders',
        'order_items',
        'payments',
        'inventory_movements',
        'daily_sales_summary',
        'staff_invites',
        'restaurant_settings'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end;
$$;

create or replace function public.current_profile_restaurant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.restaurant_id
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = any(required_roles), false)
$$;

create or replace function public.same_restaurant(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_restaurant_id() = target_restaurant_id, false)
$$;

create policy "restaurants_select_members"
on public.restaurants
for select
using (public.same_restaurant(id));

create policy "restaurants_update_owner"
on public.restaurants
for update
using (public.same_restaurant(id) and public.has_role(array['owner']))
with check (public.same_restaurant(id) and public.has_role(array['owner']));

create policy "profiles_select_members"
on public.profiles
for select
using (public.same_restaurant(restaurant_id));

create policy "profiles_insert_owner"
on public.profiles
for insert
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "profiles_update_owner"
on public.profiles
for update
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']))
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "profiles_delete_owner"
on public.profiles
for delete
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "menu_categories_select_members"
on public.menu_categories
for select
using (public.same_restaurant(restaurant_id));

create policy "menu_categories_insert_manager"
on public.menu_categories
for insert
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_categories_update_manager"
on public.menu_categories
for update
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']))
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_categories_delete_manager"
on public.menu_categories
for delete
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_items_select_members"
on public.menu_items
for select
using (public.same_restaurant(restaurant_id));

create policy "menu_items_insert_manager"
on public.menu_items
for insert
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_items_update_manager"
on public.menu_items
for update
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']))
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_items_delete_manager"
on public.menu_items
for delete
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "inventory_items_select_manager"
on public.inventory_items
for select
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "inventory_items_insert_manager"
on public.inventory_items
for insert
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "inventory_items_update_manager"
on public.inventory_items
for update
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']))
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "inventory_items_delete_manager"
on public.inventory_items
for delete
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_item_ingredients_select_manager"
on public.menu_item_ingredients
for select
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_item_ingredients_insert_manager"
on public.menu_item_ingredients
for insert
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_item_ingredients_update_manager"
on public.menu_item_ingredients
for update
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']))
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "menu_item_ingredients_delete_manager"
on public.menu_item_ingredients
for delete
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "orders_select_members"
on public.orders
for select
using (public.same_restaurant(restaurant_id));

create policy "order_items_select_members"
on public.order_items
for select
using (public.same_restaurant(restaurant_id));

create policy "payments_select_members"
on public.payments
for select
using (public.same_restaurant(restaurant_id));

create policy "inventory_movements_select_manager"
on public.inventory_movements
for select
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "daily_sales_summary_select_manager"
on public.daily_sales_summary
for select
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner','manager']));

create policy "staff_invites_select_owner"
on public.staff_invites
for select
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "staff_invites_insert_owner"
on public.staff_invites
for insert
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "staff_invites_update_owner"
on public.staff_invites
for update
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']))
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "staff_invites_delete_owner"
on public.staff_invites
for delete
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "restaurant_settings_select_owner"
on public.restaurant_settings
for select
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "restaurant_settings_insert_owner"
on public.restaurant_settings
for insert
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "restaurant_settings_update_owner"
on public.restaurant_settings
for update
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']))
with check (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));

create policy "restaurant_settings_delete_owner"
on public.restaurant_settings
for delete
using (public.same_restaurant(restaurant_id) and public.has_role(array['owner']));
