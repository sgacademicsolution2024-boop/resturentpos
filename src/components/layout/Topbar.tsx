"use client";

import Link from "next/link";
import { LogOut, Menu, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/lib/settings-context";
import { useAuth, Role } from "@/lib/auth-context";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { restaurantData } = useSettings();
  const { role, setRole, currentUser } = useAuth();
  const now = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-orange-200/70 glass-panel lg:ml-[240px]">
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="bg-white/70 lg:hidden" onClick={onMenuClick} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Live restaurant desk</p>
            <h1 className="text-xl font-black tracking-tight text-[#2a1309] md:text-2xl">{restaurantData.name}</h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50/50 px-3 py-1.5 shadow-sm">
            <span className="text-[10px] font-black uppercase text-orange-700">Dev Role:</span>
            <select
              className="bg-transparent text-sm font-bold text-[#3b1c0f] outline-none cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          <div className="rounded-2xl bg-white/75 px-4 py-2 text-sm font-bold text-[#3b1c0f] shadow-sm">
            {now}
          </div>
          <div className="rounded-2xl bg-[#2a1309] px-4 py-2 text-sm font-bold text-orange-50">
            {currentUser.name}
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">
              <ShoppingBag className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="secondary">Orders</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" className="bg-white/70">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button variant="danger">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
