"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { restaurant, salesTrend } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

export function SalesChart() {
  return (
    <Card className="overflow-hidden bg-white/85">
      <CardHeader>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-700">Sales Chart</p>
        <CardTitle className="text-2xl font-black text-[#2a1309]">Weekly sales volume</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f2c18f" vertical={false} />
            <XAxis dataKey="day" stroke="#7c3a18" tickLine={false} axisLine={false} />
            <YAxis
              stroke="#7c3a18"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${restaurant.currency}${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "rgba(251, 146, 60, 0.12)" }}
              formatter={(value: number, name) =>
                [money(value, restaurant.currency), name === "sales" ? "Sales" : name]
              }
              contentStyle={{
                borderRadius: 18,
                border: "1px solid #fed7aa",
                boxShadow: "0 18px 38px rgba(124,58,18,.18)"
              }}
            />
            <Bar dataKey="sales" fill="#ea580c" radius={[14, 14, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
