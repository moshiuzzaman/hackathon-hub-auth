import type { Json } from "@/integrations/supabase/types";

export interface News {
  id: string;
  title: string;
  content: string;
  meta_info: {
    tags?: string[];
    category?: string;
  } | Json;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  meta_info?: {
    tags?: string[];
    category?: string;
  };
  published_at?: string | null;
}