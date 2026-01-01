import React from "react";
import AuthProvider from "@/components/auth/AuthForm";
import AppShell from "@/components/app-shell/AppShell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
