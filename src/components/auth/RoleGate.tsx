"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth, Role } from "@/lib/auth-context";

interface RoleGateProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGate({ allowedRoles, children, fallback, redirectTo }: RoleGateProps) {
  const { role, isLoading, currentUser } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isAllowed = role !== null && allowedRoles.includes(role);

  useEffect(() => {
    if (!isLoading && hasMounted && !isAllowed && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAllowed, redirectTo, router, hasMounted]);

  if (!hasMounted || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (redirectTo) {
    return null; // Will redirect via useEffect
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Not allowed default view
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-red-200 bg-white/5 p-8 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 shadow-sm">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-black text-white">Access Restricted</h2>
        <p className="mt-2 text-base font-semibold text-slate-300/70">
          You do not have permission to view this section.
        </p>
        <div className="mt-8">
          <Button size="lg" className="w-full" onClick={() => router.push(currentUser ? "/dashboard" : "/login")}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to {currentUser ? "Dashboard" : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
