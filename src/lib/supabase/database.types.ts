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
      library_items: {
        Row: {
          created_at: string
          id: string
          original_text: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_text: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          original_text?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      library_chunks: {
        Row: {
          content: string
          content_tsv: unknown
          created_at: string
          id: string
          library_item_id: string
          position: number
          user_id: string
        }
        Insert: {
          content: string
          content_tsv?: unknown
          created_at?: string
          id?: string
          library_item_id: string
          position: number
          user_id: string
        }
        Update: {
          content?: string
          content_tsv?: unknown
          created_at?: string
          id?: string
          library_item_id?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_chunks_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
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
