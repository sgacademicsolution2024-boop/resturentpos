"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, PackagePlus, Plus, RotateCcw, Search, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/utils/billing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  quantity_on_hand: number;
  reorder_level: number;
  cost_per_unit: number;
};

export function InventoryManager() {
  const { currentUser, isAdmin } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // New Item Form
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newUnit, setNewUnit] = useState("pcs");
  const [newAlert, setNewAlert] = useState("");
  const [newCost, setNewCost] = useState("");
  const [saving, setSaving] = useState(false);

  // Adjustment Modal state would go here in a full implementation, for now we will stub the handlers
  
  const supabase = createClient();

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function loadInventory() {
    setLoading(true);
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("restaurant_id", currentUser?.restaurant_id)
      .order("name");
      
    if (data) {
      setItems(data);
    }
    setLoading(false);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser?.restaurant_id) return;
    setSaving(true);
    
    const { data } = await supabase.from("inventory_items").insert({
      restaurant_id: currentUser.restaurant_id,
      name: newName,
      unit: newUnit,
      quantity_on_hand: Number(newStock) || 0,
      reorder_level: Number(newAlert) || 0,
      cost_per_unit: Number(newCost) || 0,
    }).select().single();

    if (data) {
      setItems((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewStock("");
      setNewAlert("");
      setNewCost("");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await supabase.from("inventory_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleAdjustment(id: string, type: 'purchase' | 'waste' | 'adjustment', delta: number, note: string) {
    // This calls the RPC created in v2_inventory_rpc.sql
    const { error } = await supabase.rpc('adjust_inventory_stock', {
      p_inventory_item_id: id,
      p_movement_type: type,
      p_quantity_delta: delta,
      p_note: note
    });
    
    if (!error) {
      loadInventory(); // reload to get accurate numbers
    } else {
      alert("Failed to adjust inventory: " + error.message);
    }
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
      {isAdmin && (
        <Card className="h-fit overflow-hidden bg-white shadow-sm border border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">Stock room</p>
            <CardTitle className="text-2xl font-black text-slate-900">Add inventory item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <form onSubmit={handleAddItem} className="space-y-4">
              <Input required value={newName} onChange={e => setNewName(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent focus-visible:ring-blue-600 focus-visible:border-blue-600" placeholder="Ingredient name (e.g. Chicken Wings)" />
              <div className="grid grid-cols-2 gap-3">
                <Input required value={newStock} onChange={e => setNewStock(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent focus-visible:ring-blue-600 focus-visible:border-blue-600" type="number" step="0.01" placeholder="Current stock" />
                <Select required value={newUnit} onChange={e => setNewUnit(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent focus-visible:ring-blue-600 focus-visible:border-blue-600">
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="bottle">Bottle</option>
                  <option value="plate">Plate</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ltr">Liter (ltr)</option>
                  <option value="packet">Packet</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input required value={newAlert} onChange={e => setNewAlert(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent focus-visible:ring-blue-600 focus-visible:border-blue-600" type="number" step="0.01" placeholder="Low stock alert" />
                <Input required value={newCost} onChange={e => setNewCost(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent focus-visible:ring-blue-600 focus-visible:border-blue-600" type="number" step="0.01" placeholder="Cost per unit" />
              </div>
              <Button type="submit" disabled={saving} className="min-h-[56px] w-full text-base bg-blue-600 hover:bg-blue-700 text-white shadow-none">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                <span className="ml-2">Save inventory</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="min-h-[48px] w-full rounded-xl bg-slate-50 border-transparent pl-12 text-base font-semibold focus-visible:ring-blue-600 focus-visible:border-blue-600" 
              placeholder="Search inventory..." 
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((item) => {
            const low = item.quantity_on_hand <= item.reorder_level;
            return (
              <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <PackagePlus className="h-6 w-6" />
                    </div>
                    {low ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">Healthy</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-2xl font-black text-blue-600">
                    {item.quantity_on_hand} <span className="text-sm font-semibold text-slate-500">{item.unit}</span>
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-slate-500">Alert at</p>
                      <p className="text-slate-900">{item.reorder_level}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-slate-500">Cost</p>
                      <p className="text-slate-900">{money(item.cost_per_unit, "$")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="secondary" 
                      className="min-h-[48px] bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none border border-slate-200"
                      onClick={() => {
                        const qty = prompt(`How many ${item.unit} to ADD to ${item.name}? (Supplier Delivery)`);
                        if (qty && !isNaN(Number(qty))) handleAdjustment(item.id, 'purchase', Number(qty), 'Supplier delivery');
                      }}
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Stock In
                    </Button>
                    <Button 
                      variant="secondary"
                      className="min-h-[48px] bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none border border-slate-200"
                      onClick={() => {
                        const qty = prompt(`How many ${item.unit} to REMOVE from ${item.name}? (Spoiled/Waste)`);
                        if (qty && !isNaN(Number(qty))) handleAdjustment(item.id, 'waste', -Math.abs(Number(qty)), 'Waste/Spoiled');
                      }}
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4" />
                      Stock Out
                    </Button>
                  </div>
                  
                  {isAdmin && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="min-h-[48px] text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() => {
                          const diff = prompt(`Enter quantity adjustment (positive or negative)`);
                          if (diff && !isNaN(Number(diff))) handleAdjustment(item.id, 'adjustment', Number(diff), 'Manual correction');
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Adjust
                      </Button>
                      <Button variant="ghost" size="sm" className="min-h-[48px] text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
