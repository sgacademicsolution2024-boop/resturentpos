"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

type ChartData = { day: string; sales: number };

export function SalesChart() {
  const { restaurantData } = useSettings();
  const { currentUser } = useAuth();
  const supabase = createClient();
  const [salesTrend, setSalesTrend] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;

    async function loadSales() {
      setLoading(true);
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 6);
      const startDate = lastWeek.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_sales_summary')
        .select('sales_date, net_sales')
        .eq('restaurant_id', currentUser!.restaurant_id)
        .gte('sales_date', startDate)
        .order('sales_date', { ascending: true });

      if (!error) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = [];
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayName = days[d.getDay()];
          
          const row = data?.find((x: any) => x.sales_date === dateStr);
          chartData.push({
            day: dayName,
            sales: row ? Number(row.net_sales) : 0
          });
        }
        setSalesTrend(chartData);
      }
      setLoading(false);
    }
    
    loadSales();
  }, [currentUser, supabase]);

  if (loading) {
    return (
      <Card className="glass-panel border-white/10 bg-transparent shadow-none h-full min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-white/10 bg-transparent shadow-none h-full">
      <CardHeader>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-500">Sales Chart</p>
        <CardTitle className="text-2xl font-black text-white">Weekly sales volume</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="day" stroke="#a1a1aa" tickLine={false} axisLine={false} />
            <YAxis
              stroke="#a1a1aa"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${restaurantData.currency}${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "rgba(249, 115, 22, 0.12)" }}
              formatter={(value: number, name) =>
                [money(value, restaurantData.currency), name === "sales" ? "Sales" : name]
              }
              contentStyle={{
                backgroundColor: "rgba(9, 9, 11, 0.8)",
                borderRadius: 18,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 18px 38px rgba(0,0,0,0.4)",
                color: "white"
              }}
            />
            <Bar dataKey="sales" fill="url(#colorSales)" radius={[14, 14, 0, 0]} />
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
