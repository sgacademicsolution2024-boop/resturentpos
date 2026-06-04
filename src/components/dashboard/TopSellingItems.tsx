"use client";

import { useEffect, useState } from "react";
import { Flame, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

type TopItem = { name: string; quantitySold: number; revenue: number };

export function TopSellingItems() {
  const { restaurantData } = useSettings();
  const { currentUser } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [topItems, setTopItems] = useState<TopItem[]>([]);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    
    async function fetchTopItems() {
      setLoading(true);
      const { data, error } = await supabase
        .from("order_items")
        .select("item_name, quantity, line_total")
        .eq("restaurant_id", currentUser!.restaurant_id);

      if (!error && data) {
        const map = new Map<string, TopItem>();
        data.forEach((item: any) => {
          const existing = map.get(item.item_name) || { name: item.item_name, quantitySold: 0, revenue: 0 };
          map.set(item.item_name, {
            name: item.item_name,
            quantitySold: existing.quantitySold + item.quantity,
            revenue: existing.revenue + Number(item.line_total)
          });
        });

        const sorted = Array.from(map.values()).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 4);
        setTopItems(sorted);
      }
      setLoading(false);
    }
    fetchTopItems();
  }, [currentUser, supabase]);

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200 border-slate-200 bg-transparent shadow-none h-full min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200 border-slate-200 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-black text-slate-900">
          <Flame className="h-6 w-6 text-blue-500" />
          Top selling items
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topItems.length === 0 ? (
          <p className="text-slate-500 font-semibold p-4 text-center">No sales data yet.</p>
        ) : (
          topItems.map((item, index) => (
            <div key={item.name} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors">
              <div
                className="absolute left-0 top-0 h-full bg-blue-500/10"
                style={{ width: `${100 - index * 15}%` }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-black text-blue-500">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{item.name}</p>
                    <p className="text-xs font-semibold text-slate-500">
                      {item.quantitySold} units sold
                    </p>
                  </div>
                </div>
                <span className="font-black text-green-400">
                  {money(item.revenue, restaurantData.currency)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
