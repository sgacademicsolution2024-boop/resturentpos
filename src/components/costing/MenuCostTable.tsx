import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";

type MenuItemCost = {
  menu_item_id: string;
  name: string;
  category: string;
  selling_price: number;
  total_cost: number;
  profit: number;
  margin: number;
};

export function MenuCostTable() {
  const { currentUser } = useAuth();
  const { restaurantData } = useSettings();
  const supabase = createClient();
  const [items, setItems] = useState<MenuItemCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;

    async function loadCosts() {
      setLoading(true);
      // We join with menu_items to get the category if needed, but menu_item_cost_view just gives us the raw items.
      const { data, error } = await supabase
        .from("menu_item_cost_view")
        .select(`*, menu_items!inner(category_id, menu_categories(name))`)
        .eq("restaurant_id", currentUser?.restaurant_id);

      if (!error && data) {
        const formatted = data.map((d: any) => {
          const sellingPrice = Number(d.selling_price) || 0;
          const totalCost = Number(d.total_cost) || 0;
          const profit = sellingPrice - totalCost;
          const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
          
          return {
            menu_item_id: d.menu_item_id,
            name: d.name,
            category: d.menu_items?.menu_categories?.name || "Uncategorized",
            selling_price: sellingPrice,
            total_cost: totalCost,
            profit,
            margin
          };
        });
        setItems(formatted);
      }
      setLoading(false);
    }
    loadCosts();
  }, [currentUser, supabase]);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-slate-900">Menu costing table</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
        {items.map((item) => {
          const lowProfit = item.margin < 45;
          return (
            <article key={item.menu_item_id} className="rounded-[1.5rem] border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-slate-900">{item.name}</p>
                  <p className="text-sm font-bold text-slate-300/70">{item.category}</p>
                </div>
                {lowProfit ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Low profit
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">Healthy</span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-bold text-slate-400">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-slate-300/60">Selling</p>
                  <p>{money(item.selling_price, restaurantData.currency)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-slate-300/60">Total cost</p>
                  <p>{money(item.total_cost, restaurantData.currency)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-slate-300/60">Profit</p>
                  <p>{money(item.profit, restaurantData.currency)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-slate-300/60">Margin</p>
                  <p>{item.margin.toFixed(1)}%</p>
                </div>
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
