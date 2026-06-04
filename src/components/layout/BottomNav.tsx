"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Package, Wallet, BarChart3, Menu as MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export function BottomNav() {
  const pathname = usePathname();
  const { isAdmin, isManager } = useAuth();
  
  // As per spec: 🏠 Dashboard, 🧾 POS, 📦 Inventory, 💰 Expenses, 📊 Reports
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, allowed: isAdmin || isManager },
    { href: "/pos", label: "POS", icon: Store, allowed: isAdmin || isManager },
    { href: "/inventory", label: "Inventory", icon: Package, allowed: isAdmin || isManager },
    { href: "/expenses", label: "Expenses", icon: Wallet, allowed: isAdmin },
    { href: "/reports", label: "Reports", icon: BarChart3, allowed: isAdmin },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-slate-200 bg-white pb-safe pt-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      {items.filter(i => i.allowed).map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 transition-colors",
              active ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
              active && "bg-blue-100 shadow-sm text-blue-700"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[10px] font-bold tracking-wide",
              active && "text-blue-700"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
      
      {/* Mobile Menu Toggle for other items (Settings, Staff, Menu config) */}
      <Link
        href="/settings"
        className={cn(
          "flex flex-col items-center justify-center gap-1 w-16 transition-colors",
          pathname === "/settings" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
        )}
      >
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
          pathname === "/settings" && "bg-blue-100 shadow-sm text-blue-700"
        )}>
          <MenuIcon className="h-5 w-5" />
        </div>
        <span className={cn(
          "text-[10px] font-bold tracking-wide",
          pathname === "/settings" && "text-blue-700"
        )}>
          Menu
        </span>
      </Link>
    </nav>
  );
}
