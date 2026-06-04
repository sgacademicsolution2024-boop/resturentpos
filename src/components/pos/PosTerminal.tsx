"use client";

import { useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CartPanel } from "@/components/pos/CartPanel";
import { MenuGrid } from "@/components/pos/MenuGrid";
import type { CartItem, MenuItem, PaymentMethod } from "@/lib/types";
import { calculateBill, money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";
import { useAuth } from "@/lib/auth-context";

export function PosTerminal() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [cartOpen, setCartOpen] = useState(false);
  const { restaurantData } = useSettings();
  const { currentUser } = useAuth();
  const totals = calculateBill(cart, discount, restaurantData.taxRate);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function addItem(menuItem: MenuItem) {
    setMessage("");
    setCart((current) => {
      const existing = current.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return current.map((item) =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...current,
        {
          menuItem,
          quantity: 1,
          itemNameSnapshot: menuItem.name,
          sellingPriceSnapshot: menuItem.sellingPrice,
          costPriceSnapshot: menuItem.totalCost,
          profitSnapshot: menuItem.profitPerItem
        }
      ];
    });
  }

  function changeQuantity(id: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => (item.menuItem.id === id ? { ...item, quantity: Math.max(item.quantity + delta, 0) } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  async function completeOrder() {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const { createOrderWithInventoryDeduction } = await import("@/lib/supabase/orders");
      
      const result = await createOrderWithInventoryDeduction({
        restaurantId: currentUser?.restaurant_id || "",
        cashierId: currentUser?.id || "",
        paymentMethod: paymentMethod,
        discount: discount,
        tax: totals.tax,
        cart: cart
      });

      setCart([]);
      setDiscount(0);
      setCartOpen(false);
      setMessageType("success");
      setMessage(
        `Order ${result.billNumber} completed! Payment: ${paymentMethod.toUpperCase()}.`
      );
    } catch (err) {
      console.error("Failed to complete order:", err);
      setMessageType("error");
      setMessage("Failed to complete order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden space-y-5 pb-5 w-full max-w-full relative">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 xl:hidden mb-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase">Today&apos;s Sales</p>
          <p className="text-xl font-black text-slate-900 mt-1">{money(0, restaurantData.currency)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase">Today&apos;s Orders</p>
          <p className="text-xl font-black text-slate-900 mt-1">0</p>
        </div>
      </div>

      {message ? (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-xl border px-6 py-4 text-sm font-black shadow-lg animate-in slide-in-from-top-4 fade-in duration-300 ${
          messageType === "success" 
            ? "border-green-200 bg-green-50 text-green-700 shadow-green-900/10" 
            : "border-red-200 bg-red-50 text-red-700 shadow-red-900/10"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full animate-pulse ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
            {message}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col xl:flex-row gap-5 pb-28 xl:items-start xl:pb-0 min-w-0 w-full">
        <div className="flex-1 min-w-0">
          <MenuGrid
            activeCategory={activeCategory}
            search={search}
            onCategoryChange={setActiveCategory}
            onSearchChange={setSearch}
            onAdd={addItem}
          />
        </div>
        <aside className="hidden xl:flex w-[400px] shrink-0 sticky top-24 h-[calc(100vh-7rem)] z-10">
          <CartPanel
            className="w-full h-full bg-white border border-slate-200 rounded-2xl shadow-sm"
            cart={cart}
            discount={discount}
            paymentMethod={paymentMethod}
            onDiscountChange={setDiscount}
            onPaymentMethodChange={setPaymentMethod}
            onQuantityChange={changeQuantity}
            onRemove={(id) => setCart((current) => current.filter((item) => item.menuItem.id !== id))}
            onComplete={completeOrder}
            isSubmitting={isSubmitting}
            cashierName={currentUser?.full_name || "Staff"}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] xl:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{cart.length} items</p>
            <p className="text-xl font-black text-slate-900">{money(totals.total, restaurantData.currency)}</p>
          </div>
          <Button size="lg" className="min-h-[56px] min-w-[140px]" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart
          </Button>
        </div>
      </div>

      {cartOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-in slide-in-from-bottom-full duration-300 xl:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-4 bg-white text-slate-900">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Current bill</p>
              <h2 className="mt-1 text-xl font-black">Your Order</h2>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-500" onClick={() => setCartOpen(false)} aria-label="Close cart">
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-1 flex-col min-h-0 bg-slate-50">
            <CartPanel
              className="w-full h-full border-0 shadow-none rounded-none bg-white"
              hideHeader={true}
              cart={cart}
              discount={discount}
              paymentMethod={paymentMethod}
              onDiscountChange={setDiscount}
              onPaymentMethodChange={setPaymentMethod}
              onQuantityChange={changeQuantity}
              onRemove={(id) => setCart((current) => current.filter((item) => item.menuItem.id !== id))}
              onComplete={completeOrder}
              isSubmitting={isSubmitting}
              cashierName={currentUser?.full_name || "Staff"}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
