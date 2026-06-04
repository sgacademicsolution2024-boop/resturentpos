"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CookingPot,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Store,
  Users,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isAdmin, isManager } = useAuth();
  
  // Admin Nav: Dashboard, POS, Menu, Inventory, Expenses, Reports, Staff, Settings.
  // Manager Nav: Dashboard, POS, Orders, Inventory.
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, allowed: isAdmin || isManager },
    { href: "/pos", label: "POS Billing", icon: Store, allowed: isAdmin || isManager },
    { href: "/orders", label: "Orders", icon: ReceiptText, allowed: isManager }, // Manager explicitly needs orders per spec
    { href: "/menu", label: "Menu", icon: CookingPot, allowed: isAdmin },
    { href: "/inventory", label: "Inventory", icon: Package, allowed: isAdmin || isManager },
    { href: "/expenses", label: "Expenses", icon: Wallet, allowed: isAdmin },
    { href: "/reports", label: "Reports", icon: BarChart3, allowed: isAdmin },
    { href: "/staff", label: "Staff", icon: Users, allowed: isAdmin },
    { href: "/settings", label: "Settings", icon: Settings, allowed: isAdmin }
  ];

  return (
    <aside className="hidden md:flex h-full w-[240px] flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-300 relative z-50">
      <div className="border-b border-slate-800 p-5">
        <Link href="/pos" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl shadow-lg shadow-blue-900/20">
            T
          </div>
          <div>
            <p className="text-lg font-black leading-tight text-white">TableStack</p>
            <p className="text-xs font-medium text-slate-400">Restaurant POS</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1.5 p-3">
        {navItems
          .filter(item => item.allowed)
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-sm font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white group",
                  active && "bg-slate-800 text-white"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  active ? "bg-blue-600 text-white" : "bg-transparent group-hover:bg-slate-700"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                {item.label}
              </Link>
            );
          })}
      </nav>

      {currentUser && (
        <div className="m-4 rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">{currentUser.full_name}</p>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">{currentUser.role}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
