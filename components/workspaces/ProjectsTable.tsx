"use client";

import Link from "next/link";
import type { ProjectItem } from "@/lib/api/project";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, ChevronRight } from "lucide-react";

export default function ProjectsTable({
  workspaceId,
  projects,
}: {
  workspaceId: string;
  projects: ProjectItem[];
}) {
  return (
    <div className="border rounded-2xl overflow-hidden bg-background">
      {/* Header / Hint bar */}
      <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">Projects</div>
          <div className="text-xs text-muted-foreground">
            Click a project name to open it and view tasks.
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span>Sorted as provided</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Project</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Tasks</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.map((p) => {
            const href = `/workspaces/${workspaceId}/projects/${p.id}`;
            const tasks = p._count?.tasks ?? null;

            return (
              <TableRow
                key={p.id}
                className="group hover:bg-muted/40 transition-colors"
              >
                {/* Project cell */}
                <TableCell className="font-medium">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-1 -mx-2 -my-1
                               hover:bg-background/60 focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`Open project ${p.name}`}
                    title="Open project"
                  >
                    <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="truncate max-w-[220px] sm:max-w-[320px]">
                      {p.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  {/* Small helper text under name (mobile-friendly) */}
                  <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                    Tap to open
                  </div>
                </TableCell>

                {/* Description */}
                <TableCell className="text-muted-foreground">
                  <div className="truncate max-w-[420px]" title={p.description || ""}>
                    {p.description || "—"}
                  </div>
                </TableCell>

                {/* Tasks */}
                <TableCell className="text-right">
                  {typeof tasks === "number" ? (
                    <span
                      className="inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium
                                 bg-muted"
                      title="Total tasks in this project"
                    >
                      {tasks}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            );
          })}

          {projects.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="py-12 text-center"
              >
                <div className="text-sm font-medium">No projects yet</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Create a project to start organizing tasks.
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Footer hint (optional, helps clarity) */}
      {projects.length > 0 && (
        <div className="px-4 sm:px-5 py-3 border-t text-xs text-muted-foreground">
          Tip: Hover a row to see the “open” arrow. Click the project name to enter the project.
        </div>
      )}
    </div>
  );
}
