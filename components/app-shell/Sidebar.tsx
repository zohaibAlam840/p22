"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------
// Nav Item (polished active state + icon chip)
// ---------------------------------------------
function NavItem({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: any;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
        "hover:bg-muted/60",
        active && "bg-muted"
      )}
    >
      {/* left accent bar on active */}
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-transparent transition-colors",
          active && "bg-foreground"
        )}
      />

      {/* icon chip */}
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl border bg-background transition-colors",
          "group-hover:bg-background",
          active && "border-foreground/20"
        )}
      >
        <Icon className={cn("h-4 w-4", active ? "text-foreground" : "text-muted-foreground")} />
      </span>

      <span className={cn("min-w-0 flex-1 truncate", active && "font-medium")}>
        {label}
      </span>

      {/* subtle active dot */}
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-transparent transition-colors",
          active && "bg-foreground"
        )}
      />
    </Link>
  );
}

// ---------------------------------------------
// Sidebar content (used by desktop + mobile)
// ---------------------------------------------
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  // detect current workspaceId if we're inside /workspaces/:id/...
  const m = pathname?.match(/\/workspaces\/([^/]+)/);
  const wid = m?.[1];

  const projectsHref = wid ? `/workspaces/${wid}/projects` : "/dashboard";
  const membersHref = wid ? `/workspaces/${wid}/members` : "/dashboard";

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-2 pt-2">
        <div className="flex items-center gap-3 rounded-2xl border bg-background px-3 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-background font-semibold">
            W
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold leading-tight">Workspace TM</div>
            <div className="truncate text-xs text-muted-foreground">
              Workspaces • Projects • Tasks
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 pt-4">
        <Separator />
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-5">
          {/* Main */}
          <div>
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Main
            </div>
            <div className="space-y-1">
              <NavItem
                href="/dashboard"
                label="Dashboard"
                icon={LayoutDashboard}
                onNavigate={onNavigate}
              />
              <NavItem
                href="/my-task"
                label="My Tasks"
                icon={CheckSquare}
                onNavigate={onNavigate}
              />
            </div>
          </div>

          {/* Workspace scoped */}
          <div>
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Workspace {wid ? "" : "(pick one first)"}
            </div>

            <div className="space-y-1">
              <NavItem
                href={projectsHref}
                label="Projects"
                icon={FolderKanban}
                onNavigate={onNavigate}
              />
              <NavItem
                href={membersHref}
                label="Members"
                icon={Users}
                onNavigate={onNavigate}
              />
            </div>

            {!wid && (
              <div className="mt-2 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
                Open a workspace from <span className="font-medium text-foreground">Dashboard</span>{" "}
                to manage its Projects and Members.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Bottom hint / footer */}
      <div className="p-3">
        <div className="rounded-2xl border bg-background p-3 text-xs text-muted-foreground">
          Tip: Use <span className="font-medium text-foreground">My Tasks</span> as your personal inbox
          across all workspaces.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Exported Sidebar: desktop + mobile drawer
// ---------------------------------------------
export default function Sidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Mobile trigger (place this in your topbar if you have one) */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[320px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>

            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-72 border-r min-h-screen bg-background">
        <SidebarContent />
      </aside>
    </>
  );
}
