export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export const rolePerms = {
  OWNER: {
    invite: true,
    removeMember: true,
    changeRole: true,
    manageProjects: true,
    deleteTask: true,
    editAnyTask: true,
  },
  ADMIN: {
    invite: true,
    removeMember: true,
    changeRole: false,
    manageProjects: true,
    deleteTask: true,
    editAnyTask: true,
  },
  MEMBER: {
    invite: false,
    removeMember: false,
    changeRole: false,
    manageProjects: false,
    deleteTask: false,
    editAnyTask: false,
  },
} as const;
