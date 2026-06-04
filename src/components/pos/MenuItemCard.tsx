import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <article className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-md shadow-sm">
      
      <div className="flex items-start justify-between mb-2">
        {/* Placeholder for actual image */}
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-2xl font-black text-slate-400 shrink-0">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-xl" /> : item.imageLabel}
        </div>
        <span className={cn(
          "inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide",
          item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}>
          Stock: {item.available ? "Yes" : "Out"}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold leading-tight text-slate-900 line-clamp-2">{item.name}</h3>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <p className="text-lg font-black tracking-tight text-blue-600">{money(item.sellingPrice, restaurantData.currency)}</p>
        <Button 
          size="md" 
          disabled={!item.available} 
          onClick={() => onAdd(item)} 
          className="w-full min-h-[48px] rounded-xl shadow-none"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add
        </Button>
      </div>
    </article>
  );
}
