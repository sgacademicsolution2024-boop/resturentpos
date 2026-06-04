export type Role = "owner" | "manager" | "cashier";

export type Restaurant = {
  id: string;
  name: string;
  currency: string;
  taxRate: number;
  address: string;
  phone: string;
};

export type MenuCategory = {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  category: string;
  name: string;
  description: string;
  sellingPrice: number;
  foodCost: number;
  packagingCost: number;
  otherCost: number;
  totalCost: number;
  profitPerItem: number;
  profitMargin: number;
  available: boolean;
  imageUrl: string;
  imageLabel: string;
  prepMinutes: number;
  color: string;
  is_favorite?: boolean;
};

export type InventoryItem = {
  id: string;
  restaurantId: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  costPerUnit: number;
};

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  itemNameSnapshot: string;
  sellingPriceSnapshot: number;
  costPriceSnapshot: number;
  profitSnapshot: number;
  note?: string;
};

export type OrderStatus = "open" | "paid" | "void";

export type PaymentMethod = "cash" | "card" | "upi" | "split";

export type Order = {
  id: string;
  restaurantId: string;
  billNumber: string;
  cashierName: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalCost: number;
  grossProfit: number;
  createdAt: string;
};

export type OrderItemSnapshot = {
  itemNameSnapshot: string;
  sellingPriceSnapshot: number;
  costPriceSnapshot: number;
  profitSnapshot: number;
  quantity: number;
  totalPrice: number;
  totalCost: number;
  totalProfit: number;
};

export type ExpenseCategory = "rent" | "salary" | "electricity" | "ingredients" | "maintenance" | "other";

export type Expense = {
  id: string;
  restaurantId: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  notes: string;
};

export type SalesPoint = {
  day: string;
  sales: number;
  profit: number;
  orders: number;
};
