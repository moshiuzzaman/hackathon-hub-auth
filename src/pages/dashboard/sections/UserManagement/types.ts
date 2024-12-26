export type UserProfile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type UserRole = "admin" | "organizer" | "moderator" | "mentor" | "participant";

export type EditUserFormValues = {
  full_name: string;
  role: UserRole;
};