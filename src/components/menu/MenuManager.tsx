import { Edit3, ImagePlus, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { menuCategories, menuItems, restaurant } from "@/lib/constants";
import { money } from "@/lib/utils/billing";

export function MenuManager() {
  const realCategories = menuCategories.filter((category) => category.slug !== "all");

  return (
    <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
      <Card className="overflow-hidden bg-white/85">
        <CardHeader className="bg-[#2a1309] text-white">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-200">Menu manager</p>
          <CardTitle className="text-2xl font-black">Add food item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input className="h-12 rounded-2xl bg-white" placeholder="Food name" />
          <Input className="h-12 rounded-2xl bg-white" placeholder="Short description" />
          <Select className="h-12 rounded-2xl bg-white">
            {realCategories.map((category) => (
              <option key={category.id}>{category.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Selling price" />
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Prep min" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Food cost" />
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Packaging" />
            <Input className="h-12 rounded-2xl bg-white" type="number" placeholder="Other" />
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-orange-50 p-3 text-xs font-black text-[#5c2d17]">
            <div>
              <p className="text-[#7a3f1d]/60">Total cost</p>
              <p>Auto</p>
            </div>
            <div>
              <p className="text-[#7a3f1d]/60">Profit</p>
              <p>Auto</p>
            </div>
            <div>
              <p className="text-[#7a3f1d]/60">Margin</p>
              <p>Auto</p>
            </div>
          </div>
          <Input className="h-12 rounded-2xl bg-white" placeholder="Food image URL" />
          <label className="flex min-h-12 items-center justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-black text-[#5c2d17]">
            Available for sale
            <input type="checkbox" defaultChecked className="h-5 w-5 accent-orange-600" />
          </label>
          <Button className="min-h-14 w-full text-base">
            <Plus className="h-5 w-5" />
            Save menu item
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-4 soft-shadow">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-700" />
              <Input className="h-14 rounded-2xl bg-white pl-12 text-base font-semibold" placeholder="Search menu items" />
            </label>
            <Select className="h-14 rounded-2xl bg-white">
              <option>All categories</option>
              {realCategories.map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {menuItems.map((item) => (
            <article key={item.id} className={`rounded-[1.75rem] border border-white/80 bg-gradient-to-br ${item.color} p-4 food-card-shadow`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 text-xl font-black text-orange-700">
                  {item.imageLabel}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-black text-[#2a1309]">{item.name}</h3>
              <p className="mt-2 min-h-10 text-sm font-semibold leading-5 text-[#5c2d17]/75">{item.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-[#2a1309]">{money(item.sellingPrice, restaurant.currency)}</p>
                  <p className="text-xs font-black text-orange-700">
                    Profit {money(item.profitPerItem, restaurant.currency)} ({item.profitMargin.toFixed(0)}%)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon" aria-label={`Edit ${item.name}`}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-white/70" aria-label={`Upload image for ${item.name}`}>
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" size="icon" aria-label={`Delete ${item.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
