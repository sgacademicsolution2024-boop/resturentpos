import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/lib/settings-context";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gaan Fun Khaan POS",
  description: "Warm restaurant POS SaaS for billing, costing, inventory, and reporting."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
