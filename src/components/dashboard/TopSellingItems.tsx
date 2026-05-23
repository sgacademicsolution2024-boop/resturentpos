"use client";

import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { topSellingItems } from "@/lib/constants";
import { money } from "@/lib/utils/billing";
import { useSettings } from "@/lib/settings-context";

export function TopSellingItems() {
  const { restaurantData } = useSettings();

  return (
    <Card className="bg-white/85">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-black text-[#2a1309]">
          <Flame className="h-6 w-6 text-orange-500" />
          Top selling items
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topSellingItems.map((item, index) => (
          <div key={item.id} className="relative overflow-hidden rounded-3xl border border-orange-200 bg-white p-4">
            <div
              className="absolute left-0 top-0 h-full bg-orange-50/50"
              style={{ width: `${100 - index * 15}%` }}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-black text-orange-700">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-black text-[#2a1309]">{item.name}</p>
                  <p className="text-xs font-semibold text-[#7a3f1d]/70">
                    {item.quantitySold} units sold
                  </p>
                </div>
              </div>
              <span className="font-black text-green-700">
                {money(item.revenue, restaurantData.currency)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
