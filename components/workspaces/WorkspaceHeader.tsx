"use client";

import Link from "next/link";
import WorkspaceRoleBadge from "./WorkspaceRoleBadge";
import type { WorkspaceRole } from "@/lib/rbac/workspace";

export default function WorkspaceHeader({
  workspaceId,
  name,
  role,
}: {
  workspaceId: string;
  name: string;
  role: WorkspaceRole;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm text-muted-foreground">Workspace</div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold truncate">{name}</h1>
          <WorkspaceRoleBadge role={role} />
        </div>
        <div className="text-sm text-muted-foreground mt-1 flex gap-3">
          <Link className="hover:underline" href={`/workspaces/${workspaceId}`}>Overview</Link>
          <Link className="hover:underline" href={`/workspaces/${workspaceId}/projects`}>Projects</Link>
          <Link className="hover:underline" href={`/workspaces/${workspaceId}/members`}>Members</Link>
        </div>
      </div>
    </div>
  );
}
