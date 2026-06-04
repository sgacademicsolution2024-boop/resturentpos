"use client";

import { CostingCalculator } from "@/components/costing/CostingCalculator";
import { MenuCostTable } from "@/components/costing/MenuCostTable";
import { ProfitLossSummary } from "@/components/costing/ProfitLossSummary";
import { RoleGate } from "@/components/auth/RoleGate";

export default function CostingPage() {
  return (
    <RoleGate allowedRoles={["owner"]}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 glass-panel p-5 soft-shadow">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Financial controls</p>
          <h1 className="mt-1 text-3xl font-black text-white">Costing & Profit</h1>
          <p className="mt-2 text-base font-semibold text-slate-300/70">
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
