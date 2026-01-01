"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SecurityCTA({
  primaryLabel,
  loading,
  onPrimary,
}: {
  primaryLabel: string;
  loading: boolean;
  onPrimary: () => void;
}) {
  return (
    <Card className="rounded-3xl bg-background/70 backdrop-blur border">
      <CardContent className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Security</div>
          <div className="text-xl font-semibold">Role-based access that matches your backend</div>
          <div className="text-sm text-muted-foreground max-w-2xl">
            Workspace membership gates data access. OWNER/ADMIN manage projects and deletes.
            MEMBERS can update only tasks assigned to them. Activity logs keep a clear audit trail.
          </div>
        </div>

        <Button className="rounded-full" size="lg" onClick={onPrimary} disabled={loading}>
          {primaryLabel}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
