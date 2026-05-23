import { forwardRef } from "react";
import type { CartItem, PaymentMethod } from "@/lib/types";
import { money } from "@/lib/utils/billing";
import { cashier } from "@/lib/constants";
import { useSettings } from "@/lib/settings-context";

type BillReceiptProps = {
  cart: CartItem[];
  discount: number;
  totals: { subtotal: number; tax: number; total: number };
  billNumber: string;
  paymentMethod: PaymentMethod;
};

export const BillReceipt = forwardRef<HTMLDivElement, BillReceiptProps>(
  ({ cart, discount, totals, billNumber, paymentMethod }, ref) => {
    const { restaurantData } = useSettings();
    const date = new Date();

    return (
      <div
        ref={ref}
        id="bill-receipt"
        className="fixed -left-[9999px] top-0 w-[300px] bg-white p-4 font-mono text-sm text-black print:static print:w-full print:block"
      >
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold uppercase">{restaurantData.name}</h1>
          <p className="text-xs">{restaurantData.address}</p>
          <p className="text-xs">Ph: {restaurantData.phone}</p>
        </div>

        <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
          <h2 className="font-bold">TAX INVOICE / RECEIPT</h2>
        </div>

        <div className="mb-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Bill No:</span>
            <span className="font-bold">{billNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{cashier.name}</span>
          </div>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.menuItem.id}>
                <td className="py-1">
                  {item.menuItem.name}
                  <br />
                  <span className="text-[10px] text-gray-500">
                    @{money(item.sellingPriceSnapshot, restaurantData.currency)}
                  </span>
                </td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">
                  {money(item.sellingPriceSnapshot * item.quantity, restaurantData.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black border-dashed pt-2 mb-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(totals.subtotal, restaurantData.currency)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{money(discount, restaurantData.currency)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax ({restaurantData.taxRate}%)</span>
            <span>{money(totals.tax, restaurantData.currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-2 border-t border-black pt-2">
            <span>GRAND TOTAL</span>
            <span>{money(totals.total, restaurantData.currency)}</span>
          </div>
        </div>

        <div className="text-center text-xs mb-4">
          <p>
            Payment: <span className="font-bold uppercase">{paymentMethod}</span>
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="font-bold mb-1">Thank You!</p>
          <p className="text-[10px] text-gray-500">Powered by TableStack POS</p>
        </div>
      </div>
    );
  }
);

BillReceipt.displayName = "BillReceipt";
