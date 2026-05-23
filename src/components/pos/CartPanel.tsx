"use client";

import { useMemo, useRef } from "react";
import { Download, Minus, Plus, Printer, ReceiptText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PaymentPanel } from "@/components/pos/PaymentPanel";
import { BillReceipt } from "@/components/pos/BillReceipt";
import { cashier, restaurant } from "@/lib/constants";
import type { CartItem, PaymentMethod } from "@/lib/types";
import { calculateBill, money, buildBillNumber } from "@/lib/utils/billing";
import { cn } from "@/lib/utils";

type CartPanelProps = {
  cart: CartItem[];
  discount: number;
  paymentMethod: PaymentMethod;
  onDiscountChange: (value: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onQuantityChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onComplete: () => void;
  className?: string;
  hideHeader?: boolean;
};

export function CartPanel({
  cart,
  discount,
  paymentMethod,
  onDiscountChange,
  onPaymentMethodChange,
  onQuantityChange,
  onRemove,
  onComplete,
  className,
  hideHeader
}: CartPanelProps) {
  const totals = calculateBill(cart, discount, restaurant.taxRate);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const billNumber = useMemo(() => buildBillNumber("GFK"), []);

  async function downloadReceipt() {
    if (!receiptRef.current) return;
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      if (imgData === "data:," || imgData.length < 50) {
        throw new Error("Generated canvas is empty. The receipt element might be hidden from the DOM.");
      }
      
      const width = 80;
      const height = (canvas.height * width) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [width, height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${billNumber}-receipt.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF receipt. Please try again.");
    }
  }
  return (
    <Card className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border-orange-300/80 bg-[#fff8e7]", className)}>
      {!hideHeader && (
        <CardHeader className="bg-[#2a1309] text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-200">Current bill</p>
              <CardTitle className="mt-1 text-2xl">Table Order</CardTitle>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">
              <ReceiptText className="h-6 w-6" />
            </div>
          </div>
          <p className="pt-2 text-sm font-semibold text-orange-100/70">Cashier: {cashier.name}</p>
        </CardHeader>
      )}
      <CardContent className="flex flex-1 flex-col p-0 min-h-0">
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-orange-300 bg-white/70 p-6 text-center">
              <p className="text-lg font-black text-[#2a1309]">No items yet</p>
              <p className="mt-1 text-sm font-semibold text-[#7a3f1d]/70">Tap a food card to begin billing.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItem.id} className="rounded-3xl border border-orange-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#2a1309]">{item.menuItem.name}</p>
                    <p className="text-sm font-bold text-[#7a3f1d]/70">
                      {money(item.sellingPriceSnapshot, restaurant.currency)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.menuItem.id)}
                    className="rounded-xl bg-red-50 p-2 text-red-600"
                    aria-label={`Remove ${item.menuItem.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="icon" onClick={() => onQuantityChange(item.menuItem.id, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-8 text-center text-lg font-black">{item.quantity}</span>
                    <Button variant="secondary" size="icon" onClick={() => onQuantityChange(item.menuItem.id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-lg font-black text-[#2a1309]">
                    {money(item.sellingPriceSnapshot * item.quantity, restaurant.currency)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-orange-300/30 bg-[#fff8e7] p-3 sm:p-5 space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3 rounded-3xl bg-orange-100/80 p-3 sm:p-4 text-sm font-bold text-[#4a2311]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(totals.subtotal, restaurant.currency)}</span>
            </div>
            <label className="flex items-center justify-between gap-3">
              <span>Discount</span>
              <input
                className="h-9 sm:h-11 w-24 sm:w-28 rounded-2xl border border-orange-200 bg-white px-3 text-right text-base font-black outline-none focus:ring-2 focus:ring-orange-500"
                type="number"
                min={0}
                value={discount}
                onChange={(event) => onDiscountChange(Number(event.target.value))}
              />
            </label>
            <div className="flex justify-between">
              <span>Tax ({restaurant.taxRate}%)</span>
              <span>{money(totals.tax, restaurant.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-orange-300 pt-2 sm:pt-3 text-xl sm:text-2xl font-black">
              <span>Total</span>
              <span>{money(totals.total, restaurant.currency)}</span>
            </div>
          </div>

          <PaymentPanel value={paymentMethod} onChange={onPaymentMethodChange} />
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="lg" 
              className="col-span-2 min-h-12 sm:min-h-14 text-base sm:text-lg" 
              disabled={cart.length === 0 || !paymentMethod} 
              onClick={onComplete}
            >
              Complete Order
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="min-h-12 sm:min-h-14 text-sm sm:text-base" 
              disabled={cart.length === 0} 
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Print
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="min-h-12 sm:min-h-14 text-sm sm:text-base" 
              disabled={cart.length === 0} 
              onClick={downloadReceipt}
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>

      <BillReceipt
        ref={receiptRef}
        cart={cart}
        discount={discount}
        totals={totals}
        billNumber={billNumber}
        paymentMethod={paymentMethod}
      />
    </Card>
  );
}
