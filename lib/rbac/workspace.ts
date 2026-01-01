export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export type WorkspaceAction =
  | "workspace:invite"
  | "workspace:removeMember"
  | "workspace:changeRole"
  | "project:create"
  | "project:update"
  | "project:delete"
  | "task:create"
  | "task:update:any"
  | "task:update:assigned"
  | "task:delete";

export function can(role: WorkspaceRole, action: WorkspaceAction): boolean {
  switch (action) {
    case "workspace:invite":
    case "workspace:removeMember":
    case "project:create":
    case "project:update":
    case "project:delete":
    case "task:create":
    case "task:update:any":
    case "task:delete":
      return role === "OWNER" || role === "ADMIN";

    case "workspace:changeRole":
      return role === "OWNER";

    case "task:update:assigned":
      return role === "OWNER" || role === "ADMIN" || role === "MEMBER";

    default:
      return false;
  }
}
