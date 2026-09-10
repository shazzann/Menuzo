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
      admins: {
        Row: {
          id: string
          email: string
          role: string
          display_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          display_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          display_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          discount: number | null
          final_price: number
          id: string
          image: string | null
          is_available: boolean | null
          is_special_offer: boolean | null
          name: string
          original_price: number
          shop_id: string
          tagline: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          final_price: number
          id?: string
          image?: string | null
          is_available?: boolean | null
          is_special_offer?: boolean | null
          name: string
          original_price: number
          shop_id: string
          tagline?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          final_price?: number
          id?: string
          image?: string | null
          is_available?: boolean | null
          is_special_offer?: boolean | null
          name?: string
          original_price?: number
          shop_id?: string
          tagline?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string | null
          username: string | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string | null
          username?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string | null
          username?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          id: string
          shop_id: string
          profile_id: string
          plan_id: string
          amount: number
          currency: string
          reference: string | null
          proof_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          profile_id: string
          plan_id: string
          amount: number
          currency?: string
          reference?: string | null
          proof_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          profile_id?: string
          plan_id?: string
          amount?: number
          currency?: string
          reference?: string | null
          proof_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          }
        ]
      }
      shops: {
        Row: {
          banner: string | null
          category_order: string[] | null
          contact_number: string | null
          contacts: Json | null
          created_at: string
          description: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          is_open: boolean | null
          location: string | null
          logo: string | null
          name: string
          tagline: string | null
          user_id: string
          website: string | null
          theme: Json | null
          opening_hours: Json | null
          username: string | null
          view_count: number | null
          qr_scan_count: number | null
        }
        Insert: {
          banner?: string | null
          category_order?: string[] | null
          contact_number?: string | null
          contacts?: Json | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_open?: boolean | null
          location?: string | null
          logo?: string | null
          name?: string
          tagline?: string | null
          user_id: string
          website?: string | null
          theme?: Json | null
          username?: string | null
          opening_hours?: Json | null
          view_count?: number | null
          qr_scan_count?: number | null
        }
        Update: {
          banner?: string | null
          category_order?: string[] | null
          contact_number?: string | null
          contacts?: Json | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_open?: boolean | null
          location?: string | null
          logo?: string | null
          name?: string
          tagline?: string | null
          user_id?: string
          website?: string | null
          theme?: Json | null
          username?: string | null
          opening_hours?: Json | null
          view_count?: number | null
          qr_scan_count?: number | null
        }
        Relationships: []
      }
      shop_daily_stats: {
        Row: {
          id: string
          shop_id: string
          date: string
          views: number
          qr_scans: number
        }
        Insert: {
          id?: string
          shop_id: string
          date: string
          views?: number
          qr_scans?: number
        }
        Update: {
          id?: string
          shop_id?: string
          date?: string
          views?: number
          qr_scans?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_daily_stats_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      approve_payment: {
        Args: {
          p_payment_id: string
        }
        Returns: Json
      }
      reject_payment: {
        Args: {
          p_payment_id: string
          p_reason: string
        }
        Returns: Json
      }
      increment_shop_visits: {
        Args: {
          p_shop_id: string
          p_is_qr: boolean
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
