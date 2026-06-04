"use client";

import { useMemo, useRef } from "react";
import { Download, Minus, Plus, Printer, ReceiptText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PaymentPanel } from "@/components/pos/PaymentPanel";
import { BillReceipt } from "@/components/pos/BillReceipt";
import { useSettings } from "@/lib/settings-context";
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
  isSubmitting?: boolean;
  cashierName: string;
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
  hideHeader,
  isSubmitting,
  cashierName
}: CartPanelProps) {
  const { restaurantData } = useSettings();
  const totals = calculateBill(cart, discount, restaurantData.taxRate);
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
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById("bill-receipt");
          if (el) {
            el.style.position = "relative";
            el.style.left = "0";
            el.style.top = "0";
            el.className = el.className.replace("-left-[9999px]", "");
          }
        }
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
    <Card className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem]", className)}>
      {!hideHeader && (
        <CardHeader className="bg-white text-slate-900 shrink-0 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">Current bill</p>
              <CardTitle className="mt-1 text-2xl">Table Order</CardTitle>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-900/20">
              <ReceiptText className="h-6 w-6" />
            </div>
          </div>
          <p className="pt-2 text-sm font-bold text-slate-500">Cashier: {cashierName}</p>
        </CardHeader>
      )}
      <CardContent className="flex flex-1 flex-col p-0 min-h-0 bg-slate-50">
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-8 text-center"
            >
              <p className="text-lg font-bold text-slate-700">No items yet</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Tap a food card to begin billing.</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={item.menuItem.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -50 }}
                  className="rounded-2xl border border-slate-200 bg-white p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.menuItem.name}</p>
                      <p className="text-sm font-bold text-slate-500">
                        {money(item.sellingPriceSnapshot, restaurantData.currency)} each
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.menuItem.id)}
                      className="rounded-xl bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors"
                      aria-label={`Remove ${item.menuItem.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="icon" className="h-10 w-10 min-h-[40px] bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-none" onClick={() => onQuantityChange(item.menuItem.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[2rem] text-center text-lg font-bold text-slate-900">{item.quantity}</span>
                      <Button variant="secondary" size="icon" className="h-10 w-10 min-h-[40px] bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-none" onClick={() => onQuantityChange(item.menuItem.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-lg font-black text-blue-600">
                      {money(item.sellingPriceSnapshot * item.quantity, restaurantData.currency)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white p-4 space-y-4">
          <div className="space-y-3 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm font-bold text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-900">{money(totals.subtotal, restaurantData.currency)}</span>
            </div>
            <label className="flex items-center justify-between gap-3">
              <span>Discount</span>
              <input
                className="h-12 w-28 rounded-xl border border-slate-200 bg-white px-3 text-right text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                type="number"
                min={0}
                value={discount}
                onChange={(event) => onDiscountChange(Number(event.target.value))}
              />
            </label>
            <div className="flex justify-between">
              <span>Tax ({restaurantData.taxRate}%)</span>
              <span className="text-slate-900">{money(totals.tax, restaurantData.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-black text-slate-900">
              <span>Total</span>
              <motion.span key={totals.total} initial={{ scale: 1.1, color: "#2563eb" }} animate={{ scale: 1, color: "#0f172a" }} className="text-blue-600">
                {money(totals.total, restaurantData.currency)}
              </motion.span>
            </div>
          </div>

          <PaymentPanel value={paymentMethod} onChange={onPaymentMethodChange} />
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              size="lg" 
              className="col-span-2 min-h-[56px] text-lg bg-blue-600 hover:bg-blue-700 shadow-none" 
              disabled={cart.length === 0 || !paymentMethod || isSubmitting} 
              onClick={onComplete}
            >
              {isSubmitting ? "Completing..." : "Complete Order"}
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="min-h-[48px] shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 border" 
              disabled={cart.length === 0} 
              onClick={() => window.print()}
            >
              <Printer className="h-5 w-5 mr-2" />
              Print
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="min-h-[48px] shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 border" 
              disabled={cart.length === 0} 
              onClick={downloadReceipt}
            >
              <Download className="h-5 w-5 mr-2" />
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
        cashierName={cashierName}
      />
    </Card>
  );
}
