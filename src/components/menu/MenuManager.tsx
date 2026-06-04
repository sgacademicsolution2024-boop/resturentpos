"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Loader2, Link2, X, Edit, XCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/utils/billing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

type MenuCategory = { id: string; name: string };
type InventoryItem = { id: string; name: string; unit: string };
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  prep_minutes: number;
  is_active: boolean;
  is_favorite: boolean;
  category_id: string;
  category_name?: string;
};

export function MenuManager() {
  const { currentUser, isAdmin } = useAuth();
  const supabase = createClient();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  // Form state
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [catId, setCatId] = useState("");
  const [price, setPrice] = useState("");
  const [prep, setPrep] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Recipe (BOM) state
  const [recipe, setRecipe] = useState<{ invId: string; qty: string }[]>([]);

  // Simple consumption mapping (for adding one by one in the UI)
  const [invId, setInvId] = useState("");
  const [invQty, setInvQty] = useState("");

  function addRecipeItem() {
    if (invId && invQty) {
      setRecipe([...recipe, { invId, qty: invQty }]);
      setInvId("");
      setInvQty("");
    }
  }

  function removeRecipeItem(index: number) {
    setRecipe(recipe.filter((_, i) => i !== index));
  }

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function loadData() {
    setLoading(true);
    const [catRes, invRes, menuRes] = await Promise.all([
      supabase.from("menu_categories").select("*").eq("restaurant_id", currentUser?.restaurant_id).order("sort_order"),
      supabase.from("inventory_items").select("*").eq("restaurant_id", currentUser?.restaurant_id).order("name"),
      supabase.from("menu_items").select(`*, menu_categories(name)`).eq("restaurant_id", currentUser?.restaurant_id).order("name")
    ]);

    if (catRes.data) setCategories(catRes.data);
    if (invRes.data) setInventoryItems(invRes.data);
    if (menuRes.data) {
      setMenuItems(menuRes.data.map((m: Record<string, unknown>) => ({
        ...m,
        category_name: (m.menu_categories as Record<string, unknown>)?.name as string
      })) as MenuItem[]);
    }
    
    if (catRes.data && catRes.data.length > 0) {
      setCatId(catRes.data[0].id);
    }
    setLoading(false);
  }

  async function handleAddMenu(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser?.restaurant_id || !catId) return;
    setSaving(true);

    let currentMenuId = editId;

    if (editId) {
      // 1a. Update Menu Item
      const { error: menuErr } = await supabase.from("menu_items")
        .update({
          category_id: catId,
          name,
          description: desc,
          price: Number(price) || 0,
          prep_minutes: Number(prep) || 0,
          is_favorite: isFav
        })
        .eq("id", editId);

      if (menuErr) {
        alert("Error updating menu item: " + menuErr.message);
        setSaving(false);
        return;
      }
      
      // Clear old recipe ingredients to replace them
      await supabase.from("recipe_ingredients").delete().eq("menu_item_id", editId);
      
    } else {
      // 1b. Create Menu Item
      const { data: menuItem, error: menuErr } = await supabase.from("menu_items").insert({
        restaurant_id: currentUser.restaurant_id,
        category_id: catId,
        name,
        description: desc,
        price: Number(price) || 0,
        prep_minutes: Number(prep) || 0,
        is_active: true,
        is_favorite: isFav
      }).select().single();

      if (menuErr) {
        alert("Error adding menu item: " + menuErr.message);
        setSaving(false);
        return;
      }
      currentMenuId = menuItem?.id || null;
    }

    // 2. Add BOM Recipe if provided
    if (recipe.length > 0 && currentMenuId) {
      const inserts = recipe.map((item) => ({
        restaurant_id: currentUser.restaurant_id,
        menu_item_id: currentMenuId,
        inventory_item_id: item.invId,
        quantity_required: Number(item.qty)
      }));
      
      const { error: recipeErr } = await supabase.from("recipe_ingredients").insert(inserts);
      if (recipeErr) {
        console.error("Failed to insert recipe BOM:", recipeErr);
      }
    }

    resetForm();
    loadData();
    setSaving(false);
  }

  function resetForm() {
    setName("");
    setDesc("");
    setPrice("");
    setPrep("");
    setIsFav(false);
    setRecipe([]);
    setEditId(null);
  }

  async function handleEdit(item: MenuItem) {
    setName(item.name);
    setDesc(item.description);
    setCatId(item.category_id);
    setPrice(item.price.toString());
    setPrep(item.prep_minutes.toString());
    setIsFav(item.is_favorite);
    setEditId(item.id);

    // Fetch existing recipe
    const { data: recipeData } = await supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("menu_item_id", item.id);
      
    if (recipeData) {
      setRecipe(recipeData.map(r => ({
        invId: r.inventory_item_id,
        qty: r.quantity_required.toString()
      })));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
  }

  const filtered = menuItems.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "all" || m.category_id === filterCat;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
      {isAdmin && (
        <Card className="h-fit overflow-hidden bg-white shadow-sm border border-slate-200">
          <CardHeader className="bg-slate-50 text-slate-900 shrink-0 border-b border-slate-200 flex flex-row items-center justify-between py-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">Menu manager</p>
              <CardTitle className="text-2xl font-black">{editId ? "Edit food item" : "Add food item"}</CardTitle>
            </div>
            {editId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="text-slate-500">
                <XCircle className="h-5 w-5 mr-1" /> Cancel Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <form onSubmit={handleAddMenu} className="space-y-4">
              <Input required value={name} onChange={e => setName(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600" placeholder="Food name (e.g. Chicken Wings)" />
              <Input value={desc} onChange={e => setDesc(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600" placeholder="Short description" />
              
              <Select required value={catId} onChange={e => setCatId(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600">
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              
              <div className="grid grid-cols-2 gap-3">
                <Input required value={price} onChange={e => setPrice(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600" type="number" step="0.01" placeholder="Selling price" />
                <Input value={prep} onChange={e => setPrep(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600" type="number" placeholder="Prep min" />
              </div>
              
              <label className="flex min-h-[48px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                Favorite (POS Quick Add)
                <input type="checkbox" checked={isFav} onChange={e => setIsFav(e.target.checked)} className="h-5 w-5 accent-blue-600 cursor-pointer" />
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mt-2">
                <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold text-sm">
                  <Link2 className="h-4 w-4" />
                  <span>Recipe / BOM Mapping</span>
                </div>
                
                {recipe.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {recipe.map((r, i) => {
                      const inv = inventoryItems.find(item => item.id === r.invId);
                      return (
                        <div key={i} className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-2 px-3 text-sm font-semibold">
                          <span>{r.qty} {inv?.unit} of {inv?.name}</span>
                          <button type="button" onClick={() => removeRecipeItem(i)} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-3 p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <Select value={invId} onChange={e => setInvId(e.target.value)} className="min-h-[48px] rounded-xl bg-white border border-slate-200 text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600">
                    <option value="">Select raw material...</option>
                    {inventoryItems.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </Select>
                  
                  {invId && (
                    <div className="flex gap-2 items-center text-sm font-semibold text-slate-600">
                      <span>Requires:</span>
                      <Input value={invQty} onChange={e => setInvQty(e.target.value)} className="min-h-[40px] w-24 rounded-lg bg-white border border-slate-200 text-slate-900" type="number" step="0.01" placeholder="Qty" />
                      <span>{inventoryItems.find(i => i.id === invId)?.unit} / order</span>
                      <Button type="button" onClick={addRecipeItem} disabled={!invQty} className="ml-auto min-h-[40px] text-xs px-3 bg-blue-600 text-white rounded-lg">
                        Add to recipe
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={saving || categories.length === 0} className="min-h-[56px] w-full text-base bg-blue-600 hover:bg-blue-700 text-white shadow-none">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editId ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />)}
                <span className="ml-2">{editId ? "Update menu item" : "Save menu item"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent pl-12 text-base font-semibold text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600" placeholder="Search menu items" />
            </label>
            <Select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="min-h-[48px] rounded-xl bg-slate-50 border-transparent text-slate-900 focus-visible:ring-blue-600 focus-visible:border-blue-600">
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-black text-blue-600 shrink-0">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.is_active ? "Available" : "Unavailable"}
                    </span>
                    {item.is_favorite && (
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider">Favorite</span>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                <p className="mt-1 text-xs font-bold text-blue-600 uppercase tracking-widest">{item.category_name}</p>
                <p className="mt-2 min-h-10 text-sm font-semibold leading-5 text-slate-500 line-clamp-2">{item.description}</p>
              </div>
              
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-2xl font-black text-blue-600">{money(item.price, "$")}</p>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="min-h-[40px] w-10 shadow-none border border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => handleEdit(item)} aria-label={`Edit ${item.name}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" size="icon" className="bg-red-50 hover:bg-red-100 text-red-600 min-h-[40px] w-10 shadow-none border border-red-200" onClick={() => handleDelete(item.id)} aria-label={`Delete ${item.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
