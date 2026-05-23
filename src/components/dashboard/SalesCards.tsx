import { Crown, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { restaurant, salesTrend } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

export function SalesCards() {
  const today = salesTrend.at(-1) ?? { sales: 0, profit: 0, orders: 0 };
  const weeklySales = salesTrend.reduce((sum, day) => sum + day.sales, 0);
  const monthlySales = weeklySales * 4;

  const cards = [
    { label: "Today Sales", value: money(today.sales, restaurant.currency), icon: IndianRupee, tone: "from-orange-500 to-red-500" },
    { label: "Weekly Sales", value: money(weeklySales, restaurant.currency), icon: IndianRupee, tone: "from-orange-500 to-red-500" },
    { label: "Monthly Sales", value: money(monthlySales, restaurant.currency), icon: Crown, tone: "from-yellow-400 to-orange-500" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="overflow-hidden bg-white/85">
            <CardContent className="p-5">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${card.tone} text-white shadow-lg shadow-orange-900/20`}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-700">{card.label}</p>
              <p className="mt-2 text-3xl font-black text-[#2a1309]">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
