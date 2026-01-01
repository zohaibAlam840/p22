"use client";

import { BarChart3, CalendarDays, CheckCircle2, ShieldCheck, Timer, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MiniChart, StatPill } from "./bits";

export default function MockDashboard() {
  return (
    <div className="relative">
      <div className="rounded-3xl border bg-background/60 backdrop-blur shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Productivity Overview</div>
          <div className="text-xs text-muted-foreground">Weekly</div>
        </div>

        <MiniChart />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Card className="rounded-2xl border bg-background/70 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Design Branding</div>
                <div className="text-xs text-muted-foreground">35%</div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[35%] bg-foreground rounded-full" />
              </div>
              <div className="text-xs text-muted-foreground">Owner: Jack</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border bg-background/70 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Task Completed</div>
                <div className="text-xs text-muted-foreground">+8</div>
              </div>
              <div className="text-xs text-muted-foreground">Best result this week</div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Updates tracked</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Card className="rounded-2xl border bg-background/70 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <div className="text-sm font-medium">8h 12m</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Avg time spent (team)</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border bg-background/70 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <div className="text-sm font-medium">Meeting</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Aug 18 • 05:50 pm</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating pills (responsive: hidden on xs) */}
      <div className="hidden sm:block absolute -left-6 top-10">
        <StatPill icon={<Users className="h-5 w-5" />} value="Members" label="Invite with roles" />
      </div>
      <div className="hidden sm:block absolute -right-6 top-24">
        <StatPill icon={<BarChart3 className="h-5 w-5" />} value="Filters" label="Status • Priority" />
      </div>
      <div className="hidden md:block absolute left-10 -bottom-8">
        <StatPill icon={<ShieldCheck className="h-5 w-5" />} value="Secure" label="Cookie auth + RBAC" />
      </div>
    </div>
  );
}
