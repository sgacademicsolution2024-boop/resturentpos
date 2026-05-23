"use client";

import { Shield, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { RoleGate } from "@/components/auth/RoleGate";

const staff = [
  { name: "Bapi", email: "owner@gaanfunkhaan.in", role: "owner" },
  { name: "Rahul Das", email: "manager@gaanfunkhaan.in", role: "manager" },
  { name: "Ayesha Ali", email: "cashier@gaanfunkhaan.in", role: "cashier" }
];

export default function StaffPage() {
  return (
    <RoleGate allowedRoles={["owner"]}>
      <div className="space-y-5">
        <div className="rounded-[2rem] border border-orange-200/70 bg-white/75 p-5 soft-shadow">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">Team access</p>
          <h1 className="mt-1 text-3xl font-black text-[#2a1309]">Staff roles</h1>
          <p className="mt-2 text-base font-semibold text-[#7a3f1d]/70">Owner has full access, manager has operations, cashier has POS only.</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
          <Card className="overflow-hidden bg-white/85">
            <CardHeader className="bg-[#2a1309] text-white">
              <CardTitle className="text-2xl font-black">Invite staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input className="h-12 rounded-2xl bg-white" placeholder="Email address" />
              <Select className="h-12 rounded-2xl bg-white">
                <option>manager</option>
                <option>cashier</option>
              </Select>
              <Button className="min-h-14 w-full text-base">
                <UserPlus className="h-5 w-5" />
                Send invite
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-[#2a1309]">Team</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {staff.map((member) => (
                <div key={member.email} className="rounded-[1.75rem] border border-orange-200 bg-orange-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-[#2a1309]">{member.name}</p>
                      <p className="mt-1 text-sm font-semibold text-[#7a3f1d]/70">{member.email}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-black text-orange-700">
                      <Shield className="h-4 w-4" />
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGate>
  );
}
