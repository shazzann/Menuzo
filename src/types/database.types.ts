export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      menus: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          cover_image: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          cover_image?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          cover_image?: string | null
          user_id?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          created_at: string
          menu_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          menu_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          menu_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
        }
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
  }
}
