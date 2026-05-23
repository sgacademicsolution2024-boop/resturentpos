"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SalesCards } from "@/components/dashboard/SalesCards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopSellingItems } from "@/components/dashboard/TopSellingItems";
import { inventoryItems, recentOrders } from "@/lib/constants";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";

export function ManagerSalesDashboard() {
  const { restaurantData } = useSettings();
  const lowStock = inventoryItems.filter((item) => item.quantityOnHand <= item.reorderLevel);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-orange-300/70 bg-[#2a1309] text-white soft-shadow">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-200">Manager Dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Gaan Fun Khaan control room</h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-orange-100/70">
              Sales volume, low stock alerts, and recent orders in one colorful restaurant workspace.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-gradient-to-br from-yellow-300 to-orange-500 p-5 text-[#2a1309]">
            <p className="text-sm font-black uppercase tracking-[0.18em]">Today</p>
            <p className="mt-8 text-4xl font-black">171 orders</p>
          </div>
        </div>
      </section>

      <SalesCards />

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <SalesChart />
        <div className="space-y-5">
          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-[#2a1309]">Low stock alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.map((item) => (
                <div key={item.id} className="rounded-3xl bg-red-50 p-4 text-sm">
                  <p className="font-black text-red-800">{item.name}</p>
                  <p className="font-semibold text-red-700/70">
                    {item.quantityOnHand} {item.unit} left; reorder at {item.reorderLevel}.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-[#2a1309]">Recent orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-orange-200 bg-orange-50/60 p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="font-black text-[#2a1309]">{order.billNumber}</span>
                    <span className="font-black text-orange-700">{money(order.total, restaurantData.currency)}</span>
                  </div>
                  <p className="mt-1 font-semibold text-[#7a3f1d]/70">
                    {order.paymentMethod.toUpperCase()} by {order.cashierName}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <TopSellingItems />
        </div>
      </div>
    </div>
  );
}
