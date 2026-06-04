import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "hover:bg-slate-100 text-slate-700",
        variant === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        size === "sm" && "min-h-[48px] px-3 text-sm",
        size === "md" && "min-h-[48px] px-4 text-sm",
        size === "lg" && "min-h-[56px] px-5 text-base",
        size === "icon" && "min-h-[48px] w-12",
        className
      )}
      {...props}
    />
  );
}
