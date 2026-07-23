// Hand-authored to match supabase/migrations/0001_identity_and_access.sql.
// Regenerate with `supabase gen types typescript --linked` once the project
// is CLI-linked, and extend this file as later phases add tables.

export type MembershipStatus = "pending" | "active" | "suspended" | "revoked";
export type MemberRole = "guest" | "member" | "moderator" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          status: MembershipStatus;
          role: MemberRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: MembershipStatus;
          role?: MemberRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: MembershipStatus;
          role?: MemberRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      access_codes: {
        Row: {
          id: string;
          code: string;
          max_uses: number;
          uses_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          max_uses?: number;
          uses_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          max_uses?: number;
          uses_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      redemptions: {
        Row: {
          id: string;
          access_code_id: string;
          user_id: string;
          redeemed_at: string;
        };
        Insert: {
          id?: string;
          access_code_id: string;
          user_id: string;
          redeemed_at?: string;
        };
        Update: {
          id?: string;
          access_code_id?: string;
          user_id?: string;
          redeemed_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      habit_check_ins: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_on: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_on?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      teaching_categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      teachings: {
        Row: {
          id: string;
          category_id: string | null;
          title: string;
          summary: string;
          required_role: MemberRole;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          title: string;
          summary: string;
          required_role?: MemberRole;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          title?: string;
          summary?: string;
          required_role?: MemberRole;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      teaching_content: {
        Row: {
          teaching_id: string;
          body: string;
        };
        Insert: {
          teaching_id: string;
          body: string;
        };
        Update: {
          teaching_id?: string;
          body?: string;
        };
        Relationships: [];
      };
      teaching_progress: {
        Row: {
          id: string;
          user_id: string;
          teaching_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          teaching_id: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          teaching_id?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          xp_reward: number;
          starts_at: string | null;
          ends_at: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          xp_reward?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          xp_reward?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      challenge_participation: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          joined_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          joined_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          joined_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          challenge_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          reason: string;
          challenge_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          reason?: string;
          challenge_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          starts_at: string;
          ends_at: string | null;
          join_url: string | null;
          location: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          starts_at: string;
          ends_at?: string | null;
          join_url?: string | null;
          location?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          starts_at?: string;
          ends_at?: string | null;
          join_url?: string | null;
          location?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      event_rsvps: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          rsvped_at: string;
          attended: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          rsvped_at?: string;
          attended?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          rsvped_at?: string;
          attended?: boolean;
        };
        Relationships: [];
      };
      drops: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          is_key_drop: boolean;
          price_cents: number | null;
          currency: string;
          external_url: string | null;
          is_sold_out: boolean;
          available_from: string | null;
          available_until: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          is_key_drop?: boolean;
          price_cents?: number | null;
          currency?: string;
          external_url?: string | null;
          is_sold_out?: boolean;
          available_from?: string | null;
          available_until?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          is_key_drop?: boolean;
          price_cents?: number | null;
          currency?: string;
          external_url?: string | null;
          is_sold_out?: boolean;
          available_from?: string | null;
          available_until?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_table: string | null;
          target_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_table?: string | null;
          target_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_table?: string | null;
          target_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      active_member_ids: {
        Row: {
          user_id: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      redeem_access_code: {
        Args: { p_code: string };
        Returns: MembershipStatus;
      };
      complete_challenge: {
        Args: { p_challenge_id: string };
        Returns: number;
      };
    };
    Enums: {
      membership_status: MembershipStatus;
      member_role: MemberRole;
    };
  };
}
