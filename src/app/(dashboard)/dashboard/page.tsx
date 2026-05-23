"use client";

import { useAuth } from "@/lib/auth-context";
import { RoleGate } from "@/components/auth/RoleGate";
import { OwnerProfitDashboard } from "@/components/dashboard/OwnerProfitDashboard";
import { ManagerSalesDashboard } from "@/components/dashboard/ManagerSalesDashboard";

export default function DashboardPage() {
  const { role } = useAuth();

  return (
    <RoleGate allowedRoles={["owner", "manager"]} redirectTo="/pos">
      {role === "owner" ? <OwnerProfitDashboard /> : <ManagerSalesDashboard />}
    </RoleGate>
  );
}
