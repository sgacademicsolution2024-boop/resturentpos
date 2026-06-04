# Restaurant POS System - Full Audit Report & Refactor Plan

## Goal
Perform a comprehensive audit of the current codebase and provide a plan to transition the application to a new simplified architecture (Admin and Manager roles), streamline inventory to simple consumption mapping, and replace all mock/seeded data with live Supabase integrations.

## Phase 1 & 2: Audit Report

### Authentication
* **Current login flow:** The login page (`src/app/(auth)/login/page.tsx`) only has static UI. The application uses a mock `AuthContext` (`src/lib/auth-context.tsx`) that manages user roles locally using React state instead of relying on Supabase auth.
* **Roles:** Currently supports `owner`, `manager`, and `cashier` in both frontend and database constraints.
* **Route Protection:** Handled via a `RoleGate` component, but it relies on the mock auth context.
* **Permission Handling:** Hardcoded role mapping (`owner`, `manager`, `cashier`).

### Database
* **Tables:** `restaurants`, `profiles`, `menu_categories`, `menu_items`, `inventory_items`, `menu_item_ingredients` (recipe mapping), `orders`, `order_items`, `payments`, `inventory_movements`, `daily_sales_summary`, `staff_invites`, `restaurant_settings`.
* **RLS Policies:** Standard RLS is applied to all tables based on `current_profile_restaurant_id` and `current_profile_role` (`owner`, `manager`). 
* **Issues:**
  * Uses 'owner' and 'cashier' roles which need to be replaced with 'admin' and 'manager'.
  * Needs an `expenses` table since expense tracking is currently entirely mocked in the frontend.

### Dashboard
* **Metrics:** Sales, profit, expenses, and inventory calculations are mostly hardcoded in `src/lib/constants.ts` (`salesTrend`, `expenses`, `inventoryItems`, `topSellingItems`).
* **Fake Data:** The `OwnerProfitDashboard` and `ManagerSalesDashboard` load `recentOrders` from Supabase, but everything else (Gross Profit Weekly, Expenses, Sales Chart, Low Stock Alerts, Top Selling Items) uses fake, hardcoded arrays.

### POS Billing
* **Order Creation:** Uses the `create_order_with_inventory_deduction` RPC in Supabase, which correctly performs a transaction.
* **Issues:**
  * The frontend passes a hardcoded `restaurantId` (`11111111-1111-1111-1111-111111111111`) instead of the authenticated user's organization.
  * Relies on the mock `cashier.name` from `constants.ts` instead of the logged-in user.

### Inventory
* **Structure:** The current system uses an ingredient-level recipe mapping via the `menu_item_ingredients` table. 
* **Deduction Logic:** When an order is placed, the RPC loops through `menu_item_ingredients` to deduct stock (e.g., deducting 150g of rice).
* **Issue:** Overly complex for small/medium restaurants. Needs to be simplified to direct menu-item to inventory-item mapping (e.g., 1 Bucket = 15 Pieces of Chicken Wings).

### Security
* **RLS:** Policies rely on the `profiles` table to look up user roles.
* **Vulnerability:** The frontend is exposing mock roles without validating actual JWT claims from Supabase. Any user can theoretically switch to "Owner" via the local state bypass if they find the dev switcher. The `p_restaurant_id` is blindly accepted from the client in the order creation RPC (though RLS limits what is returned, the RPC itself relies on `current_profile_restaurant_id` validation inside it).

---

## Phase 3: Prioritized Issues & Recommendations

### Critical Issues (Must Fix First)
1. **Mock Authentication:** The entire system relies on a mock `AuthContext` with a dev role switcher. It needs to be wired properly to Supabase Auth.
2. **Hardcoded Tenant IDs:** `PosTerminal.tsx` sends a hardcoded `restaurantId` to the backend. This breaks multi-tenancy completely.
3. **Mock Dashboard Data:** Dashboards use `constants.ts` for almost all financial metrics, leading to fake numbers.

### High Priority Issues
1. **Complex Inventory:** `menu_item_ingredients` needs to be refactored into a simpler consumption model (pieces/units).
2. **Missing Expense System:** No `expenses` table in the database; expenses are hardcoded.
3. **Role Architecture:** Roles must be migrated from `owner`/`manager`/`cashier` to strictly `admin`/`manager`.

### Recommended Database Changes
1. **Drop `menu_item_ingredients`:** Replace it with a simpler mapping table or modify it to act as a 1:1 simple consumption map without fractional grams.
2. **Create `expenses` table:** Fields for `id`, `restaurant_id`, `category`, `amount`, `expense_date`, and `notes`.
3. **Update Role Constraints:** Modify `profiles` and `staff_invites` constraints: `check (role in ('admin', 'manager'))`.
4. **Update RLS Policies:** Replace all `'owner'` references with `'admin'` and remove `'cashier'` references.

---

## Proposed Implementation Plan (Refactor Roadmap)

### Step 1: Database Migration (Architecture Changes)
- [ ] Rename `owner` to `admin` and drop `cashier` in `profiles` and `staff_invites` check constraints.
- [ ] Update all RLS policies in `supabase/rls.sql` to use `admin` instead of `owner`.
- [ ] Update `create_order_with_inventory_deduction` RPC to reflect the new roles.
- [ ] Create `public.expenses` table and add corresponding RLS policies for `admin`.
- [ ] Simplify `menu_item_ingredients` to a direct consumption mapping (or rename to `inventory_consumption`).

### Step 2: Authentication & Context Fixes
- [ ] Wire up `login/page.tsx` to actually authenticate via Supabase.
- [ ] Update `AuthContext` to fetch the real session and profile from Supabase instead of mock data.
- [ ] Remove the development role switcher from the frontend.

### Step 3: API & Live Data Integration
- [ ] Replace `constants.ts` mock data imports in all dashboards.
- [ ] Build data fetching functions for expenses, sales trends, and top selling items.
- [ ] Fix `PosTerminal.tsx` to use the authenticated `restaurantId` and `cashierId`.

### Step 4: UI/UX Updates
- [ ] Build the new Expense Tracker UI for Admins.
- [ ] Clean up `OwnerProfitDashboard` into `AdminDashboard` with accurate live metrics.
- [ ] Implement the simplified Inventory management screens to assign simple consumption rules to Menu Items.

> [!WARNING]  
> User Review Required: Please review the audit findings and the proposed refactor plan. Let me know if you approve this approach so I can begin Step 1 of the implementation roadmap!
