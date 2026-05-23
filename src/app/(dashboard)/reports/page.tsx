"use client";

import { useState } from "react";
import { IndianRupee, Receipt, TrendingUp, Wallet, ArrowDownRight, ArrowUpRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { expenses, salesTrend } from "@/lib/constants";
import { money } from "@/lib/utils/billing";
import { useAuth } from "@/lib/auth-context";
import { RoleGate } from "@/components/auth/RoleGate";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { isOwner } = useAuth();
  const { restaurantData } = useSettings();
  const [timeframe, setTimeframe] = useState("week");

  // Mock multiplier to simulate dynamic data based on timeframe
  const multiplier = timeframe === "today" ? 0.14 : timeframe === "week" ? 1 : timeframe === "month" ? 4.3 : 52;

  const total = salesTrend.reduce((sum, day) => sum + day.sales, 0) * multiplier;
  const profit = salesTrend.reduce((sum, day) => sum + day.profit, 0) * multiplier;
  const orders = Math.floor(salesTrend.reduce((sum, day) => sum + day.orders, 0) * multiplier);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0) * (multiplier / 4);

  const stats = [
    { label: "Total Revenue", value: money(total, restaurantData.currency), icon: IndianRupee, tone: "from-orange-500 to-red-500", trend: "+12.5%", positive: true },
    { label: "Total Orders", value: orders.toLocaleString(), icon: Receipt, tone: "from-blue-500 to-indigo-500", trend: "+8.2%", positive: true },
    { label: "Average Ticket", value: money(total / orders, restaurantData.currency), icon: TrendingUp, tone: "from-emerald-400 to-teal-500", trend: "+2.1%", positive: true },
  ];

  if (isOwner) {
    stats.splice(1, 0, 
      { label: "Gross Profit", value: money(profit, restaurantData.currency), icon: Wallet, tone: "from-yellow-400 to-orange-500", trend: "+14.3%", positive: true },
      { label: "Total Expenses", value: money(expenseTotal, restaurantData.currency), icon: ArrowDownRight, tone: "from-rose-400 to-red-500", trend: "-1.5%", positive: false }
    );
  }

  const timeframes = [
    { id: "today", label: "Today" },
    { id: "week", label: "7 Days" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];

  return (
    <RoleGate allowedRoles={["owner", "manager"]}>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[2rem] border border-orange-200/70 bg-white/75 p-5 soft-shadow">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Analytics</p>
            <h1 className="mt-1 text-3xl font-black text-[#2a1309]">Sales & Performance</h1>
            <p className="mt-2 text-sm font-semibold text-[#7a3f1d]/70">Monitor your restaurant&apos;s financial pulse in real-time.</p>
          </div>
          
          <div className="flex items-center gap-1 rounded-2xl bg-orange-100/50 p-1 border border-orange-200">
            {timeframes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300",
                  timeframe === t.id 
                    ? "bg-white text-orange-700 shadow-sm" 
                    : "text-[#7a3f1d]/60 hover:text-[#7a3f1d] hover:bg-orange-50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className={cn("grid gap-4", isOwner ? "md:grid-cols-5" : "md:grid-cols-3")}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="overflow-hidden bg-white/85 border-transparent shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner",
                      stat.tone
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                      stat.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-[#7a3f1d]/70">{stat.label}</p>
                    <p className="mt-1 text-2xl font-black text-[#2a1309] truncate">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chart Section */}
        <div className="rounded-[2rem] bg-white/85 p-2 shadow-sm border border-orange-100/50">
          <SalesChart />
        </div>

        {/* Data Tables */}
        <div className="grid gap-6 xl:grid-cols-2">
          
          {/* Daily Sales Table */}
          <Card className="bg-white/85 overflow-hidden border-orange-200/50">
            <CardHeader className="bg-orange-50/50 border-b border-orange-100">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-[#2a1309]">
                <Calendar className="h-5 w-5 text-orange-500" />
                {isOwner ? "Daily Revenue & Profit" : "Daily Revenue Breakdown"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white text-[#7a3f1d]/80 uppercase tracking-wider text-[10px] font-black">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Orders</th>
                      <th className="px-6 py-4">Revenue</th>
                      {isOwner && <th className="px-6 py-4">Profit</th>}
                      {isOwner && <th className="px-6 py-4">Margin</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {salesTrend.map((day) => (
                      <tr key={day.day} className="transition-colors hover:bg-orange-50/50 group">
                        <td className="px-6 py-4 font-bold text-[#2a1309] group-hover:text-orange-700 transition-colors">{day.day}</td>
                        <td className="px-6 py-4 font-bold text-[#7a3f1d]/80">{day.orders}</td>
                        <td className="px-6 py-4 font-black text-[#2a1309]">{money(day.sales, restaurantData.currency)}</td>
                        {isOwner && (
                          <td className="px-6 py-4 font-black text-green-700">{money(day.profit, restaurantData.currency)}</td>
                        )}
                        {isOwner && (
                          <td className="px-6 py-4">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                              {((day.profit / day.sales) * 100).toFixed(1)}%
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table (Owner Only) */}
          {isOwner && (
            <Card className="bg-white/85 overflow-hidden border-orange-200/50">
              <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-[#2a1309]">
                  <Wallet className="h-5 w-5 text-red-500" />
                  Recent Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto min-w-0">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white text-[#7a3f1d]/80 uppercase tracking-wider text-[10px] font-black">
                      <tr>
                        <th className="px-6 py-4">Expense Item</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="transition-colors hover:bg-orange-50/50 group">
                          <td className="px-6 py-4 font-bold text-[#2a1309] group-hover:text-orange-700 transition-colors">{expense.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-orange-100 text-[#7a3f1d] text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#7a3f1d]/70">{expense.expenseDate}</td>
                          <td className="px-6 py-4 font-black text-red-600 text-right">
                            {money(expense.amount, restaurantData.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </RoleGate>
  );
}
