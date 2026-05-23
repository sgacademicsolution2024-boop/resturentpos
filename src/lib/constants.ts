import type { Expense, InventoryItem, MenuCategory, MenuItem, Order, Restaurant, SalesPoint } from "@/lib/types";

function withCosting(
  item: Omit<MenuItem, "totalCost" | "profitPerItem" | "profitMargin">
): MenuItem {
  const totalCost = item.foodCost + item.packagingCost + item.otherCost;
  const profitPerItem = item.sellingPrice - totalCost;
  const profitMargin = item.sellingPrice > 0 ? (profitPerItem / item.sellingPrice) * 100 : 0;

  return {
    ...item,
    totalCost,
    profitPerItem,
    profitMargin
  };
}

export const restaurant: Restaurant = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Gaan Fun Khaan",
  currency: "Rs ",
  taxRate: 5,
  address: "Park Street Food Court, Kolkata",
  phone: "+91 98765 43210"
};

export const cashier = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Ayesha"
};

export const rolePermissions = {
  owner: ["dashboard", "pos", "menu", "inventory", "costing", "orders", "reports", "staff", "settings"],
  manager: ["dashboard", "pos", "menu", "inventory", "orders", "reports"],
  cashier: ["pos"]
} as const;

export const menuCategories: MenuCategory[] = [
  { id: "cat-all", restaurantId: restaurant.id, name: "All", slug: "all", sortOrder: 0 },
  { id: "cat-starter", restaurantId: restaurant.id, name: "Starter", slug: "starter", sortOrder: 1 },
  { id: "cat-main", restaurantId: restaurant.id, name: "Main Course", slug: "main-course", sortOrder: 2 },
  { id: "cat-biryani", restaurantId: restaurant.id, name: "Biryani", slug: "biryani", sortOrder: 3 },
  { id: "cat-chinese", restaurantId: restaurant.id, name: "Chinese", slug: "chinese", sortOrder: 4 },
  { id: "cat-drinks", restaurantId: restaurant.id, name: "Drinks", slug: "drinks", sortOrder: 5 },
  { id: "cat-desserts", restaurantId: restaurant.id, name: "Desserts", slug: "desserts", sortOrder: 6 }
];

export const menuItems: MenuItem[] = [
  withCosting({
    id: "item-wings",
    restaurantId: restaurant.id,
    categoryId: "cat-starter",
    category: "Starter",
    name: "Chicken Wings Plate",
    description: "Crispy wings tossed in hot garlic sauce.",
    sellingPrice: 180,
    foodCost: 78,
    packagingCost: 8,
    otherCost: 7,
    available: true,
    imageUrl: "",
    imageLabel: "CW",
    prepMinutes: 12,
    color: "from-orange-100 to-red-100"
  }),
  withCosting({
    id: "item-biryani",
    restaurantId: restaurant.id,
    categoryId: "cat-biryani",
    category: "Biryani",
    name: "Chicken Biryani",
    description: "Aromatic rice, tender chicken, egg and aloo.",
    sellingPrice: 220,
    foodCost: 95,
    packagingCost: 10,
    otherCost: 5,
    available: true,
    imageUrl: "",
    imageLabel: "CB",
    prepMinutes: 16,
    color: "from-amber-100 to-yellow-100"
  }),
  withCosting({
    id: "item-roll",
    restaurantId: restaurant.id,
    categoryId: "cat-starter",
    category: "Starter",
    name: "Egg Roll",
    description: "Flaky paratha, double egg and house chutney.",
    sellingPrice: 90,
    foodCost: 34,
    packagingCost: 5,
    otherCost: 4,
    available: true,
    imageUrl: "",
    imageLabel: "ER",
    prepMinutes: 7,
    color: "from-yellow-100 to-orange-100"
  }),
  withCosting({
    id: "item-rice",
    restaurantId: restaurant.id,
    categoryId: "cat-chinese",
    category: "Chinese",
    name: "Fried Rice",
    description: "Wok-tossed rice with vegetables and sauces.",
    sellingPrice: 160,
    foodCost: 58,
    packagingCost: 8,
    otherCost: 6,
    available: true,
    imageUrl: "",
    imageLabel: "FR",
    prepMinutes: 11,
    color: "from-lime-100 to-yellow-100"
  }),
  withCosting({
    id: "item-chilli",
    restaurantId: restaurant.id,
    categoryId: "cat-chinese",
    category: "Chinese",
    name: "Chilli Chicken",
    description: "Indo-Chinese classic with capsicum and onions.",
    sellingPrice: 190,
    foodCost: 86,
    packagingCost: 8,
    otherCost: 7,
    available: true,
    imageUrl: "",
    imageLabel: "CC",
    prepMinutes: 13,
    color: "from-red-100 to-orange-100"
  }),
  withCosting({
    id: "item-coffee",
    restaurantId: restaurant.id,
    categoryId: "cat-drinks",
    category: "Drinks",
    name: "Cold Coffee",
    description: "Chilled creamy coffee with chocolate drizzle.",
    sellingPrice: 120,
    foodCost: 42,
    packagingCost: 7,
    otherCost: 5,
    available: true,
    imageUrl: "",
    imageLabel: "CF",
    prepMinutes: 5,
    color: "from-stone-100 to-amber-100"
  }),
  withCosting({
    id: "item-mocktail",
    restaurantId: restaurant.id,
    categoryId: "cat-drinks",
    category: "Drinks",
    name: "Mocktail",
    description: "Bright citrus cooler for a spicy meal.",
    sellingPrice: 140,
    foodCost: 50,
    packagingCost: 8,
    otherCost: 6,
    available: true,
    imageUrl: "",
    imageLabel: "MT",
    prepMinutes: 4,
    color: "from-rose-100 to-yellow-100"
  }),
  withCosting({
    id: "item-brownie",
    restaurantId: restaurant.id,
    categoryId: "cat-desserts",
    category: "Desserts",
    name: "Brownie",
    description: "Warm chocolate brownie, soft center.",
    sellingPrice: 100,
    foodCost: 44,
    packagingCost: 6,
    otherCost: 4,
    available: false,
    imageUrl: "",
    imageLabel: "BR",
    prepMinutes: 3,
    color: "from-orange-100 to-stone-100"
  })
];

export const inventoryItems: InventoryItem[] = [
  { id: "inv-wings", restaurantId: restaurant.id, name: "Chicken Wing Piece", unit: "piece", quantityOnHand: 500, reorderLevel: 80, costPerUnit: 18 },
  { id: "inv-rice", restaurantId: restaurant.id, name: "Rice", unit: "kg", quantityOnHand: 20, reorderLevel: 6, costPerUnit: 62 },
  { id: "inv-chicken", restaurantId: restaurant.id, name: "Chicken", unit: "kg", quantityOnHand: 15, reorderLevel: 5, costPerUnit: 210 },
  { id: "inv-sauce", restaurantId: restaurant.id, name: "Sauce", unit: "kg", quantityOnHand: 5, reorderLevel: 2, costPerUnit: 120 },
  { id: "inv-paratha", restaurantId: restaurant.id, name: "Paratha", unit: "piece", quantityOnHand: 100, reorderLevel: 25, costPerUnit: 12 },
  { id: "inv-milk", restaurantId: restaurant.id, name: "Milk", unit: "litre", quantityOnHand: 10, reorderLevel: 3, costPerUnit: 58 },
  { id: "inv-coffee", restaurantId: restaurant.id, name: "Coffee Powder", unit: "kg", quantityOnHand: 2, reorderLevel: 1, costPerUnit: 420 },
  { id: "inv-box", restaurantId: restaurant.id, name: "Packaging Box", unit: "piece", quantityOnHand: 200, reorderLevel: 50, costPerUnit: 7 }
];

export const expenses: Expense[] = [
  { id: "exp-rent", restaurantId: restaurant.id, name: "Monthly shop rent", category: "rent", amount: 4200, expenseDate: "2026-05-23", notes: "Daily share for reporting demo" },
  { id: "exp-salary", restaurantId: restaurant.id, name: "Staff salary", category: "salary", amount: 3600, expenseDate: "2026-05-23", notes: "Counter and kitchen shift" },
  { id: "exp-electricity", restaurantId: restaurant.id, name: "Electricity", category: "electricity", amount: 900, expenseDate: "2026-05-23", notes: "Estimated daily usage" },
  { id: "exp-maintenance", restaurantId: restaurant.id, name: "Mixer repair", category: "maintenance", amount: 650, expenseDate: "2026-05-23", notes: "Small equipment repair" }
];

export const recentOrders: Order[] = [
  {
    id: "ord-1042",
    restaurantId: restaurant.id,
    billNumber: "GFK-1042",
    cashierName: "Ayesha",
    status: "paid",
    paymentMethod: "upi",
    subtotal: 770,
    discount: 20,
    tax: 37.5,
    total: 787.5,
    totalCost: 340,
    grossProfit: 410,
    createdAt: "2026-05-23T13:26:00+10:00"
  },
  {
    id: "ord-1041",
    restaurantId: restaurant.id,
    billNumber: "GFK-1041",
    cashierName: "Rahul",
    status: "paid",
    paymentMethod: "cash",
    subtotal: 410,
    discount: 0,
    tax: 20.5,
    total: 430.5,
    totalCost: 187,
    grossProfit: 223,
    createdAt: "2026-05-23T12:58:00+10:00"
  },
  {
    id: "ord-1040",
    restaurantId: restaurant.id,
    billNumber: "GFK-1040",
    cashierName: "Ayesha",
    status: "paid",
    paymentMethod: "card",
    subtotal: 610,
    discount: 10,
    tax: 30,
    total: 630,
    totalCost: 278,
    grossProfit: 322,
    createdAt: "2026-05-23T12:21:00+10:00"
  }
];

export const salesTrend: SalesPoint[] = [
  { day: "Mon", sales: 18700, profit: 8420, orders: 88 },
  { day: "Tue", sales: 22150, profit: 10180, orders: 106 },
  { day: "Wed", sales: 19880, profit: 8830, orders: 95 },
  { day: "Thu", sales: 24600, profit: 11240, orders: 118 },
  { day: "Fri", sales: 31680, profit: 14750, orders: 142 },
  { day: "Sat", sales: 38420, profit: 18120, orders: 171 },
  { day: "Sun", sales: 29750, profit: 13380, orders: 132 }
];
