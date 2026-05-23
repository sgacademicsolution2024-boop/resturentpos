import type { CartItem } from "@/lib/types";

export type BillTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
};

export function money(value: number, currency = "$") {
  return `${currency}${value.toFixed(2)}`;
}

export function calculateBill(cart: CartItem[], discount = 0, taxRate = 10): BillTotals {
  const subtotal = cart.reduce((sum, item) => sum + item.sellingPriceSnapshot * item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.costPriceSnapshot * item.quantity, 0);
  const discounted = Math.max(subtotal - discount, 0);
  const tax = discounted * (taxRate / 100);
  const grossProfit = discounted - totalCost;
  const profitMargin = discounted > 0 ? (grossProfit / discounted) * 100 : 0;

  return {
    subtotal,
    discount,
    tax,
    total: discounted + tax,
    totalCost,
    grossProfit,
    profitMargin
  };
}

export function buildBillNumber(prefix = "GFK") {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${day}-${suffix}`;
}
