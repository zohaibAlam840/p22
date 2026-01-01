"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/lib/auth/auth-store";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, init } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <Separator />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
