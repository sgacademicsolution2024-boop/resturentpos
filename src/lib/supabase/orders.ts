import { createClient } from "@/lib/supabase/client";
import type { CartItem, PaymentMethod } from "@/lib/types";

type CreateOrderInput = {
  restaurantId: string;
  cashierId: string;
  paymentMethod: PaymentMethod;
  discount: number;
  tax: number;
  cart: CartItem[];
};

type CreateOrderResult = {
  orderId: string;
  billNumber: string;
};

export async function createOrderWithInventoryDeduction(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = createClient();
  
  // Calculate totals
  const subtotal = input.cart.reduce((sum, item) => sum + item.menuItem.sellingPrice * item.quantity, 0);
  const totalCost = input.cart.reduce((sum, item) => sum + item.menuItem.totalCost * item.quantity, 0);
  const total = subtotal - input.discount + input.tax;
  const grossProfit = subtotal - totalCost - input.discount;
  const billNumber = `TS-${Math.floor(Date.now() / 1000)}`;
  
  const { data, error } = await supabase.rpc("create_order_with_inventory_deduction", {
    p_restaurant_id: input.restaurantId,
    p_cashier_id: input.cashierId,
    p_bill_number: billNumber,
    p_subtotal: subtotal,
    p_discount: input.discount,
    p_tax: input.tax,
    p_total: total,
    p_total_cost: totalCost,
    p_gross_profit: grossProfit,
    p_payment_method: input.paymentMethod,
    p_payment_amount: total,
    p_items: input.cart.map((item) => ({
      menu_item_id: item.menuItem.id,
      item_name: item.menuItem.name,
      unit_price: item.menuItem.sellingPrice,
      quantity: item.quantity,
      line_total: item.menuItem.sellingPrice * item.quantity,
      note: item.note ?? null
    }))
  });

  if (error) {
    throw error;
  }

  return {
    orderId: data as string,
    billNumber: billNumber
  };
}
