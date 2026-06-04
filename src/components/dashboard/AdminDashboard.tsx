"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Loader2, TrendingUp, TrendingDown, Receipt, Package } from "lucide-react";

type DashboardOrder = { id: string; bill_number: string; total: number; payment_method: string; profiles?: { full_name: string } };
type DashboardExpense = { id: string; category: string; amount: number; notes: string };
type DashboardStock = { id: string; name: string; quantity_on_hand: number; reorder_level: number; unit: string };

export function AdminDashboard() {
  const { restaurantData } = useSettings();
  const { currentUser } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  
  // KPIs
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<DashboardExpense[]>([]);
  const [lowStock, setLowStock] = useState<DashboardStock[]>([]);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    
    async function loadDashboard() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [salesRes, expRes, ordersRes, recExpRes, invRes] = await Promise.all([
        supabase.from("daily_sales_summary").select("net_sales, order_count").eq("restaurant_id", currentUser.restaurant_id).eq("sales_date", today).single(),
        supabase.from("expenses").select("amount").eq("restaurant_id", currentUser.restaurant_id).eq("expense_date", today),
        supabase.from("orders").select("id, bill_number, total, payment_method, profiles(full_name)").eq("restaurant_id", currentUser.restaurant_id).order("created_at", { ascending: false }).limit(5),
        supabase.from("expenses").select("id, category, amount, notes").eq("restaurant_id", currentUser.restaurant_id).order("created_at", { ascending: false }).limit(5),
        supabase.from("inventory_items").select("id, name, quantity_on_hand, reorder_level, unit").eq("restaurant_id", currentUser.restaurant_id)
      ]);

      if (salesRes.data) {
        setTodaySales(Number(salesRes.data.net_sales));
        setTodayOrders(Number(salesRes.data.order_count));
      }

      if (expRes.data) {
        const totalExp = expRes.data.reduce((sum, e) => sum + Number(e.amount), 0);
        setTodayExpenses(totalExp);
      }

      if (ordersRes.data) {
        setRecentOrders(ordersRes.data as unknown as DashboardOrder[]);
      }

      if (recExpRes.data) {
        setRecentExpenses(recExpRes.data as DashboardExpense[]);
      }

      if (invRes.data) {
        setLowStock(invRes.data.filter(i => i.quantity_on_hand <= i.reorder_level) as DashboardStock[]);
      }

      setLoading(false);
    }
    
    loadDashboard();
  }, [currentUser, supabase]);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  }

  const netRevenue = todaySales - todayExpenses;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 soft-shadow relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-blue-600/5 opacity-10"></div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:items-center relative z-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Admin Dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl text-slate-900">Owner&apos;s Command Center</h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-500">
              High-level overview of net revenue, expenses, and operational alerts.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-slate-900  text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-900/80">Net Revenue (Today)</p>
            <p className="mt-4 text-4xl font-black">{money(netRevenue, restaurantData.currency)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Sales</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{money(todaySales, restaurantData.currency)}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <TrendingDown className="h-8 w-8 text-red-500 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Expenses</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{money(todayExpenses, restaurantData.currency)}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <Receipt className="h-8 w-8 text-blue-400 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Orders</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{todayOrders}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <Package className="h-8 w-8 text-blue-400 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Low Stock Items</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{lowStock.length}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          <Card className="bg-white shadow-sm border border-slate-200 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-slate-900">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-slate-500 font-semibold p-4 text-center">No orders recorded yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-4 text-sm hover:scale-[1.02] hover:bg-slate-50 transition-all cursor-default">
                    <div className="flex justify-between gap-4">
                      <span className="font-black text-slate-900">{order.bill_number}</span>
                      <span className="font-black text-blue-400">{money(order.total, restaurantData.currency)}</span>
                    </div>
                    <p className="mt-1 font-semibold text-slate-500">
                      {order.payment_method?.toUpperCase()} • Cashier: {order.profiles?.full_name || "Unknown"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-white shadow-sm border border-slate-200 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-slate-900">Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentExpenses.length === 0 ? (
                <p className="text-slate-500 font-semibold p-4 text-center">No expenses recorded.</p>
              ) : (
                recentExpenses.map((expense) => (
                  <div key={expense.id} className="rounded-3xl border border-slate-200 bg-white p-4 text-sm hover:scale-[1.02] hover:bg-slate-50 transition-all cursor-default">
                    <div className="flex justify-between gap-4">
                      <span className="font-black text-slate-900">{expense.category}</span>
                      <span className="font-black text-red-400">-{money(expense.amount, restaurantData.currency)}</span>
                    </div>
                    {expense.notes && (
                      <p className="mt-1 font-semibold text-slate-500">{expense.notes}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-slate-200 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-slate-900">Low Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-slate-500 font-semibold p-4 text-center">Stock is healthy.</p>
              ) : (
                lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm hover:scale-[1.02] transition-transform">
                    <p className="font-black text-red-400">{item.name}</p>
                    <p className="font-semibold text-red-300/70">
                      {item.quantity_on_hand} {item.unit} left
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
