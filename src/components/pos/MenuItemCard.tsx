import { Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MenuItem } from "@/lib/types";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";

type MenuItemCardProps = {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
};

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const { restaurantData } = useSettings();
  return (
    <article className={`food-card-shadow relative flex min-h-[140px] min-w-0 flex-col justify-between overflow-hidden rounded-[1.25rem] border border-white/80 bg-gradient-to-br ${item.color} p-3 transition hover:-translate-y-1 hover:shadow-md`}>
      
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-lg font-black text-orange-700 shadow-sm shrink-0">
          {item.imageLabel}
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {item.available ? "Available" : "Sold out"}
        </span>
      </div>

      <div className="mt-2 flex-1">
        <h3 className="text-base font-black leading-tight text-[#2a1309] truncate">{item.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs font-medium text-[#5c2d17]/70">{item.description}</p>
      </div>

      <div className="mt-2 flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6f3518]/70 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {item.prepMinutes}m
          </p>
          <p className="text-lg font-black tracking-tight text-[#2a1309] whitespace-nowrap">{money(item.sellingPrice, restaurantData.currency)}</p>
        </div>
        <Button size="sm" disabled={!item.available} onClick={() => onAdd(item)} className="w-full h-8 text-xs rounded-lg shadow-sm shrink-0">
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </article>
  );
}
