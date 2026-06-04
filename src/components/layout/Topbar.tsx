"use client";

import Link from "next/link";
import { LogOut, Menu, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/lib/settings-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { restaurantData } = useSettings();
  const { currentUser, signOut } = useAuth();
  const router = useRouter();
  const now = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:ml-[240px]">
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="bg-slate-100 text-slate-700 min-h-[48px] lg:hidden" onClick={onMenuClick} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Live restaurant desk</p>
            <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">{restaurantData.name}</h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm flex items-center min-h-[48px]">
            {now}
          </div>
          {currentUser && (
            <div className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow flex items-center min-h-[48px]">
              {currentUser.full_name}
            </div>
          )}
          <Link href="/dashboard">
            <Button variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 min-h-[48px]">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 min-h-[48px]">Orders</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" className="bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-h-[48px]">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button variant="danger" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 min-h-[48px]" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
