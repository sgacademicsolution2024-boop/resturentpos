"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-orange-50/30">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/45 lg:hidden">
          <div className="relative h-full w-[240px]">
            <Sidebar onNavigate={() => setOpen(false)} />
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : null}

      <Topbar onMenuClick={() => setOpen(true)} />
      <main className="lg:ml-[240px]">
        <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
