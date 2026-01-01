"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MeUser } from "@/lib/hooks/useMe";

export default function NavBar({ user, loading }: { user: MeUser; loading: boolean }) {
  return (
    <header className="relative z-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-foreground text-background grid place-items-center font-semibold">
            W
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Workspace TM</div>
            <div className="text-xs text-muted-foreground">Workspaces • Projects • Tasks</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">

          <a className="hover:text-foreground transition-colors" href="#how">How it works</a>
          <a className="hover:text-foreground transition-colors" href="#security">Security</a>
        </nav>

        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/signup">
                  Sign up <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </>
          )}

          {!loading && user && (
            <Button asChild className="rounded-full">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
