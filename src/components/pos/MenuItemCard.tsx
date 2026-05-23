import { Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MenuItem } from "@/lib/types";
import { money } from "@/lib/utils/billing";
import { restaurant } from "@/lib/constants";

type MenuItemCardProps = {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
};

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <article className={`food-card-shadow relative flex min-h-[220px] min-w-0 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-br ${item.color} p-5 transition hover:-translate-y-1 hover:shadow-xl`}>
      
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-white/90 text-xl font-black text-orange-700 shadow-sm shrink-0">
          {item.imageLabel}
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {item.available ? "Available" : "Sold out"}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-lg font-black leading-tight text-[#2a1309] truncate">{item.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-relaxed text-[#5c2d17]/70">{item.description}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 pt-2">
        <div className="flex items-end justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6f3518]/70 whitespace-nowrap mb-0.5">
            <Clock className="h-3.5 w-3.5" />
            {item.prepMinutes} min
          </p>
          <p className="text-2xl font-black tracking-tight text-[#2a1309] whitespace-nowrap">{money(item.sellingPrice, restaurant.currency)}</p>
        </div>
        <Button size="md" disabled={!item.available} onClick={() => onAdd(item)} className="w-full h-11 rounded-xl shadow-md shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Bill
        </Button>
      </div>
    </article>
  );
}
