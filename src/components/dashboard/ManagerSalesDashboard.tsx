"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Package, TrendingUp, Receipt } from "lucide-react";

type DashboardStock = { id: string; name: string; quantity_on_hand: number; reorder_level: number; unit: string };

export function ManagerSalesDashboard() {
  const { restaurantData } = useSettings();
  const { currentUser } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [openOrders, setOpenOrders] = useState(0); // If we support 'open', currently POS does 'paid' directly
  const [lowStock, setLowStock] = useState<DashboardStock[]>([]);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    
    async function loadDashboard() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // 1. Today's Sales & Orders
      const { data: salesData } = await supabase
        .from("daily_sales_summary")
        .select("net_sales, order_count")
        .eq("restaurant_id", currentUser.restaurant_id)
        .eq("sales_date", today)
        .single();
        
      if (salesData) {
        setTodaySales(Number(salesData.net_sales));
        setTodayOrders(Number(salesData.order_count));
      }

      // 2. Open Orders (mock logic since POS saves as 'paid')
      const { count: openCount } = await supabase
        .from("orders")
        .select("*", { count: 'exact', head: true })
        .eq("restaurant_id", currentUser.restaurant_id)
        .eq("status", "open");
        
      setOpenOrders(openCount || 0);

      // 3. Low Stock Alerts
      const { data: invData } = await supabase
        .from("inventory_items")
        .select("id, name, quantity_on_hand, reorder_level, unit")
        .eq("restaurant_id", currentUser.restaurant_id);
        
      if (invData) {
        setLowStock(invData.filter(i => i.quantity_on_hand <= i.reorder_level) as DashboardStock[]);
      }

      setLoading(false);
    }
    
    loadDashboard();
  }, [currentUser, supabase]);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 soft-shadow relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-blue-600/5 opacity-10"></div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:items-center relative z-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Manager Dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl text-slate-900">Daily Operations</h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-500">
              Real-time overview of today&apos;s sales and immediate stock warnings.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-slate-900  text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-900/80">Today&apos;s Sales</p>
            <p className="mt-4 text-4xl font-black">{money(todaySales, restaurantData.currency)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Orders</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{todayOrders}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <Receipt className="h-8 w-8 text-blue-400 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Open Orders</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{openOrders}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <Package className="h-8 w-8 text-red-500 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Low Stock Items</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{lowStock.length}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr]">
        <Card className="bg-white shadow-sm border border-slate-200 border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-slate-900">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-slate-500 font-semibold p-4 text-center">All inventory items are properly stocked.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStock.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm hover:scale-[1.02] transition-transform">
                    <p className="font-black text-red-400">{item.name}</p>
                    <p className="font-semibold text-red-300/70">
                      {item.quantity_on_hand} {item.unit} left (Alert at {item.reorder_level})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
