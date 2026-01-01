"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OrgRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

type OrganizationListItem = {
  id: string;
  name: string;
  myRole: OrgRole;
};

function getOrgIdFromPath(pathname: string | null) {
  if (!pathname) return null;
  const m = pathname.match(/\/org\/([^/]+)/);
  return m?.[1] ?? null;
}

export default function OrganizationSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const activeId = getOrgIdFromPath(pathname);

  const [items, setItems] = React.useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      /**
       * Expected schema:
       * - organizations(id, name)
       * - org_memberships(org_id, user_id, role, created_at)
       *
       * The select below uses a join (alias) to pull org info.
       * If your FK/relationship is named differently, adjust the select.
       */
      const { data, error } = await supabase
        .from("org_memberships")
        .select("role, organizations:org_id ( id, name )")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const orgs: OrganizationListItem[] =
        (data ?? [])
          .map((row: any) => ({
            id: row.organizations?.id as string,
            name: row.organizations?.name as string,
            myRole: row.role as OrgRole,
          }))
          .filter((o) => Boolean(o.id && o.name)) ?? [];

      setItems(orgs);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  const active = items.find((o) => o.id === activeId);
  const label = active ? `${active.name} (${active.myRole})` : "Select organization";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[260px] justify-between" disabled={loading}>
          <span className="truncate">{loading ? "Loading…" : label}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[340px]">
        <DropdownMenuLabel>Your organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 && <DropdownMenuItem disabled>No organizations yet</DropdownMenuItem>}

        {items.map((o) => (
          <DropdownMenuItem
            key={o.id}
            onClick={() => router.push(`/org/${o.id}/tickets`)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{o.name}</span>
            <span className="text-xs text-muted-foreground">{o.myRole}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={refresh}>Refresh</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/org/new")}>Create organization</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
