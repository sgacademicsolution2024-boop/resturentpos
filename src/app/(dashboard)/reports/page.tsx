"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { useAuth } from "@/lib/auth-context";
import { RoleGate } from "@/components/auth/RoleGate";
import { useSettings } from "@/lib/settings-context";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Calendar, Wallet, Package, TrendingUp } from "lucide-react";

type DailySales = { sales_date: string; order_count: number; net_sales: number };
type Expense = { expense_date: string; category: string; amount: number; notes: string };
type InventoryItem = { name: string; quantity_on_hand: number; unit: string };
type TopSeller = { name: string; qty: number; total: number };

export default function ReportsPage() {
  const { currentUser, isAdmin } = useAuth();
  const { restaurantData } = useSettings();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  const [sales, setSales] = useState<DailySales[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    loadReports();
  }, [currentUser]);

  async function loadReports() {
    setLoading(true);

    const [salesRes, expRes, invRes, orderItemsRes] = await Promise.all([
      supabase.from("daily_sales_summary").select("sales_date, order_count, net_sales").eq("restaurant_id", currentUser?.restaurant_id).order("sales_date", { ascending: false }).limit(30),
      supabase.from("expenses").select("expense_date, category, amount, notes").eq("restaurant_id", currentUser?.restaurant_id).order("expense_date", { ascending: false }).limit(50),
      supabase.from("inventory_items").select("name, quantity_on_hand, unit").eq("restaurant_id", currentUser?.restaurant_id).order("name"),
      supabase.from("order_items").select("item_name, quantity, line_total").eq("restaurant_id", currentUser?.restaurant_id)
    ]);

    if (salesRes.data) setSales(salesRes.data);
    if (expRes.data) setExpenses(expRes.data);
    if (invRes.data) setInventory(invRes.data);

    if (orderItemsRes.data) {
      const grouped: Record<string, { qty: number, total: number }> = {};
      orderItemsRes.data.forEach((item: Record<string, unknown>) => {
        if (!grouped[String(item.item_name)]) {
          grouped[String(item.item_name)] = { qty: 0, total: 0 };
        }
        grouped[String(item.item_name)].qty += Number(item.quantity);
        grouped[String(item.item_name)].total += Number(item.line_total);
      });

      const sellers = Object.keys(grouped).map(name => ({
        name,
        qty: grouped[name].qty,
        total: grouped[name].total
      })).sort((a, b) => b.qty - a.qty).slice(0, 10);

      setTopSellers(sellers);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <RoleGate allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-5 soft-shadow">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Analytics</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Restaurant Reports</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">Simple, live data tables for sales, expenses, and inventory.</p>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid gap-6 xl:grid-cols-2">
          
          {/* Daily Sales Table */}
          <Card className="bg-white shadow-sm border border-slate-200 border-slate-200 bg-white shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 backdrop-blur-md">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                <Calendar className="h-5 w-5 text-blue-500" />
                Daily Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-w-0 max-h-96">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-blue-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-black sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Orders</th>
                      <th className="px-6 py-4">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {sales.map((day, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-white">
                        <td className="px-6 py-4 font-bold text-slate-900">{new Date(day.sales_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">{day.order_count}</td>
                        <td className="px-6 py-4 font-black text-slate-900">{money(day.net_sales, restaurantData.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Sellers Table */}
          <Card className="bg-white shadow-sm border border-slate-200 border-slate-200 bg-white shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 backdrop-blur-md">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-w-0 max-h-96">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-blue-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-black sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-6 py-4">Item Name</th>
                      <th className="px-6 py-4">Qty Sold</th>
                      <th className="px-6 py-4">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {topSellers.map((item, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-white">
                        <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">{item.qty}</td>
                        <td className="px-6 py-4 font-black text-slate-900">{money(item.total, restaurantData.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Levels Table */}
          <Card className="bg-white shadow-sm border border-slate-200 border-slate-200 bg-white shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 backdrop-blur-md">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                <Package className="h-5 w-5 text-blue-500" />
                Inventory Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-w-0 max-h-96">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-blue-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-black sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-6 py-4">Ingredient</th>
                      <th className="px-6 py-4 text-right">Quantity on Hand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {inventory.map((item, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-white">
                        <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 font-bold text-slate-600 text-right">{item.quantity_on_hand} {item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table (Admin Only) */}
          {isAdmin && (
            <Card className="bg-white shadow-sm border border-slate-200 border-slate-200 bg-white shadow-none overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200 backdrop-blur-md">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                  <Wallet className="h-5 w-5 text-red-500" />
                  Recent Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto min-w-0 max-h-96">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-100 text-blue-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-black sticky top-0 shadow-sm">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {expenses.map((expense, idx) => (
                        <tr key={idx} className="transition-colors hover:bg-white">
                          <td className="px-6 py-4 font-bold text-slate-500">{new Date(expense.expense_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-500/20 text-blue-500 border border-blue-500/20 text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-red-400">
                            {money(expense.amount, restaurantData.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </RoleGate>
  );
}
