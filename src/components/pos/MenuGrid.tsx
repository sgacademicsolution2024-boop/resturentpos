"use client";

import { useState, useEffect } from "react";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { MenuItemCard } from "@/components/pos/MenuItemCard";
import type { MenuItem, MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

type MenuGridProps = {
  activeCategory: string;
  search: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
  onAdd: (item: MenuItem) => void;
};

export function MenuGrid({ activeCategory, search, onCategoryChange, onSearchChange, onAdd }: MenuGridProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const supabase = createClient();
  const { currentUser } = useAuth();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadMenu() {
      if (!currentUser?.restaurant_id) return;

      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          supabase.from("menu_categories").select("*").eq("restaurant_id", currentUser.restaurant_id).order("sort_order"),
          supabase.from("menu_item_cost_view").select(`*, menu_items!inner(image_url, category:menu_categories(name))`).eq("restaurant_id", currentUser.restaurant_id).eq("is_active", true)
        ]);

        if (categoriesRes.data) {
          setMenuCategories(categoriesRes.data.map((c: Record<string, unknown>) => ({
            id: c.id as string,
            restaurantId: c.restaurant_id as string,
            name: c.name as string,
            slug: (c.slug as string) || (c.name as string).toLowerCase().replace(/ /g, '-'),
            sortOrder: c.sort_order as number
          })));
        }

        if (itemsRes.data) {
          setMenuItems(itemsRes.data.map((i: Record<string, unknown>) => {
            const sellingPrice = Number(i.selling_price) || 0;
            const totalCost = Number(i.total_cost) || 0;
            
            return {
              id: i.menu_item_id as string,
              restaurantId: i.restaurant_id as string,
              categoryId: i.category_id as string,
              category: ((i.menu_items as Record<string, unknown>)?.category as Record<string, unknown>)?.name as string || "",
              name: i.name as string,
              description: (i.description as string) || "",
              sellingPrice: sellingPrice,
              foodCost: Number(i.food_cost) || 0,
              packagingCost: Number(i.packaging_cost) || 0,
              otherCost: Number(i.other_cost) || 0,
              totalCost: totalCost,
              profitPerItem: sellingPrice - totalCost,
              profitMargin: sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0,
              available: i.is_active as boolean,
              imageUrl: ((i.menu_items as Record<string, unknown>)?.image_url as string) || "",
              imageLabel: (i.name as string).charAt(0).toUpperCase(),
              prepMinutes: (i.prep_minutes as number) || 0,
              color: "from-slate-800 to-red-100",
              is_favorite: i.is_favorite as boolean
            };
          }));
        }
      } catch (err) {
        console.error("Failed to load menu from Supabase", err);
      }
    }

    loadMenu();

    if (currentUser?.restaurant_id) {
      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'menu_items',
            filter: `restaurant_id=eq.${currentUser.restaurant_id}`
          },
          () => {
            loadMenu();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, currentUser]);

  const filtered = menuItems.filter((item) => {
    // Determine if item matches category
    let matchesCategory = false;
    
    if (activeCategory === "all") {
      matchesCategory = true;
    } else if (activeCategory === "favorites") {
      matchesCategory = Boolean((item as Record<string, unknown>).is_favorite);
    } else {
      const category = menuCategories.find((entry) => entry.id === item.categoryId);
      matchesCategory = category?.slug === activeCategory;
    }

    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favorites = menuItems.filter(item => item.is_favorite);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 min-w-0 w-full">
      {/* Desktop Category Sidebar */}
      <aside className="hidden lg:flex flex-col gap-2 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Categories</h3>
        <button
          type="button"
          onClick={() => onCategoryChange("favorites")}
          className={cn(
            "flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors",
            activeCategory === "favorites" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Star className="h-5 w-5" />
          Favorites
        </button>
        <button
          type="button"
          onClick={() => onCategoryChange("all")}
          className={cn(
            "flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors",
            activeCategory === "all" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          All Items
        </button>
        {menuCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors",
              activeCategory === category.slug ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {category.name}
          </button>
        ))}
      </aside>

      <section className="space-y-5 min-w-0 w-full">
        {/* Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search food item..."
              className="h-12 w-full rounded-xl bg-slate-50 border-transparent pl-12 text-base font-semibold focus-visible:ring-blue-600 focus-visible:border-blue-600"
            />
          </label>

          {/* Mobile Categories (Hidden on Desktop) */}
          <div className="mt-4 flex gap-2 overflow-x-auto scroll-smooth pb-1 w-full custom-scrollbar lg:hidden">
            <button
              type="button"
              onClick={() => onCategoryChange("favorites")}
              className={cn(
                "min-h-[48px] shrink-0 rounded-xl px-5 text-sm font-bold transition",
                activeCategory === "favorites" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-100 text-slate-700 border border-slate-200"
              )}
            >
              Favorites
            </button>
            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={cn(
                "min-h-[48px] shrink-0 rounded-xl px-5 text-sm font-bold transition",
                activeCategory === "all" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-100 text-slate-700 border border-slate-200"
              )}
            >
              All Items
            </button>
            {menuCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  "min-h-[48px] shrink-0 rounded-xl px-5 text-sm font-bold transition",
                  activeCategory === category.slug ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-100 text-slate-700 border border-slate-200"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Section (Only show if viewing all items and favorites exist) */}
        {activeCategory === "all" && search === "" && favorites.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> POS Favorites
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {favorites.map((item) => (
                <MenuItemCard key={`fav-${item.id}`} item={item} onAdd={onAdd} />
              ))}
            </div>
            <hr className="my-6 border-slate-200" />
          </div>
        )}

        {/* Main Products Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={onAdd} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              <p className="font-semibold text-lg">No items found</p>
              <p className="text-sm">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
