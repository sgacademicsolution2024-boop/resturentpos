import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/lib/settings-context";
import "./globals.css";

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
      <body>
        <SettingsProvider>
          <AuthProvider>{children}</AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
