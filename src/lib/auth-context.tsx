"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "owner" | "manager" | "cashier";

export interface User {
  name: string;
  role: Role;
}

interface AuthContextType {
  currentUser: User;
  role: Role;
  setRole: (role: Role) => void;
  isOwner: boolean;
  isManager: boolean;
  isCashier: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // DEV ONLY role switcher state. 
  // Replace with Supabase profiles.role after auth integration.
  const [role, setRole] = useState<Role>("owner");

  const users: Record<Role, User> = {
    owner: { name: "Restaurant Owner", role: "owner" },
    manager: { name: "Restaurant Manager", role: "manager" },
    cashier: { name: "Ayesha", role: "cashier" }
  };

  const currentUser = users[role];

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        setRole,
        isOwner: role === "owner",
        isManager: role === "manager",
        isCashier: role === "cashier"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
