export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      benefit_assignments: {
        Row: {
          benefit_id: string
          created_at: string
          id: string
          is_redeemed: boolean | null
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          benefit_id: string
          created_at?: string
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          benefit_id?: string
          created_at?: string
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_benefit_assignments_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_benefit_assignments_mentor_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      benefits: {
        Row: {
          coupon_code: string
          created_at: string
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_assigned: boolean | null
          provider_name: string | null
          provider_website: string | null
          redemption_instructions: string | null
          updated_at: string
          user_type: string | null
          vendor_id: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_assigned?: boolean | null
          provider_name?: string | null
          provider_website?: string | null
          redemption_instructions?: string | null
          updated_at?: string
          user_type?: string | null
          vendor_id?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_assigned?: boolean | null
          provider_name?: string | null
          provider_website?: string | null
          redemption_instructions?: string | null
          updated_at?: string
          user_type?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefits_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      event_gallery: {
        Row: {
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          image_url: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image_url: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image_url?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_gallery_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          meta_info: Json | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          meta_info?: Json | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          meta_info?: Json | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          type: Database["public"]["Enums"]["legal_document_type"]
          updated_at: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          type: Database["public"]["Enums"]["legal_document_type"]
          updated_at?: string | null
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          type?: Database["public"]["Enums"]["legal_document_type"]
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_stacks: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          stack_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          stack_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          stack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_stacks_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_stacks_stack_id_fkey"
            columns: ["stack_id"]
            isOneToOne: false
            referencedRelation: "technology_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          meta_info: Json | null
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          meta_info?: Json | null
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          meta_info?: Json | null
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          type: Database["public"]["Enums"]["setting_type"]
          updated_at: string
          validation_schema: Json | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          type?: Database["public"]["Enums"]["setting_type"]
          updated_at?: string
          validation_schema?: Json | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          type?: Database["public"]["Enums"]["setting_type"]
          updated_at?: string
          validation_schema?: Json | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          github_username: string | null
          id: string
          linkedin_username: string | null
          max_teams: number | null
          mentor_approval_date: string | null
          mentor_status: string | null
          photo_url: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          github_username?: string | null
          id: string
          linkedin_username?: string | null
          max_teams?: number | null
          mentor_approval_date?: string | null
          mentor_status?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          github_username?: string | null
          id?: string
          linkedin_username?: string | null
          max_teams?: number | null
          mentor_approval_date?: string | null
          mentor_status?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      technology_stacks: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          is_enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          redemption_instructions: string
          updated_at: string
          website: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name: string
          redemption_instructions: string
          updated_at?: string
          website: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          redemption_instructions?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_version: {
        Args: {
          doc_type: Database["public"]["Enums"]["legal_document_type"]
        }
        Returns: unknown
      }
      increment_semver: {
        Args: {
          current_version: unknown
        }
        Returns: unknown
      }
    }
    Enums: {
      legal_document_type: "terms" | "privacy"
      setting_type: "smtp" | "registration" | "system"
      user_role: "admin" | "organizer" | "moderator" | "mentor" | "participant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
