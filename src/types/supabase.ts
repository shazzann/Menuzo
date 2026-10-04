import type { BankTransferSettings, BillingPeriod, PaymentRequest, ShopCustomUrl } from './billing';
import type { AdminPaymentRequest, AdminShopSubscription, BillingPage, ShopBillingDetails } from './company-billing';

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
      billing_periods: {
        Row: BillingPeriod
        Insert: Omit<BillingPeriod, 'active'> & { active?: boolean }
        Update: Partial<BillingPeriod>
        Relationships: []
      }
      bank_transfer_settings: {
        Row: BankTransferSettings
        Insert: Partial<BankTransferSettings>
        Update: Partial<BankTransferSettings>
        Relationships: []
      }
      billing_payment_requests: {
        Row: PaymentRequest
        Insert: Omit<PaymentRequest, 'id' | 'created_at' | 'status' | 'requested_slug' | 'customer_note' | 'rejection_reason' | 'reviewed_at'> &
          Partial<Pick<PaymentRequest, 'id' | 'created_at' | 'status' | 'requested_slug' | 'customer_note' | 'rejection_reason' | 'reviewed_at'>>
        Update: Partial<PaymentRequest>
        Relationships: []
      }
      shop_custom_urls: {
        Row: ShopCustomUrl
        Insert: Omit<ShopCustomUrl, 'created_at'> & { created_at?: string }
        Update: Partial<ShopCustomUrl>
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
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Relationships: []
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
      admin_get_shop_billing: {
        Args: { p_shop_id: string; p_status: string; p_offset: number }
        Returns: ShopBillingDetails
      }
      is_company_billing_admin: { Args: Record<string, never>; Returns: boolean }
      admin_list_billing_requests: {
        Args: { p_status: string; p_query: string; p_offset: number }
        Returns: BillingPage<AdminPaymentRequest>
      }
      admin_list_shop_subscriptions: {
        Args: { p_query: string; p_offset: number }
        Returns: BillingPage<AdminShopSubscription>
      }
      admin_review_billing_payment: {
        Args: { p_request_id: string; p_decision: string; p_reason: string | null; p_custom_slug: string | null; p_receipt_verified: boolean }
        Returns: PaymentRequest
      }
      admin_change_subscription_status: {
        Args: { p_shop_id: string; p_status: string; p_reason: string }
        Returns: undefined
      }
      admin_assign_shop_url: {
        Args: { p_shop_id: string; p_slug: string }
        Returns: undefined
      }
      submit_payment_request: {
        Args: {
          p_shop_id: string
          p_period_id: string
          p_payer_name: string
          p_transfer_reference: string
          p_transferred_on: string
          p_expected_amount: number
          p_expected_currency: string
          p_expected_months: number
          p_requested_slug?: string | null
          p_customer_note?: string | null
        }
        Returns: PaymentRequest
      }
      get_shop_menu_url: {
        Args: { p_shop_id: string }
        Returns: { menu_slug: string | null }
      }
      resolve_menu_shop_url: {
        Args: { p_slug: string }
        Returns: Database['public']['Tables']['shops']['Row'] & { menu_slug: string | null }
      }
      resolve_menu_shop: {
        Args: { p_slug: string }
        Returns: Database['public']['Tables']['shops']['Row'][]
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
