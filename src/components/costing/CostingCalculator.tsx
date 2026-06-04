import { useEffect, useMemo, useState } from "react";
import { Calculator, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/utils/billing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";

type MenuItemCostData = {
  menu_item_id: string;
  name: string;
  selling_price: number;
  packaging_cost: number;
  other_cost: number;
  food_cost: number;
};

export function CostingCalculator() {
  const { currentUser } = useAuth();
  const { restaurantData } = useSettings();
  const supabase = createClient();

  const [items, setItems] = useState<MenuItemCostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [menuItemId, setMenuItemId] = useState("");
  const selected = items.find((item) => item.menu_item_id === menuItemId) ?? items[0];
  
  const [sellingPrice, setSellingPrice] = useState(0);
  const [foodCost, setFoodCost] = useState(0);
  const [packagingCost, setPackagingCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;

    async function loadData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_item_cost_view")
        .select("*")
        .eq("restaurant_id", currentUser?.restaurant_id);
        
      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          menu_item_id: d.menu_item_id,
          name: d.name,
          selling_price: Number(d.selling_price) || 0,
          packaging_cost: Number(d.packaging_cost) || 0,
          other_cost: Number(d.other_cost) || 0,
          food_cost: Number(d.food_cost) || 0
        }));
        
        setItems(mapped);
        
        // Initialize with first item
        const first = mapped[0];
        setMenuItemId(first.menu_item_id);
        setSellingPrice(first.selling_price);
        setFoodCost(first.food_cost);
        setPackagingCost(first.packaging_cost);
        setOtherCost(first.other_cost);
      }
      setLoading(false);
    }
    loadData();
  }, [currentUser, supabase]);

  function selectItem(id: string) {
    const item = items.find((entry) => entry.menu_item_id === id);
    if (!item) return;
    setMenuItemId(id);
    setSellingPrice(item.selling_price);
    setFoodCost(item.food_cost);
    setPackagingCost(item.packaging_cost);
    setOtherCost(item.other_cost);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    
    // The raw material (food_cost) is derived from inventory, we shouldn't save it to menu_items directly.
    // We update price, packaging_cost, and other_cost.
    const { error } = await supabase
      .from("menu_items")
      .update({
        price: sellingPrice,
        packaging_cost: packagingCost,
        other_cost: otherCost
      })
      .eq("id", selected.menu_item_id);

    if (error) {
      alert("Failed to update item costing: " + error.message);
    } else {
      // Update local state
      setItems(items.map(item => 
        item.menu_item_id === selected.menu_item_id 
          ? { ...item, selling_price: sellingPrice, packaging_cost: packagingCost, other_cost: otherCost }
          : item
      ));
      alert("Updated successfully!");
    }
    setSaving(false);
  }

  const totals = useMemo(() => {
    const totalCost = foodCost + packagingCost + otherCost;
    const profit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    return { totalCost, profit, margin };
  }, [foodCost, otherCost, packagingCost, sellingPrice]);

  return (
    <Card className="overflow-hidden bg-white">
      <CardHeader className="bg-slate-950 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-300">Simple item costing</p>
            <CardTitle className="text-2xl font-black">Costing calculator</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[1fr_330px] relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
        <div className="space-y-3">
          <Select className="h-12 rounded-2xl bg-white" value={menuItemId} onChange={(event) => selectItem(event.target.value)}>
            {items.map((item) => (
              <option key={item.menu_item_id} value={item.menu_item_id}>
                {item.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-black text-slate-400">
              Selling price
              <Input className="h-12 rounded-2xl bg-white" type="number" value={sellingPrice} onChange={(event) => setSellingPrice(Number(event.target.value))} />
            </label>
            <label className="space-y-1 text-sm font-black text-slate-400">
              Food/raw material cost (Read-only)
              <Input className="h-12 rounded-2xl bg-white bg-slate-50 text-slate-500" type="number" disabled value={foodCost} />
            </label>
            <label className="space-y-1 text-sm font-black text-slate-400">
              Packaging cost
              <Input className="h-12 rounded-2xl bg-white" type="number" value={packagingCost} onChange={(event) => setPackagingCost(Number(event.target.value))} />
            </label>
            <label className="space-y-1 text-sm font-black text-slate-400">
              Labour/other cost
              <Input className="h-12 rounded-2xl bg-white" type="number" value={otherCost} onChange={(event) => setOtherCost(Number(event.target.value))} />
            </label>
          </div>
          <Button className="min-h-14 w-full text-base sm:w-auto" onClick={handleSave} disabled={saving || !selected}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            <span className="ml-2">Save/update item costing</span>
          </Button>
        </div>

        {selected && (
          <div className="rounded-[1.75rem] bg-slate-900 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">{selected.name}</p>
          <div className="mt-4 space-y-3 text-sm font-bold text-slate-400">
            <div className="flex justify-between">
              <span>Total cost</span>
              <span>{money(totals.totalCost, restaurantData.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Profit per item</span>
              <span>{money(totals.profit, restaurantData.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-3 text-2xl font-black text-slate-900">
              <span>Margin</span>
              <span>{totals.margin.toFixed(1)}%</span>
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-white p-3 text-sm font-bold text-slate-300/80">
            Total cost = food cost + packaging cost + other cost.
          </p>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
