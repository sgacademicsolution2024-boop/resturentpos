"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { restaurant } from "@/lib/constants";
import { RoleGate } from "@/components/auth/RoleGate";

export default function SettingsPage() {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

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
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#4a2311]">Restaurant Name</span>
                <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.name} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#4a2311]">Phone Number</span>
                <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.phone} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#4a2311]">Currency Symbol</span>
                <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.currency} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#4a2311]">Tax Rate (%)</span>
                <Input className="h-12 rounded-2xl bg-white" type="number" defaultValue={restaurant.taxRate} />
              </label>
            </div>
            <label className="space-y-2 block">
              <span className="text-sm font-bold text-[#4a2311]">Address</span>
              <Input className="h-12 rounded-2xl bg-white" defaultValue={restaurant.address} />
            </label>
            <div className="pt-2 flex items-center gap-4">
              <Button onClick={handleSave} className="min-h-14 text-base min-w-[160px]">
                {isSaved ? <Check className="h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                {isSaved ? "Saved!" : "Save settings"}
              </Button>
              {isSaved && <span className="text-sm font-bold text-green-600">Settings updated successfully!</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
