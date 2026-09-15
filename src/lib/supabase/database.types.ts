export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      reflections: {
        Row: {
          content: string
          created_at: string
          id: string
          reflection: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reflection: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reflection?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
