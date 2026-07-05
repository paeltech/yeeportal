import type { UserRole } from "./types";
import { ADMIN_ROLES, STAFF_ROLES } from "./types";

export function isStaff(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function isAdmin(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canManageDocuments(role: UserRole): boolean {
  return isStaff(role);
}

export function canReviewApplications(role: UserRole): boolean {
  return isAdmin(role);
}

export function canManageUsers(role: UserRole): boolean {
  return role === "super_admin";
}

export function canManageGroup(
  role: UserRole,
  userGroupId: string | null,
  targetGroupId: string,
): boolean {
  if (isStaff(role)) return true;
  if (role === "group_leader" && userGroupId === targetGroupId) return true;
  return false;
}

export function getDefaultDashboardPath(role: UserRole): string {
  switch (role) {
    case "super_admin":
    case "program_manager":
      return "/dashboard";
    case "field_officer":
      return "/dashboard/groups";
    case "group_leader":
      return "/dashboard/my-group";
    case "member":
      return "/dashboard/profile";
    default:
      return "/dashboard";
  }
}

export function getNavItemsForRole(role: UserRole) {
  const base = [{ to: "/dashboard" as const, label: "Overview", exact: true }];

  if (canReviewApplications(role)) {
    base.push({ to: "/dashboard/applications" as const, label: "Applications", exact: false });
  }

  if (isStaff(role)) {
    base.push(
      { to: "/dashboard/groups" as const, label: "Groups", exact: false },
      { to: "/dashboard/documents" as const, label: "Documents", exact: false },
    );
  }

  if (role === "group_leader") {
    base.push({ to: "/dashboard/my-group" as const, label: "My group", exact: false });
  }

  if (canManageUsers(role)) {
    base.push({ to: "/dashboard/users" as const, label: "Users", exact: false });
  }

  if (role === "member") {
    base.push({ to: "/dashboard/profile" as const, label: "My profile", exact: false });
  }

  return base;
}
