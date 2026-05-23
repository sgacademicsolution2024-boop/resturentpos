import { IndianRupee, ReceiptIndianRupee, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { expenses, menuItems, restaurant, salesTrend } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

export function ProfitLossSummary() {
  const todaySales = salesTrend.at(-1)?.sales ?? 0;
  const todayProfit = salesTrend.at(-1)?.profit ?? 0;
  const todayCost = todaySales - todayProfit;
  const todayExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = todayProfit - todayExpenses;
  const margin = todaySales > 0 ? (todayProfit / todaySales) * 100 : 0;
  const topItem = [...menuItems].sort((a, b) => b.profitPerItem - a.profitPerItem)[0];

  const cards = [
    { label: "Gross profit", value: money(todayProfit, restaurant.currency), icon: TrendingUp },
    { label: "Item costs", value: money(todayCost, restaurant.currency), icon: ReceiptIndianRupee },
    { label: "Expenses", value: money(todayExpenses, restaurant.currency), icon: TrendingDown },
    { label: "Net profit", value: money(netProfit, restaurant.currency), icon: IndianRupee }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="bg-white/85">
            <CardContent className="p-5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-700">{card.label}</p>
              <p className="mt-2 text-3xl font-black text-[#2a1309]">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
      <Card className="bg-[#2a1309] text-white md:col-span-2 xl:col-span-4">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-yellow-200">Profit margin</p>
            <p className="mt-2 text-4xl font-black">{margin.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-yellow-200">Top profitable item</p>
            <p className="mt-2 text-3xl font-black">{topItem?.name}</p>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-yellow-200">Net status</p>
            <p className="mt-2 text-3xl font-black">{netProfit >= 0 ? "Profit" : "Loss"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
