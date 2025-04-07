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
      food_intolerance_data: {
        Row: {
          followup_plan: string | null
          form_id: string
          id: string
          last_updated: string
          recommendations: string | null
          symptoms: Json | null
          test_results: Json | null
          tested_foods: Json | null
        }
        Insert: {
          followup_plan?: string | null
          form_id: string
          id?: string
          last_updated?: string
          recommendations?: string | null
          symptoms?: Json | null
          test_results?: Json | null
          tested_foods?: Json | null
        }
        Update: {
          followup_plan?: string | null
          form_id?: string
          id?: string
          last_updated?: string
          recommendations?: string | null
          symptoms?: Json | null
          test_results?: Json | null
          tested_foods?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "food_intolerance_data_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          pdf_template_path: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          pdf_template_path?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          pdf_template_path?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      forms: {
        Row: {
          created_at: string
          created_by: string | null
          form_type_id: string
          id: string
          patient_id: string
          pdf_exported: boolean
          status: string
          status_updated_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          form_type_id: string
          id?: string
          patient_id: string
          pdf_exported?: boolean
          status?: string
          status_updated_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          form_type_id?: string
          id?: string
          patient_id?: string
          pdf_exported?: boolean
          status?: string
          status_updated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_form_type_id_fkey"
            columns: ["form_type_id"]
            isOneToOne: false
            referencedRelation: "form_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      health_screening_data: {
        Row: {
          diagnosis: string | null
          doctor_notes: string | null
          exercise_detail: Json | null
          follow_ups: Json | null
          form_id: string
          id: string
          last_updated: string
          medications: Json | null
          nurse_notes: string | null
          nutrition_recommendations: Json | null
          show_insulin_resistance: boolean | null
          sleep_stress_recommendations: Json | null
          summary_findings: Json | null
          supplements: Json | null
          treatment_plan: string | null
          vitals: Json | null
        }
        Insert: {
          diagnosis?: string | null
          doctor_notes?: string | null
          exercise_detail?: Json | null
          follow_ups?: Json | null
          form_id: string
          id?: string
          last_updated?: string
          medications?: Json | null
          nurse_notes?: string | null
          nutrition_recommendations?: Json | null
          show_insulin_resistance?: boolean | null
          sleep_stress_recommendations?: Json | null
          summary_findings?: Json | null
          supplements?: Json | null
          treatment_plan?: string | null
          vitals?: Json | null
        }
        Update: {
          diagnosis?: string | null
          doctor_notes?: string | null
          exercise_detail?: Json | null
          follow_ups?: Json | null
          form_id?: string
          id?: string
          last_updated?: string
          medications?: Json | null
          nurse_notes?: string | null
          nutrition_recommendations?: Json | null
          show_insulin_resistance?: boolean | null
          sleep_stress_recommendations?: Json | null
          summary_findings?: Json | null
          supplements?: Json | null
          treatment_plan?: string | null
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "health_screening_data_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          dosage: string
          id: string
          link: string | null
          name: string
          notes: string | null
          type: string
        }
        Insert: {
          dosage: string
          id?: string
          link?: string | null
          name: string
          notes?: string | null
          type: string
        }
        Update: {
          dosage?: string
          id?: string
          link?: string | null
          name?: string
          notes?: string | null
          type?: string
        }
        Relationships: []
      }
      patient_form_data: {
        Row: {
          diagnosis: string | null
          doctor_name: string | null
          doctor_notes: string | null
          exercise_detail: Json | null
          exercise_recommendations: string | null
          follow_ups: Json | null
          id: string
          last_updated: string
          medications: Json | null
          nurse_notes: string | null
          nutrition_recommendations: Json | null
          patient_id: string
          show_insulin_resistance: boolean | null
          sleep_stress_recommendations: Json | null
          summary_findings: Json | null
          supplements: Json | null
          treatment_plan: string | null
          vitals: Json | null
        }
        Insert: {
          diagnosis?: string | null
          doctor_name?: string | null
          doctor_notes?: string | null
          exercise_detail?: Json | null
          exercise_recommendations?: string | null
          follow_ups?: Json | null
          id?: string
          last_updated?: string
          medications?: Json | null
          nurse_notes?: string | null
          nutrition_recommendations?: Json | null
          patient_id: string
          show_insulin_resistance?: boolean | null
          sleep_stress_recommendations?: Json | null
          summary_findings?: Json | null
          supplements?: Json | null
          treatment_plan?: string | null
          vitals?: Json | null
        }
        Update: {
          diagnosis?: string | null
          doctor_name?: string | null
          doctor_notes?: string | null
          exercise_detail?: Json | null
          exercise_recommendations?: string | null
          follow_ups?: Json | null
          id?: string
          last_updated?: string
          medications?: Json | null
          nurse_notes?: string | null
          nutrition_recommendations?: Json | null
          patient_id?: string
          show_insulin_resistance?: boolean | null
          sleep_stress_recommendations?: Json | null
          summary_findings?: Json | null
          supplements?: Json | null
          treatment_plan?: string | null
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_form_data_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          created_by: string | null
          date_of_birth: string
          gender: string
          id: string
          last_updated: string
          medical_record_number: string
          name: string
          pdf_exported: boolean
          status: string
          status_updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          gender: string
          id?: string
          last_updated?: string
          medical_record_number: string
          name: string
          pdf_exported?: boolean
          status?: string
          status_updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          gender?: string
          id?: string
          last_updated?: string
          medical_record_number?: string
          name?: string
          pdf_exported?: boolean
          status?: string
          status_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_files: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          form_id: string | null
          id: string
          patient_id: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          form_id?: string | null
          id?: string
          patient_id: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          form_id?: string | null
          id?: string
          patient_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_files_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_files_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_patient_statuses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
