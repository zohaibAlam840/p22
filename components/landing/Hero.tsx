"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MeUser } from "@/lib/hooks/useMe";
import MockDashboard from "./MockDashboard";

export default function Hero({
  user,
  loading,
  primaryLabel,
  onPrimary,
}: {
  user: MeUser;
  loading: boolean;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
   
      <div className="space-y-6">

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
          Manage your <span className="text-muted-foreground">Team</span>, Tasks & Projects
          <span className="block">in one place</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
          Create workspaces, invite members, build projects, and track tasks with priorities,
          due dates, filters, and activity logs — all secured with workspace roles.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="rounded-full"
            onClick={onPrimary}
            disabled={loading}
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {!user && (
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link href="/login">Try login</Link>
            </Button>
          )}
        </div>

        {!loading && user && (
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          Secure cookie auth • Membership checks • Audit logs
        </div>
      </div>

      {/* Right */}
      <MockDashboard />
    </div>
  );
}
