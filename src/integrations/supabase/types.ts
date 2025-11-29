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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_admin_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_admin_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "system_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_target_admin_id_fkey"
            columns: ["target_admin_id"]
            isOneToOne: false
            referencedRelation: "system_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      category_role_notifications: {
        Row: {
          assigned_by: string | null
          category_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          member_id: string
          role: string
        }
        Insert: {
          assigned_by?: string | null
          category_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          member_id: string
          role: string
        }
        Update: {
          assigned_by?: string | null
          category_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          member_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_role_notifications_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_role_notifications_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_role_notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      category_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          category_id: string
          group_id: string
          id: string
          is_active: boolean
          member_id: string
          role: Database["public"]["Enums"]["category_role"]
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          category_id: string
          group_id: string
          id?: string
          is_active?: boolean
          member_id: string
          role: Database["public"]["Enums"]["category_role"]
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          category_id?: string
          group_id?: string
          id?: string
          is_active?: boolean
          member_id?: string
          role?: Database["public"]["Enums"]["category_role"]
        }
        Relationships: [
          {
            foreignKeyName: "category_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_roles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_roles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_roles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          is_locked: boolean
          name: string
          total_balance: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          is_locked?: boolean
          name: string
          total_balance?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          is_locked?: boolean
          name?: string
          total_balance?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          created_by: string | null
          created_by_member_id: string | null
          description: string
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          created_by?: string | null
          created_by_member_id?: string | null
          description: string
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          created_by?: string | null
          created_by_member_id?: string | null
          description?: string
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          access_code: string
          created_at: string
          direction: Database["public"]["Enums"]["group_direction"]
          id: string
          is_active: boolean | null
          max_members: number | null
          monthly_fee: number | null
          municipality: string
          name: string
          plan_id: string | null
          president_id: string | null
          president_name: string | null
          province: string
          secretary_1_id: string | null
          secretary_1_name: string | null
          secretary_2_id: string | null
          secretary_2_name: string | null
          updated_at: string
          vice_president_1_id: string | null
          vice_president_1_name: string | null
          vice_president_2_id: string | null
          vice_president_2_name: string | null
        }
        Insert: {
          access_code: string
          created_at?: string
          direction: Database["public"]["Enums"]["group_direction"]
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          monthly_fee?: number | null
          municipality: string
          name: string
          plan_id?: string | null
          president_id?: string | null
          president_name?: string | null
          province: string
          secretary_1_id?: string | null
          secretary_1_name?: string | null
          secretary_2_id?: string | null
          secretary_2_name?: string | null
          updated_at?: string
          vice_president_1_id?: string | null
          vice_president_1_name?: string | null
          vice_president_2_id?: string | null
          vice_president_2_name?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["group_direction"]
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          monthly_fee?: number | null
          municipality?: string
          name?: string
          plan_id?: string | null
          president_id?: string | null
          president_name?: string | null
          province?: string
          secretary_1_id?: string | null
          secretary_1_name?: string | null
          secretary_2_id?: string | null
          secretary_2_name?: string | null
          updated_at?: string
          vice_president_1_id?: string | null
          vice_president_1_name?: string | null
          vice_president_2_id?: string | null
          vice_president_2_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "monthly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      member_payments: {
        Row: {
          amount_paid: number
          id: string
          member_id: string
          payment_event_id: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          id?: string
          member_id: string
          payment_event_id: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          id?: string
          member_id?: string
          payment_event_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_payments_payment_event_id_fkey"
            columns: ["payment_event_id"]
            isOneToOne: false
            referencedRelation: "payment_events"
            referencedColumns: ["id"]
          },
        ]
      }
      member_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          group_id: string
          id: string
          is_active: boolean
          member_id: string
          permission_level: Database["public"]["Enums"]["permission_level"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          group_id: string
          id?: string
          is_active?: boolean
          member_id: string
          permission_level?: Database["public"]["Enums"]["permission_level"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          group_id?: string
          id?: string
          is_active?: boolean
          member_id?: string
          permission_level?: Database["public"]["Enums"]["permission_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_permissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          birth_date: string | null
          birth_municipality: string | null
          birth_province: string | null
          created_at: string
          education_level: string | null
          group_id: string
          id: string
          is_active: boolean | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          member_code: string | null
          name: string
          neighborhood: string | null
          partition: string | null
          phone: string | null
          profession: string | null
          profile_image_url: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          birth_municipality?: string | null
          birth_province?: string | null
          created_at?: string
          education_level?: string | null
          group_id: string
          id?: string
          is_active?: boolean | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          member_code?: string | null
          name: string
          neighborhood?: string | null
          partition?: string | null
          phone?: string | null
          profession?: string | null
          profile_image_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          birth_municipality?: string | null
          birth_province?: string | null
          created_at?: string
          education_level?: string | null
          group_id?: string
          id?: string
          is_active?: boolean | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          member_code?: string | null
          name?: string
          neighborhood?: string | null
          partition?: string | null
          phone?: string | null
          profession?: string | null
          profile_image_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_plans: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          max_members: number
          name: string
          price_per_member: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_members: number
          name: string
          price_per_member?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_members?: number
          name?: string
          price_per_member?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          recipient_id: string
          recipient_type: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          recipient_id: string
          recipient_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          recipient_id?: string
          recipient_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_to_pay: number
          category_id: string | null
          created_at: string
          created_by: string | null
          created_by_member_id: string | null
          group_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_to_pay: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_member_id?: string | null
          group_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_to_pay?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_member_id?: string | null
          group_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      rehearsal_attendance: {
        Row: {
          created_at: string | null
          created_by: string | null
          group_id: string
          id: string
          member_id: string
          month_year: string
          rehearsal_date: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          group_id: string
          id?: string
          member_id: string
          month_year: string
          rehearsal_date: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          group_id?: string
          id?: string
          member_id?: string
          month_year?: string
          rehearsal_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehearsal_attendance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehearsal_attendance_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehearsal_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sheet_music: {
        Row: {
          author: string | null
          category: string
          created_at: string | null
          download_count: number | null
          event_type: string | null
          file_size: number | null
          file_url: string
          group_id: string | null
          id: string
          is_active: boolean | null
          partition: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string | null
          download_count?: number | null
          event_type?: string | null
          file_size?: number | null
          file_url: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          partition?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string | null
          download_count?: number | null
          event_type?: string | null
          file_size?: number | null
          file_url?: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          partition?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sheet_music_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sheet_music_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      system_admins: {
        Row: {
          access_attempts: number | null
          access_code: string
          created_at: string
          created_by: string | null
          created_by_admin_id: string | null
          email: string
          id: string
          is_active: boolean
          last_login_at: string | null
          locked_until: string | null
          name: string
          permission_level: Database["public"]["Enums"]["permission_level"]
          updated_at: string
        }
        Insert: {
          access_attempts?: number | null
          access_code: string
          created_at?: string
          created_by?: string | null
          created_by_admin_id?: string | null
          email: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          name: string
          permission_level?: Database["public"]["Enums"]["permission_level"]
          updated_at?: string
        }
        Update: {
          access_attempts?: number | null
          access_code?: string
          created_at?: string
          created_by?: string | null
          created_by_admin_id?: string | null
          email?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          name?: string
          permission_level?: Database["public"]["Enums"]["permission_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_admins_created_by_admin_id_fkey"
            columns: ["created_by_admin_id"]
            isOneToOne: false
            referencedRelation: "system_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_admins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "system_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "system_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_program_content: {
        Row: {
          audio_url: string | null
          category: string
          created_at: string
          expires_at: string
          group_id: string
          id: string
          image_url: string | null
          is_deleted: boolean
          items: Json | null
          title: string
        }
        Insert: {
          audio_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string
          group_id: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          items?: Json | null
          title: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string
          group_id?: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          items?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_program_content_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_financial_category: {
        Args: { p_category_id: string; p_member_id: string }
        Returns: boolean
      }
      can_manage_category: {
        Args: { p_category_id: string; p_member_id: string }
        Returns: boolean
      }
      clean_old_rehearsal_records: { Args: never; Returns: undefined }
      generate_admin_code: { Args: { prefix?: string }; Returns: string }
      generate_group_code: { Args: never; Returns: string }
      get_category_permission_level: {
        Args: { p_category_id: string; p_member_id: string }
        Returns: number
      }
      get_group_statistics: {
        Args: never
        Returns: {
          active_members: number
          group_id: string
          group_name: string
          is_active: boolean
          last_member_added: string
          leaders_count: number
          monthly_revenue: number
          municipality: string
          province: string
          total_members: number
        }[]
      }
      get_member_role_level: { Args: { p_member_id: string }; Returns: number }
      get_user_group_id: { Args: { p_member_id: string }; Returns: string }
      is_category_leader: {
        Args: { p_category_id: string; p_member_id: string }
        Returns: boolean
      }
      is_group_leader: {
        Args: { p_group_id: string; p_member_id: string }
        Returns: boolean
      }
      is_group_leadership: {
        Args: { p_group_id: string; p_member_id: string }
        Returns: boolean
      }
      is_member_of_group: {
        Args: { p_group_id: string; p_member_id: string }
        Returns: boolean
      }
      soft_delete_expired_weekly_programs: { Args: never; Returns: undefined }
    }
    Enums: {
      category_role: "presidente" | "secretario" | "auxiliar"
      group_direction:
        | "geral"
        | "nacional"
        | "provincial"
        | "municipal"
        | "comunal"
        | "seccao"
        | "zona"
      marital_status: "solteiro" | "casado" | "divorciado" | "viuvo"
      member_partition:
        | "soprano"
        | "contralto"
        | "tenor"
        | "baixo"
        | "instrumental"
      member_role:
        | "presidente"
        | "vice_presidente"
        | "secretario"
        | "tesoureiro"
        | "membro"
        | "coordenador"
      permission_level:
        | "super_admin"
        | "admin_principal"
        | "admin_adjunto"
        | "admin_supervisor"
        | "read"
        | "write"
        | "admin"
      user_type: "member" | "admin"
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
      category_role: ["presidente", "secretario", "auxiliar"],
      group_direction: [
        "geral",
        "nacional",
        "provincial",
        "municipal",
        "comunal",
        "seccao",
        "zona",
      ],
      marital_status: ["solteiro", "casado", "divorciado", "viuvo"],
      member_partition: [
        "soprano",
        "contralto",
        "tenor",
        "baixo",
        "instrumental",
      ],
      member_role: [
        "presidente",
        "vice_presidente",
        "secretario",
        "tesoureiro",
        "membro",
        "coordenador",
      ],
      permission_level: [
        "super_admin",
        "admin_principal",
        "admin_adjunto",
        "admin_supervisor",
        "read",
        "write",
        "admin",
      ],
      user_type: ["member", "admin"],
    },
  },
} as const
