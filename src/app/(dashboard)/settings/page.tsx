"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { restaurant } from "@/lib/constants";
import { RoleGate } from "@/components/auth/RoleGate";

export default function SettingsPage() {
  return (
    <RoleGate allowedRoles={["owner", "manager"]}>
      <div className="space-y-5">
        <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-5 soft-shadow">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Restaurant profile</p>
          <h1 className="mt-1 text-3xl font-black text-[#2a1309]">Settings</h1>
          <p className="mt-2 text-base font-semibold text-[#7a3f1d]/70">Bill headers, tax, currency, and basic business details.</p>
        </div>

        <Card className="max-w-4xl overflow-hidden bg-white/85">
          <CardHeader className="bg-[#2a1309] text-white">
            <CardTitle className="text-2xl font-black">Business profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.name} />
              <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.phone} />
              <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.currency} />
              <Input className="h-12 rounded-2xl bg-white" type="number" defaultValue={restaurant.taxRate} />
            </div>
            <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.address} />
            <Button className="min-h-14 text-base">
              <Save className="h-5 w-5" />
              Save settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
