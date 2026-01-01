"use client";

import React from "react";
import Link from "next/link";
import { LogOut, User, Ticket, Bell } from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import OrganizationSwitcher from "./WorkspaceSwitcher";
import { useAuth } from "@/lib/auth/auth-store";
import { logout } from "@/lib/api/auth";

// optional: keep if you still want notifications
import { useNotifications } from "@/lib/realtime/useNotifications";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrgIdFromPath(pathname: string | null) {
  if (!pathname) return null;
  const m = pathname.match(/\/org\/([^/]+)/);
  return m?.[1] ?? null;
}

function getNotifHref(payload: any, orgId: string | null) {
  // Adapt to your notification payload. Example:
  if (payload?.ticketId && orgId) return `/org/${orgId}/tickets/${payload.ticketId}`;
  if (orgId) return `/org/${orgId}/tickets`;
  return "/org";
}

function getNotifTitle(payload: any) {
  const t = payload?.type ?? "NOTIFICATION";
  const title = payload?.title ? `: ${payload.title}` : "";

  switch (t) {
    case "TICKET_CREATED":
      return `Ticket created${title}`;
    case "TICKET_UPDATED":
      return `Ticket updated${title}`;
    case "COMMENT_ADDED":
      return `Comment added${title}`;
    default:
      return `${t}${title}`;
  }
}

function getNotifSubtitle(payload: any) {
  if (payload?.type === "TICKET_UPDATED" && payload?.message) return payload.message;
  return "";
}

export default function Topbar() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const orgId = getOrgIdFromPath(pathname);

  const { items, unread, markAllRead, clearAll } = useNotifications();

  async function onLogout() {
    try {
      await logout();
      // if your auth-store listens to auth state changes, refresh is optional but harmless
      await refresh();
      toast.success("Logged out");
      router.replace("/login");
    } catch (e: any) {
      toast.error(e?.message ?? "Logout failed");
    }
  }

  const nameFromMeta =
    (user?.user_metadata?.name as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined);

  const initials = ((nameFromMeta ?? user?.email ?? "U").slice(0, 2)).toUpperCase();

  const ticketsHref = orgId ? `/org/${orgId}/tickets` : "/org";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <OrganizationSwitcher />
          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={ticketsHref} className="gap-2">
              <Ticket className="h-4 w-4" />
              Tickets
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications (optional) */}
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) markAllRead();
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 w-9 px-0 rounded-xl relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] leading-[18px] text-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[360px] p-0">
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="text-sm font-medium">Notifications</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAllRead();
                    }}
                  >
                    Mark read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearAll();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator />

              {items.length === 0 ? (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">No notifications yet.</div>
              ) : (
                <div className="max-h-[420px] overflow-auto">
                  {items.map((n) => {
                    const href = getNotifHref(n.payload, orgId);
                    const title = getNotifTitle(n.payload);
                    const sub = getNotifSubtitle(n.payload);

                    return (
                      <DropdownMenuItem
                        key={n.id}
                        className="p-0 focus:bg-accent"
                        onSelect={(e) => {
                          e.preventDefault();
                          router.push(href);
                        }}
                      >
                        <div className="w-full px-3 py-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{title}</div>
                              {sub ? (
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{sub}</div>
                              ) : null}
                            </div>
                            <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {formatTime(n.at)}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:block text-sm text-muted-foreground truncate max-w-[240px]">{user?.email}</div>

          {/* Account menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 px-2 rounded-xl">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-flex ml-2 text-sm">Account</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="truncate">{user?.email ?? "Signed in"}</span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={ticketsHref}>Tickets</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
