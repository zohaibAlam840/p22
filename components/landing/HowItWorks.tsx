"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function HowItWorks() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm text-muted-foreground">How it works</div>
        <h2 className="text-2xl font-semibold">Start in minutes</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl bg-background/70 backdrop-blur border">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs text-muted-foreground">Step 1</div>
            <div className="font-semibold">Create a workspace</div>
            <div className="text-sm text-muted-foreground">
              You become the OWNER and can manage access.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-background/70 backdrop-blur border">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs text-muted-foreground">Step 2</div>
            <div className="font-semibold">Invite members</div>
            <div className="text-sm text-muted-foreground">
              Add admins or members. OWNER controls role changes.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-background/70 backdrop-blur border">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs text-muted-foreground">Step 3</div>
            <div className="font-semibold">Track tasks</div>
            <div className="text-sm text-muted-foreground">
              Filter by status/priority/assignee and review logs for updates.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
