export type UserRole = "admin" | "user" | "superadmin";

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  companyName?: string;
  emailNotifications?: boolean;
  createdAt: string;
}
