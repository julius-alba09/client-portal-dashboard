export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clients: {
        Row: {
          avatar: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          notion_id: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          avatar?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          notion_id?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          avatar?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notion_id?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      database_mappings: {
        Row: {
          clients_db_id: string | null
          created_at: string | null
          id: string
          projects_db_id: string | null
          tasks_db_id: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          clients_db_id?: string | null
          created_at?: string | null
          id?: string
          projects_db_id?: string | null
          tasks_db_id?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          clients_db_id?: string | null
          created_at?: string | null
          id?: string
          projects_db_id?: string | null
          tasks_db_id?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "database_mappings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notion_tokens: {
        Row: {
          access_token: string
          bot_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          owner_email: string | null
          owner_name: string | null
          updated_at: string | null
          user_id: string
          workspace_icon: string | null
          workspace_id: string
          workspace_name: string | null
        }
        Insert: {
          access_token: string
          bot_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          owner_email?: string | null
          owner_name?: string | null
          updated_at?: string | null
          user_id: string
          workspace_icon?: string | null
          workspace_id: string
          workspace_name?: string | null
        }
        Update: {
          access_token?: string
          bot_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          owner_email?: string | null
          owner_name?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_icon?: string | null
          workspace_id?: string
          workspace_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notion_tokens_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          notion_id: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          settings: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          notion_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          notion_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notion_id: string | null
          operation: string
          record_id: string | null
          status: Database["public"]["Enums"]["sync_status"] | null
          table_name: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notion_id?: string | null
          operation: string
          record_id?: string | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          table_name: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notion_id?: string | null
          operation?: string
          record_id?: string | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          table_name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assignee: string | null
          client_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          notion_id: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          settings: Json | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          actual_hours?: number | null
          assignee?: string | null
          client_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          notion_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          actual_hours?: number | null
          assignee?: string | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          notion_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notion_workspace_id: string | null
          owner_id: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notion_workspace_id?: string | null
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notion_workspace_id?: string | null
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tasks_with_details: {
        Args: { p_client_id?: string; p_workspace_id: string }
        Returns: {
          actual_hours: number
          assignee: string
          client_email: string
          client_id: string
          client_name: string
          created_at: string
          description: string
          due_date: string
          estimated_hours: number
          id: string
          notion_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          project_id: string
          project_name: string
          project_status: Database["public"]["Enums"]["project_status"]
          status: Database["public"]["Enums"]["task_status"]
          tags: string[]
          title: string
          updated_at: string
          workspace_id: string
        }[]
      }
      get_user_workspace_ids: {
        Args: Record<PropertyKey, never>
        Returns: {
          workspace_id: string
        }[]
      }
    }
    Enums: {
      client_status: "active" | "inactive" | "pending"
      priority_level: "low" | "medium" | "high" | "urgent"
      project_status:
        | "not_started"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
      sync_status: "pending" | "syncing" | "completed" | "failed"
      task_status: "todo" | "in_progress" | "review" | "done" | "blocked"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      client_status: ["active", "inactive", "pending"],
      priority_level: ["low", "medium", "high", "urgent"],
      project_status: [
        "not_started",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
      ],
      sync_status: ["pending", "syncing", "completed", "failed"],
      task_status: ["todo", "in_progress", "review", "done", "blocked"],
    },
  },
} as const

