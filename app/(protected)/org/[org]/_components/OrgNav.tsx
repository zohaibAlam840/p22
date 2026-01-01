"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrgRole } from "@/lib/org/requireOrg";

function isAtLeast(role: OrgRole, min: OrgRole) {
  const order: OrgRole[] = ["VIEWER", "MEMBER", "ADMIN", "OWNER"];
  return order.indexOf(role) >= order.indexOf(min);
}

function isActive(pathname: string, href: string) {
  // exact match OR nested routes (e.g. /tickets/[ticketId] should keep Tickets active)
  return pathname === href || pathname.startsWith(href + "/");
}

export default function OrgNav({ orgId, role }: { orgId: string; role: OrgRole }) {
  const pathname = usePathname();

  const items = [
    { href: `/org/${orgId}`, label: "Overview", show: true },
    { href: `/org/${orgId}/tickets`, label: "Tickets", show: true },
    { href: `/org/${orgId}/audit`, label: "Audit Log", show: true },
    { href: `/org/${orgId}/members`, label: "Members", show: isAtLeast(role, "ADMIN") },
    { href: `/org/${orgId}/tags`, label: "Tags", show: isAtLeast(role, "MEMBER") },
    { href: `/org/${orgId}/settings`, label: "Settings", show: isAtLeast(role, "ADMIN") },
  ].filter((x) => x.show);

  return (
    <nav className="border rounded-2xl bg-background">
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto">
        {items.map((it) => {
          const active = isActive(pathname, it.href);

          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                "shrink-0 rounded-xl px-3 py-2 text-sm transition-colors",
                active ? "bg-muted font-medium" : "hover:bg-muted/60",
              ].join(" ")}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
