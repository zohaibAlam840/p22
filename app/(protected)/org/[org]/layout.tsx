import React from "react";
import Link from "next/link";
import { requireOrg } from "@/lib/org/requireOrg";
import OrgNav from "./_components/OrgNav";

export const dynamic = "force-dynamic";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const ctx = await requireOrg(org);

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">Organization</div>
            <div className="text-lg font-semibold truncate">{ctx.org.name}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Role: <span className="font-medium text-foreground">{ctx.role}</span>
            </div>
            <Link className="text-sm underline text-muted-foreground" href="/organizations">
              Switch org
            </Link>
          </div>
        </div>

        {/* Horizontal navigation bar */}
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <OrgNav orgId={ctx.org.id} role={ctx.role} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
