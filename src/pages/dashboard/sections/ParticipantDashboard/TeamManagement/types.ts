export interface TechnologyStack {
  id: string;
  name: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  profile: {
    id: string;
    full_name: string | null;
  };
}

export interface TeamWithDetails {
  id: string;
  name: string;
  join_code: string;
  is_ready: boolean;
  stack?: {
    id: string;
    name: string;
  };
  mentor?: {
    full_name: string | null;
  } | null;
  members?: TeamMember[];
}