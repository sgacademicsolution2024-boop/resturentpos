import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { menuItems, restaurant } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

export function MenuCostTable() {
  return (
    <Card className="bg-white/85">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-[#2a1309]">Menu costing table</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {menuItems.map((item) => {
          const lowProfit = item.profitMargin < 45;
          return (
            <article key={item.id} className="rounded-[1.5rem] border border-orange-200 bg-orange-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-[#2a1309]">{item.name}</p>
                  <p className="text-sm font-bold text-[#7a3f1d]/70">{item.category}</p>
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
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-bold text-[#5c2d17]">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Selling</p>
                  <p>{money(item.sellingPrice, restaurant.currency)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Total cost</p>
                  <p>{money(item.totalCost, restaurant.currency)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Profit</p>
                  <p>{money(item.profitPerItem, restaurant.currency)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Margin</p>
                  <p>{item.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
