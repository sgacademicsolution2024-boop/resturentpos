-- Restaurant POS SaaS reset script.
-- Run only when you want to remove the POS database objects.
-- Safe even if some tables/functions were only partially created.

drop function if exists public.create_order_with_inventory_deduction(uuid, uuid, text, numeric, numeric, jsonb);
drop function if exists public.same_restaurant(uuid);
drop function if exists public.has_role(text[]);
drop function if exists public.current_profile_role();
drop function if exists public.current_profile_restaurant_id();

do $reset_triggers$
begin
  if to_regclass('public.menu_items') is not null then
    drop trigger if exists touch_menu_items_updated_at on public.menu_items;
  end if;

  if to_regclass('public.inventory_items') is not null then
    drop trigger if exists touch_inventory_items_updated_at on public.inventory_items;
  end if;

  if to_regclass('public.restaurant_settings') is not null then
    drop trigger if exists touch_restaurant_settings_updated_at on public.restaurant_settings;
  end if;
end;
$reset_triggers$;

drop function if exists public.touch_updated_at();

drop table if exists public.inventory_movements cascade;
drop table if exists public.payments cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.menu_item_ingredients cascade;
drop table if exists public.menu_items cascade;
drop table if exists public.menu_categories cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.daily_sales_summary cascade;
drop table if exists public.staff_invites cascade;
drop table if exists public.restaurant_settings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.restaurants cascade;

drop sequence if exists public.order_bill_sequence;
