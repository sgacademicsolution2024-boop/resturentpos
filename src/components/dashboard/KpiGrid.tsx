import { DollarSign, Receipt, ShoppingBasket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { money } from "@/lib/utils/billing";

const kpis = [
  { label: "Today sales", value: money(3120), icon: DollarSign, note: "+18% vs yesterday" },
  { label: "Orders", value: "104", icon: Receipt, note: "36 paid this hour" },
  { label: "Avg bill", value: money(30), icon: ShoppingBasket, note: "Healthy ticket size" },
  { label: "Active staff", value: "8", icon: Users, note: "2 cashiers online" }
];

export function KpiGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className="overflow-hidden">
            <CardContent className="relative flex items-center justify-between p-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                <p className="mt-2 text-xs font-medium text-primary">{kpi.note}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
