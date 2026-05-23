"use client";

import { useMemo, useState } from "react";
import { Calculator, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { menuItems, restaurant } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

export function CostingCalculator() {
  const [menuItemId, setMenuItemId] = useState("item-biryani");
  const selected = menuItems.find((item) => item.id === menuItemId) ?? menuItems[0];
  const [sellingPrice, setSellingPrice] = useState(selected.sellingPrice);
  const [foodCost, setFoodCost] = useState(selected.foodCost);
  const [packagingCost, setPackagingCost] = useState(selected.packagingCost);
  const [otherCost, setOtherCost] = useState(selected.otherCost);

  function selectItem(id: string) {
    const item = menuItems.find((entry) => entry.id === id) ?? menuItems[0];
    setMenuItemId(id);
    setSellingPrice(item.sellingPrice);
    setFoodCost(item.foodCost);
    setPackagingCost(item.packagingCost);
    setOtherCost(item.otherCost);
  }

  const totals = useMemo(() => {
    const totalCost = foodCost + packagingCost + otherCost;
    const profit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    return { totalCost, profit, margin };
  }, [foodCost, otherCost, packagingCost, sellingPrice]);

  return (
    <Card className="overflow-hidden bg-white/85">
      <CardHeader className="bg-[#2a1309] text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-200">Simple item costing</p>
            <CardTitle className="text-2xl font-black">Costing calculator</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="space-y-3">
          <Select className="h-12 rounded-2xl bg-white" value={menuItemId} onChange={(event) => selectItem(event.target.value)}>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-black text-[#5c2d17]">
              Selling price
              <Input className="h-12 rounded-2xl bg-white" type="number" value={sellingPrice} onChange={(event) => setSellingPrice(Number(event.target.value))} />
            </label>
            <label className="space-y-1 text-sm font-black text-[#5c2d17]">
              Food/raw material cost
              <Input className="h-12 rounded-2xl bg-white" type="number" value={foodCost} onChange={(event) => setFoodCost(Number(event.target.value))} />
            </label>
            <label className="space-y-1 text-sm font-black text-[#5c2d17]">
              Packaging cost
              <Input className="h-12 rounded-2xl bg-white" type="number" value={packagingCost} onChange={(event) => setPackagingCost(Number(event.target.value))} />
            </label>
            <label className="space-y-1 text-sm font-black text-[#5c2d17]">
              Labour/other cost
              <Input className="h-12 rounded-2xl bg-white" type="number" value={otherCost} onChange={(event) => setOtherCost(Number(event.target.value))} />
            </label>
          </div>
          <Button className="min-h-14 w-full text-base sm:w-auto">
            <Save className="h-5 w-5" />
            Save/update item costing
          </Button>
        </div>

        <div className="rounded-[1.75rem] bg-orange-50 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-700">{selected.name}</p>
          <div className="mt-4 space-y-3 text-sm font-bold text-[#5c2d17]">
            <div className="flex justify-between">
              <span>Total cost</span>
              <span>{money(totals.totalCost, restaurant.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Profit per item</span>
              <span>{money(totals.profit, restaurant.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-orange-200 pt-3 text-2xl font-black text-[#2a1309]">
              <span>Margin</span>
              <span>{totals.margin.toFixed(1)}%</span>
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-white p-3 text-sm font-bold text-[#7a3f1d]/80">
            Total cost = food cost + packaging cost + other cost.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
