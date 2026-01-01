"use client";

import React from "react";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RecentProjectsCard({
  loading,
  workspaceId,
  projects,
  canDelete,
  onDelete,
}: {
  loading: boolean;
  workspaceId: string;
  projects: { id: string; name: string; tasks: number; createdAt?: string }[];
  canDelete: boolean;
  onDelete: (projectId: string) => Promise<void>;
}) {
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await onDelete(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">Recent projects</div>
            <div className="text-sm text-muted-foreground">
              Quick access to the latest projects in this workspace
            </div>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={`/workspaces/${workspaceId}/projects`}>
              View all
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="mt-5 space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-muted-foreground">No projects yet.</div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <Link
                  href={`/workspaces/${workspaceId}/projects/${p.id}`}
                  className="min-w-0"
                >
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.tasks} tasks</div>
                </Link>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/workspaces/${workspaceId}/projects/${p.id}`}>Open</Link>
                  </Button>

                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === p.id}
                        >
                          <Trash2 className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {busyId === p.id ? "Deleting…" : "Delete"}
                          </span>
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the project and all its tasks and activity logs.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
