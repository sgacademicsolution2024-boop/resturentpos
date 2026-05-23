import { ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { recentOrders, restaurant } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

export default function OrdersPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-5 soft-shadow">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Bill history</p>
        <h1 className="mt-1 text-3xl font-black text-[#2a1309]">Orders</h1>
        <p className="mt-2 text-base font-semibold text-[#7a3f1d]/70">Review bills, payment methods, and saved order summaries.</p>
      </div>

      <Card className="overflow-hidden bg-white/85">
        <CardHeader className="bg-[#2a1309] text-white">
          <CardTitle className="text-2xl font-black">Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recentOrders.map((order) => (
            <article key={order.id} className="rounded-[1.75rem] border border-orange-200 bg-orange-50/70 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-700">{order.billNumber}</p>
                  <p className="mt-2 text-3xl font-black text-[#2a1309]">{money(order.total, restaurant.currency)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                  <ReceiptText className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm font-bold text-[#5c2d17]">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Cashier</p>
                  <p>{order.cashierName}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Payment</p>
                  <p>{order.paymentMethod.toUpperCase()}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Cost</p>
                  <p>{money(order.totalCost, restaurant.currency)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[#7a3f1d]/60">Gross profit</p>
                  <p>{money(order.grossProfit, restaurant.currency)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#7a3f1d]/70">{new Date(order.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
