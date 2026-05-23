import type { InventoryItem } from "@/lib/types";

export function getLowStockItems(items: InventoryItem[]) {
  return items.filter((item) => item.quantityOnHand <= item.reorderLevel);
}
