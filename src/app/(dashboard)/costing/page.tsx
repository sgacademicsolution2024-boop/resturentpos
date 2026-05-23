"use client";

import { CostingCalculator } from "@/components/costing/CostingCalculator";
import { MenuCostTable } from "@/components/costing/MenuCostTable";
import { ProfitLossSummary } from "@/components/costing/ProfitLossSummary";
import { RoleGate } from "@/components/auth/RoleGate";

export default function CostingPage() {
  return (
    <RoleGate allowedRoles={["owner"]}>
      <div className="space-y-5">
        <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-5 soft-shadow">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Financial controls</p>
          <h1 className="mt-1 text-3xl font-black text-[#2a1309]">Costing & Profit</h1>
          <p className="mt-2 text-base font-semibold text-[#7a3f1d]/70">
            Track raw material costs, packaging, and calculate profit margins per item.
          </p>
        </div>
        <ProfitLossSummary />
        <CostingCalculator />
        <MenuCostTable />
      </div>
    </RoleGate>
  );
}
