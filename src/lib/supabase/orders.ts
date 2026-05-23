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
  const { data, error } = await supabase.rpc("create_order_with_inventory_deduction", {
    p_restaurant_id: input.restaurantId,
    p_cashier_id: input.cashierId,
    p_payment_method: input.paymentMethod,
    p_discount: input.discount,
    p_tax: input.tax,
    p_items: input.cart.map((item) => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
      note: item.note ?? null
    }))
  });

  if (error) {
    throw error;
  }

  const result = Array.isArray(data) ? data[0] : data;

  return {
    orderId: result.order_id,
    billNumber: result.bill_number
  };
}
