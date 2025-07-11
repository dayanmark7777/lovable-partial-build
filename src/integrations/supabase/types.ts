export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      classes: {
        Row: {
          class_center_address: string
          class_center_name: string
          class_organizer_name: string
          contact_number: string
          course_id: string
          created_at: string
          district: string
          district_leader_name: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          class_center_address: string
          class_center_name: string
          class_organizer_name: string
          contact_number: string
          course_id: string
          created_at?: string
          district: string
          district_leader_name: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          class_center_address?: string
          class_center_name?: string
          class_organizer_name?: string
          contact_number?: string
          course_id?: string
          created_at?: string
          district?: string
          district_leader_name?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          description: string | null
          duration: string
          id: string
          name: string
          subjects: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          duration: string
          id?: string
          name: string
          subjects?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          duration?: string
          id?: string
          name?: string
          subjects?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lecturer_class_assignments: {
        Row: {
          assigned_date: string
          class_id: string
          id: string
          lecturer_id: string
          schedule_info: Json | null
          status: string
        }
        Insert: {
          assigned_date?: string
          class_id: string
          id?: string
          lecturer_id: string
          schedule_info?: Json | null
          status?: string
        }
        Update: {
          assigned_date?: string
          class_id?: string
          id?: string
          lecturer_id?: string
          schedule_info?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecturer_class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecturer_class_assignments_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
        ]
      }
      lecturers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          status: string
          subjects: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string
          subjects?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          subjects?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          class_id: string
          created_at: string
          end_time: string
          id: string
          lecturer_id: string
          location: string | null
          notes: string | null
          scheduled_date: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          end_time: string
          id?: string
          lecturer_id: string
          location?: string | null
          notes?: string | null
          scheduled_date: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          end_time?: string
          id?: string
          lecturer_id?: string
          location?: string | null
          notes?: string | null
          scheduled_date?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_course_enrollments: {
        Row: {
          class_id: string | null
          completion_date: string | null
          course_id: string
          enrollment_date: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id?: string | null
          completion_date?: string | null
          course_id: string
          enrollment_date?: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string | null
          completion_date?: string | null
          course_id?: string
          enrollment_date?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_course_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          district: string
          email: string
          full_name: string
          id: string
          index_number: string
          national_id: string
          personal_file_url: string | null
          status: string
          systematic_theology_project: boolean
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          district: string
          email: string
          full_name: string
          id?: string
          index_number: string
          national_id: string
          personal_file_url?: string | null
          status?: string
          systematic_theology_project?: boolean
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          created_at?: string
          district?: string
          email?: string
          full_name?: string
          id?: string
          index_number?: string
          national_id?: string
          personal_file_url?: string | null
          status?: string
          systematic_theology_project?: boolean
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_lecturer_availability: {
        Args: {
          p_lecturer_id: string
          p_date: string
          p_start_time: string
          p_end_time: string
          p_exclude_schedule_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
