"use client";

import { useAuth } from "@/lib/auth-context";
import { RoleGate } from "@/components/auth/RoleGate";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ManagerSalesDashboard } from "@/components/dashboard/ManagerSalesDashboard";

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  return (
    <RoleGate allowedRoles={["admin", "manager"]} redirectTo="/pos">
      {isAdmin ? <AdminDashboard /> : <ManagerSalesDashboard />}
    </RoleGate>
  );
}
