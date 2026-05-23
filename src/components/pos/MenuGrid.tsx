"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { MenuItemCard } from "@/components/pos/MenuItemCard";
import { menuCategories, menuItems } from "@/lib/constants";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type MenuGridProps = {
  activeCategory: string;
  search: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
  onAdd: (item: MenuItem) => void;
};

export function MenuGrid({ activeCategory, search, onCategoryChange, onSearchChange, onAdd }: MenuGridProps) {
  const filtered = menuItems.filter((item) => {
    const category = menuCategories.find((entry) => entry.id === item.categoryId);
    const matchesCategory = activeCategory === "all" || category?.slug === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-4 soft-shadow">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Take order</p>
            <h2 className="text-2xl font-black text-[#2a1309]">Food menu</h2>
          </div>
          <label className="relative block w-full xl:w-96">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-700" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search food item"
              className="h-14 rounded-2xl bg-white pl-12 text-base font-semibold"
            />
          </label>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto scroll-smooth pb-3">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.slug)}
              className={cn(
                "min-h-12 shrink-0 rounded-2xl border border-orange-200 bg-white px-5 text-sm font-black text-[#5c2d17] transition hover:bg-orange-100",
                activeCategory === category.slug && "border-orange-500 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-900/20"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {filtered.map((item) => (
          <MenuItemCard key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
