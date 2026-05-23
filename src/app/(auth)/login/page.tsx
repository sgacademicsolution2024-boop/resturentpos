import { Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <CardTitle>Sign in to TableStack</CardTitle>
          <p className="text-sm text-muted-foreground">Access POS billing, costing, stock, staff, and reports.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" placeholder="owner@restaurant.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Supabase Auth is wired in the project layer; connect credentials in environment variables.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
