import { MenuManager } from "@/components/menu/MenuManager";

export default function MenuPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 glass-panel p-5 soft-shadow">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Gaan Fun Khaan menu</p>
        <h1 className="mt-1 text-3xl font-black text-white">Menu management</h1>
        <p className="mt-2 text-base font-semibold text-slate-300/70">Add, edit, price, and activate sellable items.</p>
      </div>
      <MenuManager />
    </div>
  );
}
