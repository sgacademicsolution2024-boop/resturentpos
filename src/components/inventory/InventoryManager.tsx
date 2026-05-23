import { AlertTriangle, PackagePlus, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { inventoryItems, restaurant } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

const units = ["piece", "gram", "kg", "ml", "litre"];

export function InventoryManager() {
  return (
    <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
      <Card className="overflow-hidden bg-white/85">
        <CardHeader className="bg-[#2a1309] text-white">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-200">Stock room</p>
          <CardTitle className="text-2xl font-black">Add inventory item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input className="h-12 rounded-2xl bg-white" placeholder="Ingredient name" />
          <div className="grid grid-cols-2 gap-3">
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Current stock" />
            <Select className="h-12 rounded-2xl bg-white">
              {units.map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Low stock alert" />
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Purchase price" />
          </div>
          <Button className="min-h-14 w-full text-base">
            <Plus className="h-5 w-5" />
            Save inventory
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-4 soft-shadow">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-700" />
            <Input className="h-14 rounded-2xl bg-white pl-12 text-base font-semibold" placeholder="Search inventory" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {inventoryItems.map((item) => {
            const low = item.quantityOnHand <= item.reorderLevel;
            return (
              <article key={item.id} className="rounded-[1.75rem] border border-orange-200/70 bg-white/85 p-4 food-card-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-300 to-orange-500 text-[#2a1309]">
                    <PackagePlus className="h-7 w-7" />
                  </div>
                  {low ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Low
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">Healthy</span>
                  )}
                </div>
                <h3 className="mt-5 text-lg font-black text-[#2a1309]">{item.name}</h3>
                <p className="mt-1 text-3xl font-black text-orange-700">
                  {item.quantityOnHand} <span className="text-base text-[#7a3f1d]/70">{item.unit}</span>
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold">
                  <div className="rounded-2xl bg-orange-50 p-3">
                    <p className="text-[#7a3f1d]/70">Alert at</p>
                    <p className="text-[#2a1309]">{item.reorderLevel}</p>
                  </div>
                  <div className="rounded-2xl bg-orange-50 p-3">
                    <p className="text-[#7a3f1d]/70">Purchase</p>
                    <p className="text-[#2a1309]">{money(item.costPerUnit, restaurant.currency)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="secondary">
                    <RotateCcw className="h-4 w-4" />
                    Adjust
                  </Button>
                  <Button variant="danger">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
