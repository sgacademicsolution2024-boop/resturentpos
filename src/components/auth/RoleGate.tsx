"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth, Role } from "@/lib/auth-context";

interface RoleGateProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGate({ allowedRoles, children, fallback, redirectTo }: RoleGateProps) {
  const { role } = useAuth();
  const router = useRouter();
  const isAllowed = allowedRoles.includes(role);

  useEffect(() => {
    if (!isAllowed && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isAllowed, redirectTo, router]);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (redirectTo) {
    return null; // Will redirect via useEffect
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-red-200 bg-white/85 p-8 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 shadow-sm">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-black text-[#2a1309]">Access Restricted</h2>
        <p className="mt-2 text-base font-semibold text-[#7a3f1d]/70">
          Only the restaurant owner can view this section.
        </p>
        <div className="mt-8">
          <Button size="lg" className="w-full" onClick={() => router.push(role === "cashier" ? "/pos" : "/dashboard")}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to {role === "cashier" ? "POS" : "Dashboard"}
          </Button>
        </div>
      </div>
    </div>
  );
}
