"use client";

import { Badge } from "@/components/ui/badge";
import type { WorkspaceRole } from "@/lib/rbac/workspace";

export default function WorkspaceRoleBadge({ role }: { role: WorkspaceRole }) {
  return <Badge variant="secondary">{role}</Badge>;
}
