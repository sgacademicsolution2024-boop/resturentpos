import { InventoryManager } from "@/components/inventory/InventoryManager";

export default function InventoryPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 glass-panel p-5 soft-shadow">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Ingredient stockroom</p>
        <h1 className="mt-1 text-3xl font-black text-white">Inventory management</h1>
        <p className="mt-2 text-base font-semibold text-slate-300/70">Track stock levels, reorder points, and ingredient costs.</p>
      </div>
      <InventoryManager />
    </div>
  );
}
