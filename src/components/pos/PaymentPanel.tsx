"use client";

import { Banknote, CreditCard, Smartphone } from "lucide-react";
import type { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaymentPanelProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

const methods: Array<{ value: PaymentMethod; label: string; icon: typeof Banknote }> = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard }
];

export function PaymentPanel({ value, onChange }: PaymentPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {methods.map((method) => {
        const Icon = method.icon;
        return (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            className={cn(
              "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 transition hover:bg-slate-100",
              value === method.value && "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
            )}
          >
            <Icon className="h-5 w-5" />
            {method.label}
          </button>
        );
      })}
    </div>
  );
}
