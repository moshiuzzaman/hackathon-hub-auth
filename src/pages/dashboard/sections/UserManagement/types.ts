export type UserProfile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export type UserRole = "admin" | "organizer" | "moderator" | "mentor" | "participant";