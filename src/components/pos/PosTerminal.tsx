"use client";

import { useState } from "react";
import { Flame, ShoppingCart, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CartPanel } from "@/components/pos/CartPanel";
import { MenuGrid } from "@/components/pos/MenuGrid";
import type { CartItem, MenuItem, PaymentMethod } from "@/lib/types";
import { calculateBill, money } from "@/lib/utils/billing";
import { restaurant } from "@/lib/constants";

export function PosTerminal() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [message, setMessage] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const totals = calculateBill(cart, discount, restaurant.taxRate);

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

  function completeOrder() {
    setCart([]);
    setDiscount(0);
    setCartOpen(false);
    setMessage(
      `Demo order completed with ${paymentMethod.toUpperCase()} payment. Gross profit: ${money(totals.grossProfit, restaurant.currency)}.`
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden space-y-5 pb-5">
      <section className="overflow-hidden rounded-[2rem] border border-orange-300/70 bg-[#2a1309] text-white soft-shadow">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-yellow-200">
              <Sparkles className="h-4 w-4" />
              Gaan Fun Khaan billing counter
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Fast food orders, warm staff flow.</h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-orange-100/70">
              Big menu buttons, simple bill controls, and mock order data ready to connect to Supabase later.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-gradient-to-br from-yellow-300 to-orange-500 p-5 text-[#2a1309] shadow-xl shadow-black/20">
            <Flame className="h-8 w-8" />
            <p className="mt-8 text-sm font-black uppercase tracking-[0.18em]">Kitchen pace</p>
            <p className="text-3xl font-black">Live</p>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-3xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-black text-green-800">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 pb-28 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:pb-0">
        <MenuGrid
          activeCategory={activeCategory}
          search={search}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearch}
          onAdd={addItem}
        />
        <aside className="hidden xl:flex w-full shrink-0 sticky top-4 h-[calc(100vh-2rem)]">
          <CartPanel
            className="w-full h-full"
            cart={cart}
            discount={discount}
            paymentMethod={paymentMethod}
            onDiscountChange={setDiscount}
            onPaymentMethodChange={setPaymentMethod}
            onQuantityChange={changeQuantity}
            onRemove={(id) => setCart((current) => current.filter((item) => item.menuItem.id !== id))}
            onComplete={completeOrder}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-200 bg-[#fff8e7]/95 p-3 shadow-[0_-10px_40px_rgba(124,58,18,0.15)] backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700">{cart.length} items</p>
            <p className="text-xl font-black text-[#2a1309]">{money(totals.total, restaurant.currency)}</p>
          </div>
          <Button size="lg" className="min-h-14 min-w-[140px] shadow-lg shadow-orange-900/20" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart
          </Button>
        </div>
      </div>

      {cartOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity xl:hidden">
          <button className="absolute inset-0 h-full w-full cursor-default" type="button" onClick={() => setCartOpen(false)} aria-label="Close cart" />
          <div className="relative mt-24 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[2.5rem] bg-[#fff8e7] shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex shrink-0 items-center justify-between border-b border-orange-200/60 p-5">
              <h2 className="text-xl font-black text-[#2a1309]">Your Order</h2>
              <Button variant="secondary" size="icon" className="rounded-full bg-white shadow-sm" onClick={() => setCartOpen(false)} aria-label="Close cart">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col min-h-0 p-2">
              <CartPanel
                className="w-full h-full border-0 bg-transparent shadow-none"
                cart={cart}
                discount={discount}
                paymentMethod={paymentMethod}
                onDiscountChange={setDiscount}
                onPaymentMethodChange={setPaymentMethod}
                onQuantityChange={changeQuantity}
                onRemove={(id) => setCart((current) => current.filter((item) => item.menuItem.id !== id))}
                onComplete={completeOrder}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
