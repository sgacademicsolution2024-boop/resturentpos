"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calculator,
  CookingPot,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Store,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS Billing", icon: Store },
  { href: "/menu", label: "Menu", icon: CookingPot },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/costing", label: "Costing & Profit", icon: Calculator },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings }
];

type SidebarProps = {
  onNavigate?: () => void;
};

import { useAuth, Role } from "@/lib/auth-context";
import { rolePermissions } from "@/lib/constants";

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { role, setRole } = useAuth();
  
  const allowedPaths = rolePermissions[role].map(p => `/${p}`);

  return (
    <aside className="flex h-full w-[240px] flex-col overflow-hidden rounded-r-[2rem] border-r border-orange-950/20 bg-[#20110a] text-orange-50 shadow-2xl shadow-orange-950/20">
      <div className="border-b border-white/10 p-5">
        <Link href="/pos" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-500 text-2xl shadow-lg shadow-orange-900/30">
            G
          </div>
          <div>
            <p className="text-lg font-black leading-tight text-white">Gaan Fun Khaan</p>
            <p className="text-xs font-medium text-orange-100/65">Restaurant POS</p>
          </div>
        </Link>
      </div>

      <div className="border-b border-white/10 p-4 bg-orange-950/20">
        <label className="text-[10px] font-black uppercase text-orange-400 mb-2 block">Simulate Login Role:</label>
        <select
          className="w-full rounded-xl bg-orange-900/50 px-3 py-2 text-sm font-bold text-white outline-none ring-1 ring-white/10 focus:ring-orange-500"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role);
            if (onNavigate) onNavigate();
          }}
        >
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
        </select>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1.5 p-3">
        {navItems
          .filter(item => allowedPaths.includes(item.href))
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-orange-50/65 transition hover:bg-white/10 hover:text-white",
                  active && "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-red-950/25"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="m-4 rounded-3xl border border-white/10 bg-white/8 p-4">
        <p className="text-sm font-black text-white">Dinner Rush</p>
        <p className="mt-1 text-xs leading-5 text-orange-100/65">Fast billing, clear costing, and profit alerts in one warm workspace.</p>
      </div>
    </aside>
  );
}
