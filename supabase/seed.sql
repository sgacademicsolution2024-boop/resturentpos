insert into public.restaurants (id, name, slug, address, phone, currency, tax_rate)
values (
  '11111111-1111-1111-1111-111111111111',
  'TableStack Bistro',
  'tablestack-bistro',
  '18 Riverwalk Lane, Brisbane QLD',
  '+61 7 5555 0142',
  '$',
  10
)
on conflict (id) do nothing;

insert into public.restaurant_settings (restaurant_id, bill_prefix, receipt_footer, print_kitchen_copy)
values (
  '11111111-1111-1111-1111-111111111111',
  'TS',
  'Thank you for dining with us.',
  true
)
on conflict (restaurant_id) do nothing;

insert into public.menu_categories (id, restaurant_id, name, sort_order)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Starters', 1),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Mains', 2),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Drinks', 3)
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_id, category_id, name, description, price, is_active, prep_minutes)
values
  ('bbbbbbbb-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'Chicken Wings Plate', 'Crispy wings, chilli glaze, ranch.', 18, true, 9),
  ('bbbbbbbb-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000002', 'Smash Burger', 'Double patty, cheddar, pickles, house sauce.', 22, true, 12),
  ('bbbbbbbb-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000002', 'Green Market Salad', 'Leaves, avocado, tomato, lemon dressing.', 16, true, 6),
  ('bbbbbbbb-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000003', 'House Cola', '330ml bottle.', 5, true, 1)
on conflict (id) do nothing;

insert into public.inventory_items (id, restaurant_id, name, unit, quantity_on_hand, reorder_level, cost_per_unit)
values
  ('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Chicken wing pieces', 'piece', 220, 60, 0.72),
  ('cccccccc-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Burger buns', 'piece', 80, 24, 0.55),
  ('cccccccc-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Beef patties', 'piece', 130, 40, 1.85),
  ('cccccccc-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Mixed leaves', 'kg', 14, 5, 8.40),
  ('cccccccc-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'House cola bottle', 'bottle', 96, 30, 1.15)
on conflict (id) do nothing;

insert into public.menu_item_ingredients (restaurant_id, menu_item_id, inventory_item_id, quantity, unit)
values
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 5, 'piece'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000002', 1, 'piece'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000003', 2, 'piece'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000004', 0.18, 'kg'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000004', 'cccccccc-0000-0000-0000-000000000005', 1, 'bottle')
on conflict (restaurant_id, menu_item_id, inventory_item_id) do nothing;
