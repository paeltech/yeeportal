export const USER_ROLES = [
  "super_admin",
  "program_manager",
  "field_officer",
  "group_leader",
  "member",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  wardId: string | null;
  groupId: string | null;
  phone: string | null;
};

export type AuthSession = {
  userId: string;
  email: string;
  profile: UserProfile;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  program_manager: "Program Manager",
  field_officer: "Field Officer",
  group_leader: "Group Leader",
  member: "Member",
};

export const STAFF_ROLES: UserRole[] = ["super_admin", "program_manager", "field_officer"];

export const ADMIN_ROLES: UserRole[] = ["super_admin", "program_manager"];
