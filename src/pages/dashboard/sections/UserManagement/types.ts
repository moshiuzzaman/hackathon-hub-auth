export interface Profile {
  id: string;
  role: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  photo_url: string | null;
  linkedin_username: string | null;
  github_username: string | null;
  mentor_status: string | null;
  rejection_reason: string | null;
  mentor_approval_date: string | null;
  max_teams: number | null;
}

export type UserRole = 'admin' | 'organizer' | 'moderator' | 'mentor' | 'participant';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface EditUserFormValues {
  full_name: string;
  role: UserRole;
}