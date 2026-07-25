// Generated via `mcp__supabase__generate_typescript_types` (Phase 0 of the
// V3 plan closed out the hand-authored-drift risk this file used to carry
// across all of V2). Regenerate the same way after any future migration —
// do not hand-edit the `Database` type below.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          drop_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          label: string | null
          max_uses: number
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          drop_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          drop_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      challenge_participation: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participation_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description: string
          ends_at: string | null
          id: string
          is_group: boolean
          is_published: boolean
          starts_at: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          ends_at?: string | null
          id?: string
          is_group?: boolean
          is_published?: boolean
          starts_at?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          is_group?: boolean
          is_published?: boolean
          starts_at?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["connection_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
        }
        Relationships: []
      }
      drop_claims: {
        Row: {
          access_code_id: string | null
          claimed_at: string
          drop_id: string
          id: string
          user_id: string
        }
        Insert: {
          access_code_id?: string | null
          claimed_at?: string
          drop_id: string
          id?: string
          user_id: string
        }
        Update: {
          access_code_id?: string | null
          claimed_at?: string
          drop_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drop_claims_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drop_claims_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
        ]
      }
      drops: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string
          currency: string
          description: string
          early_access_hours: number
          external_url: string | null
          id: string
          image_url: string | null
          is_key_drop: boolean
          is_published: boolean
          is_sold_out: boolean
          price_cents: number | null
          required_tier_id: string | null
          title: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          currency?: string
          description: string
          early_access_hours?: number
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_key_drop?: boolean
          is_published?: boolean
          is_sold_out?: boolean
          price_cents?: number | null
          required_tier_id?: string | null
          title: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          currency?: string
          description?: string
          early_access_hours?: number
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_key_drop?: boolean
          is_published?: boolean
          is_sold_out?: boolean
          price_cents?: number | null
          required_tier_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "drops_required_tier_id_fkey"
            columns: ["required_tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          attended: boolean
          event_id: string
          id: string
          rsvped_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean
          event_id: string
          id?: string
          rsvped_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean
          event_id?: string
          id?: string
          rsvped_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
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
          description: string
          ends_at: string | null
          id: string
          is_published: boolean
          join_url: string | null
          location: string | null
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          ends_at?: string | null
          id?: string
          is_published?: boolean
          join_url?: string | null
          location?: string | null
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          is_published?: boolean
          join_url?: string | null
          location?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      habit_check_ins: {
        Row: {
          completed_on: string
          created_at: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_on: string
          created_at?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_on?: string
          created_at?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_check_ins_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_grace_tokens: {
        Row: {
          consumed_at: string | null
          consumed_for_date: string | null
          granted_at: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          consumed_for_date?: string | null
          granted_at?: string
          id?: string
          source: string
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          consumed_for_date?: string | null
          granted_at?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      identity_markers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_availability_slots: {
        Row: {
          booked_request_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          join_url: string | null
          mentor_id: string
          starts_at: string
        }
        Insert: {
          booked_request_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          join_url?: string | null
          mentor_id: string
          starts_at: string
        }
        Update: {
          booked_request_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          join_url?: string | null
          mentor_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_slots_booked_request_id_fkey"
            columns: ["booked_request_id"]
            isOneToOne: false
            referencedRelation: "mentorship_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_availability_slots_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bio: string
          created_at: string
          focus_areas: string[]
          headline: string
          id: string
          is_accepting_requests: boolean
          is_approved: boolean
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bio: string
          created_at?: string
          focus_areas?: string[]
          headline: string
          id?: string
          is_accepting_requests?: boolean
          is_approved?: boolean
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string
          created_at?: string
          focus_areas?: string[]
          headline?: string
          id?: string
          is_accepting_requests?: boolean
          is_approved?: boolean
          user_id?: string
        }
        Relationships: []
      }
      mentorship_requests: {
        Row: {
          created_at: string
          id: string
          join_url: string | null
          member_id: string
          mentor_id: string
          message: string | null
          responded_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["mentorship_request_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          join_url?: string | null
          member_id: string
          mentor_id: string
          message?: string | null
          responded_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["mentorship_request_status"]
        }
        Update: {
          created_at?: string
          id?: string
          join_url?: string | null
          member_id?: string
          mentor_id?: string
          message?: string | null
          responded_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["mentorship_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pod_members: {
        Row: {
          id: string
          joined_at: string
          pod_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          pod_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          pod_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
        ]
      }
      pods: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          identity_marker: string | null
          onboarding_completed_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          identity_marker?: string | null
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          identity_marker?: string | null
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          access_code_id: string
          id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          access_code_id: string
          id?: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          access_code_id?: string
          id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          context: string | null
          created_at: string
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          name: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          name: string
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          name?: string
          starts_at?: string
        }
        Relationships: []
      }
      teaching_categories: {
        Row: {
          created_at: string
          id: string
          mentor_id: string | null
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "teaching_categories_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      teaching_content: {
        Row: {
          body: string
          teaching_id: string
        }
        Insert: {
          body: string
          teaching_id: string
        }
        Update: {
          body?: string
          teaching_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_content_teaching_id_fkey"
            columns: ["teaching_id"]
            isOneToOne: true
            referencedRelation: "teachings"
            referencedColumns: ["id"]
          },
        ]
      }
      teaching_progress: {
        Row: {
          completed_at: string
          id: string
          teaching_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          teaching_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          teaching_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_progress_teaching_id_fkey"
            columns: ["teaching_id"]
            isOneToOne: false
            referencedRelation: "teachings"
            referencedColumns: ["id"]
          },
        ]
      }
      teachings: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          is_published: boolean
          required_role: Database["public"]["Enums"]["member_role"]
          sort_order: number
          summary: string
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          required_role?: Database["public"]["Enums"]["member_role"]
          sort_order?: number
          summary: string
          title: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          required_role?: Database["public"]["Enums"]["member_role"]
          sort_order?: number
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "teaching_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tiers: {
        Row: {
          created_at: string
          id: string
          min_points: number
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          min_points?: number
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          min_points?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          challenge_id: string | null
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          challenge_id?: string | null
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          challenge_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_member_ids: {
        Row: {
          user_id: string | null
        }
        Insert: {
          user_id?: string | null
        }
        Update: {
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      book_mentorship_slot: {
        Args: { p_message?: string; p_slot_id: string }
        Returns: string
      }
      cancel_mentorship_request: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      complete_challenge: { Args: { p_challenge_id: string }; Returns: number }
      complete_mentorship_request: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      confirm_mentorship_request: {
        Args: {
          p_join_url: string
          p_request_id: string
          p_scheduled_at: string
        }
        Returns: boolean
      }
      consume_grace_token: { Args: { p_date: string }; Returns: boolean }
      create_notification: {
        Args: {
          p_action_url?: string
          p_body?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      decline_mentorship_request: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      get_group_challenge_progress: {
        Args: { p_challenge_id: string }
        Returns: {
          active_member_count: number
          completed_count: number
        }[]
      }
      get_pod_accountability: {
        Args: { p_pod_id: string }
        Returns: {
          active_habit_count: number
          activity_dates: string[]
          checked_in_today: boolean
          member_id: string
        }[]
      }
      grant_grace_token: { Args: { p_source: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_pod_member: { Args: { p_pod_id: string }; Returns: boolean }
      redeem_access_code: {
        Args: { p_code: string }
        Returns: Database["public"]["Enums"]["membership_status"]
      }
      request_connection: { Args: { p_recipient_id: string }; Returns: string }
      respond_connection: {
        Args: { p_accept: boolean; p_connection_id: string }
        Returns: boolean
      }
      update_mentor_profile: {
        Args: {
          p_bio: string
          p_focus_areas: string[]
          p_headline: string
          p_is_accepting_requests: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "declined"
      member_role: "guest" | "member" | "moderator" | "admin"
      membership_status: "pending" | "active" | "suspended" | "revoked"
      mentorship_request_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "declined"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      connection_status: ["pending", "accepted", "declined"],
      member_role: ["guest", "member", "moderator", "admin"],
      membership_status: ["pending", "active", "suspended", "revoked"],
      mentorship_request_status: [
        "pending",
        "confirmed",
        "completed",
        "declined",
        "cancelled",
      ],
    },
  },
} as const

// --- Convenience aliases used throughout lib/ and app/ ---------------------
// MembershipStatus/MemberRole/ConnectionStatus/MentorshipRequestStatus are
// real Postgres enums, derived directly from the generated Database type
// above so they can never drift from the schema.
export type MembershipStatus = Database["public"]["Enums"]["membership_status"];
export type MemberRole = Database["public"]["Enums"]["member_role"];
export type ConnectionStatus = Database["public"]["Enums"]["connection_status"];
export type MentorshipRequestStatus =
  Database["public"]["Enums"]["mentorship_request_status"];

// reports.status is a plain `text` column with a CHECK constraint, not a
// real Postgres enum (see 0035_reports.sql) — generation correctly reflects
// it as `string`. This narrowed alias is hand-maintained on purpose; keep
// it in sync with the CHECK constraint if that ever changes.
export type ReportStatus = "open" | "resolved" | "dismissed";
