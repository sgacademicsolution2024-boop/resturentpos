"use client";

import { useEffect, useState } from "react";
import { ReceiptText, Edit, Undo2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { money } from "@/lib/utils/billing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";

export default function OrdersPage() {
  const { isAdmin, currentUser } = useAuth();
  const { restaurantData } = useSettings();
  const supabase = createClient();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    
    async function loadOrders() {
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:cashier_id (full_name)
        `)
        .eq("restaurant_id", currentUser?.restaurant_id)
        .order("created_at", { ascending: false });

      if (orders) {
        setRecentOrders(orders.map(order => ({
          id: order.id,
          restaurantId: order.restaurant_id,
          billNumber: order.bill_number,
          cashierName: order.profiles?.full_name || "Unknown",
          status: order.status,
          paymentMethod: order.payment_method || "cash",
          subtotal: Number(order.subtotal),
          discount: Number(order.discount),
          tax: Number(order.tax),
          total: Number(order.total),
          totalCost: Number(order.total_cost),
          grossProfit: Number(order.gross_profit),
          createdAt: order.created_at
        })));
      }
      setLoading(false);
    }
    loadOrders();
  }, [currentUser, supabase]);

  async function handleRefund(orderId: string) {
    if (!confirm("Are you sure you want to refund/void this bill?")) return;
    const { error } = await supabase.from("orders").update({ status: "void" }).eq("id", orderId);
    if (!error) {
      setRecentOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "void" } : o));
    } else {
      alert("Failed to void bill: " + error.message);
    }
  }



  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white shadow-sm border border-slate-200 p-5 soft-shadow">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Bill history</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Orders</h1>
        <p className="mt-2 text-base font-semibold text-slate-500">Review bills, payment methods, and saved order summaries.</p>
      </div>

      <Card className="overflow-hidden bg-white shadow-sm border border-slate-200 border-slate-200 bg-transparent shadow-none">
        <CardHeader className="bg-black/50 border-b border-slate-200 backdrop-blur-md text-slate-900">
          <CardTitle className="text-2xl font-black">Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 font-semibold col-span-full">No orders found.</p>
          ) : (
            recentOrders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-500">{order.billNumber}</p>
                        {order.status === 'void' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-widest">Voided</span>}
                      </div>
                      <p className={`mt-2 text-3xl font-black ${order.status === 'void' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{money(order.total, restaurantData.currency)}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-500 shadow-sm">
                      <ReceiptText className="h-6 w-6" />
                    </div>
                  </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-sm font-bold text-slate-900">
                  <div className="rounded-2xl bg-white border border-slate-200 p-3">
                    <p className="text-slate-500">Cashier</p>
                    <p>{order.cashierName}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-3">
                    <p className="text-slate-500">Payment</p>
                    <p>{order.paymentMethod.toUpperCase()}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-3">
                    <p className="text-slate-500">Cost</p>
                    <p>{money(order.totalCost, restaurantData.currency)}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-3">
                    <p className="text-slate-500">Gross profit</p>
                    <p>{money(order.grossProfit, restaurantData.currency)}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-sm font-semibold text-zinc-500">{new Date(order.createdAt).toLocaleString()}</p>
                  {isAdmin && order.status !== 'void' && (
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="h-8 shadow-none" onClick={() => alert("Edit Bill: Coming Soon")}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="danger" size="sm" className="h-8 shadow-none bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={() => handleRefund(order.id)}>
                        <Undo2 className="h-4 w-4 mr-1" /> Refund
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
        </CardContent>
      </Card>
    </div>
  );
}
