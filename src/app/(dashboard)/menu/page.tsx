import { MenuManager } from "@/components/menu/MenuManager";

export default function MenuPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-5 soft-shadow">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Gaan Fun Khaan menu</p>
        <h1 className="mt-1 text-3xl font-black text-[#2a1309]">Menu management</h1>
        <p className="mt-2 text-base font-semibold text-[#7a3f1d]/70">Add, edit, price, and activate sellable items.</p>
      </div>
      <MenuManager />
    </div>
  );
}
