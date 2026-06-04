import { useEffect, useState } from "react";
import { IndianRupee, ReceiptIndianRupee, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";

export function ProfitLossSummary() {
  const { currentUser } = useAuth();
  const { restaurantData } = useSettings();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    sales: 0,
    cogs: 0,
    expenses: 0,
    profit: 0
  });
  const [topItem, setTopItem] = useState<{ name: string; profit: number } | null>(null);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    
    async function loadData() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch daily summary from RPC
      const { data: profitData, error: profitError } = await supabase
        .rpc("get_daily_profit_loss", {
          p_restaurant_id: currentUser?.restaurant_id,
          p_date: today
        });

      if (!profitError && profitData && profitData.length > 0) {
        setSummary({
          sales: Number(profitData[0].total_sales || 0),
          cogs: Number(profitData[0].total_cogs || 0),
          expenses: Number(profitData[0].total_expenses || 0),
          profit: Number(profitData[0].net_profit || 0)
        });
      }

      // Fetch top profitable item from view
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_item_cost_view")
        .select("name, selling_price, total_cost")
        .eq("restaurant_id", currentUser?.restaurant_id);

      if (!itemsError && itemsData && itemsData.length > 0) {
        let bestItem = itemsData[0];
        let bestProfit = Number(bestItem.selling_price) - Number(bestItem.total_cost);
        
        for (const item of itemsData) {
          const p = Number(item.selling_price) - Number(item.total_cost);
          if (p > bestProfit) {
            bestProfit = p;
            bestItem = item;
          }
        }
        
        if (bestItem) {
          setTopItem({ name: bestItem.name, profit: bestProfit });
        }
      }

      setLoading(false);
    }
    
    loadData();
  }, [currentUser, supabase]);

  const margin = summary.sales > 0 ? (summary.profit / summary.sales) * 100 : 0;

  const cards = [
    { label: "Gross profit", value: money(summary.sales - summary.cogs, restaurantData.currency), icon: TrendingUp },
    { label: "Item costs", value: money(summary.cogs, restaurantData.currency), icon: ReceiptIndianRupee },
    { label: "Expenses", value: money(summary.expenses, restaurantData.currency), icon: TrendingDown },
    { label: "Net profit", value: money(summary.profit, restaurantData.currency), icon: IndianRupee }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 relative min-h-[160px]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="bg-white">
            <CardContent className="p-5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-red-500 text-slate-900">
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-700">{card.label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
      <Card className="bg-slate-950 text-slate-900 md:col-span-2 xl:col-span-4">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-300">Profit margin</p>
            <p className="mt-2 text-4xl font-black">{margin.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-300">Top profitable item</p>
            <p className="mt-2 text-3xl font-black">{topItem?.name}</p>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-300">Net status</p>
            <p className="mt-2 text-3xl font-black">{summary.profit >= 0 ? "Profit" : "Loss"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
