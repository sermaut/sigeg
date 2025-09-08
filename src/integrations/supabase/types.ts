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
      financial_categories: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          name: string
          total_balance: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          name: string
          total_balance?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
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
        ]
      }
      groups: {
        Row: {
          access_code: string | null
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
          access_code?: string | null
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
          access_code?: string | null
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
          partition: Database["public"]["Enums"]["member_partition"] | null
          phone: string | null
          profession: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["member_role"] | null
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
          partition?: Database["public"]["Enums"]["member_partition"] | null
          phone?: string | null
          profession?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["member_role"] | null
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
          partition?: Database["public"]["Enums"]["member_partition"] | null
          phone?: string | null
          profession?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["member_role"] | null
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
      payment_events: {
        Row: {
          amount_to_pay: number
          created_at: string
          created_by: string | null
          group_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_to_pay: number
          created_at?: string
          created_by?: string | null
          group_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_to_pay?: number
          created_at?: string
          created_by?: string | null
          group_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_admin_code: {
        Args: { prefix?: string }
        Returns: string
      }
    }
    Enums: {
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
