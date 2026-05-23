"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { expenses, restaurant, salesTrend } from "@/lib/constants";
import { money } from "@/lib/utils/billing";
import { useAuth } from "@/lib/auth-context";
import { RoleGate } from "@/components/auth/RoleGate";

export default function ReportsPage() {
  const { isOwner } = useAuth();
  
  const total = salesTrend.reduce((sum, day) => sum + day.sales, 0);
  const profit = salesTrend.reduce((sum, day) => sum + day.profit, 0);
  const orders = salesTrend.reduce((sum, day) => sum + day.orders, 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    ["Week sales", money(total, restaurant.currency)],
    ["Week orders", orders],
    ["Average ticket", money(total / orders, restaurant.currency)]
  ];

  if (isOwner) {
    stats.splice(1, 0, 
      ["Gross profit", money(profit, restaurant.currency)],
      ["Net profit", money(profit - expenseTotal, restaurant.currency)],
      ["Expenses", money(expenseTotal, restaurant.currency)]
    );
  }

  return (
    <RoleGate allowedRoles={["owner", "manager"]}>
      <div className="space-y-5">
        <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-5 soft-shadow">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Restaurant reports</p>
          <h1 className="mt-1 text-3xl font-black text-[#2a1309]">Sales reports</h1>
          <p className="mt-2 text-base font-semibold text-[#7a3f1d]/70">Daily summary data mirrors the future Supabase summary table.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(([label, value]) => (
            <Card key={label.toString()} className="bg-white/85">
              <CardContent className="p-5">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-700">{label}</p>
                <p className="mt-3 text-3xl font-black text-[#2a1309]">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <SalesChart />

        <Card className="bg-white/85">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#2a1309]">
              {isOwner ? "Daily sales and profit summary" : "Daily sales summary"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {salesTrend.map((day) => (
              <div key={day.day} className="rounded-3xl border border-orange-200 bg-orange-50/70 p-4">
                <p className="text-xl font-black text-[#2a1309]">{day.day}</p>
                <p className="mt-2 text-sm font-bold text-[#7a3f1d]/70">
                  {money(day.sales, restaurant.currency)} across {day.orders} orders
                </p>
                {isOwner && (
                  <p className="mt-1 text-sm font-black text-green-700">
                    Profit {money(day.profit, restaurant.currency)}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-[#2a1309]">Expense tracking</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="rounded-3xl border border-orange-200 bg-orange-50/70 p-4">
                  <p className="text-lg font-black text-[#2a1309]">{expense.name}</p>
                  <p className="mt-1 text-sm font-bold capitalize text-[#7a3f1d]/70">{expense.category}</p>
                  <p className="mt-3 text-2xl font-black text-orange-700">{money(expense.amount, restaurant.currency)}</p>
                  <p className="mt-1 text-xs font-bold text-[#7a3f1d]/60">{expense.expenseDate}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGate>
  );
}
