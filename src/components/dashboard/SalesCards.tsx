"use client";

import { useEffect, useState } from "react";
import { Crown, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

export function SalesCards() {
  const { restaurantData } = useSettings();
  const { currentUser } = useAuth();
  const supabase = createClient();
  
  const [salesData, setSalesData] = useState({
    today: 0,
    weekly: 0,
    monthly: 0
  });

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    
    async function fetchSales() {
      // Calculate dates
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString().split('T')[0];

      const lastMonth = new Date(now);
      lastMonth.setDate(lastMonth.getDate() - 30);
      const lastMonthStr = lastMonth.toISOString().split('T')[0];

      // Fetch from daily_sales_summary
      const { data, error } = await supabase
        .from('daily_sales_summary')
        .select('sales_date, net_sales')
        .eq('restaurant_id', currentUser?.restaurant_id)
        .gte('sales_date', lastMonthStr);

      if (data && !error) {
        let today = 0;
        let weekly = 0;
        let monthly = 0;
        
        data.forEach(row => {
          const sales = Number(row.net_sales);
          monthly += sales;
          
          if (row.sales_date >= lastWeekStr) {
            weekly += sales;
          }
          
          if (row.sales_date === todayStr) {
            today += sales;
          }
        });
        
        setSalesData({ today, weekly, monthly });
      }
    }
    
    fetchSales();
  }, [currentUser, supabase]);

  const cards = [
    { label: "Today Sales", value: money(salesData.today, restaurantData.currency), icon: IndianRupee, tone: "from-blue-500 to-blue-600" },
    { label: "Weekly Sales", value: money(salesData.weekly, restaurantData.currency), icon: IndianRupee, tone: "from-blue-500 to-blue-600" },
    { label: "Monthly Sales", value: money(salesData.monthly, restaurantData.currency), icon: Crown, tone: "from-blue-500 to-blue-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="glass-panel border-white/10 overflow-hidden hover:scale-[1.02] transition-transform">
            <CardContent className="p-5">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${card.tone} text-white shadow-lg shadow-blue-900/20`}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-500">{card.label}</p>
              <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
