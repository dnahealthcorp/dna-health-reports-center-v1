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
