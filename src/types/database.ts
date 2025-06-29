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
      users: {
        Row: {
          id: string
          email: string
          phone_number: string
          role: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER' | 'OBSERVER'
          status: 'PENDING_EMAIL_CONFIRMATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
          first_name: string
          last_name: string
          organization_name: string | null
          date_registered: string
          last_login: string | null
          email_verified: boolean
          profile_completion_percentage: number
          reliability_score: number
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone_number: string
          role: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER' | 'OBSERVER'
          status?: 'PENDING_EMAIL_CONFIRMATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
          first_name: string
          last_name: string
          organization_name?: string | null
          date_registered?: string
          last_login?: string | null
          email_verified?: boolean
          profile_completion_percentage?: number
          reliability_score?: number
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone_number?: string
          role?: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER' | 'OBSERVER'
          status?: 'PENDING_EMAIL_CONFIRMATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
          first_name?: string
          last_name?: string
          organization_name?: string | null
          date_registered?: string
          last_login?: string | null
          email_verified?: boolean
          profile_completion_percentage?: number
          reliability_score?: number
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          entrepreneur_id: string
          title: string
          description: string
          category: 'GOING_CONCERN' | 'ORDER_FULFILLMENT' | 'PROJECT_PARTNERSHIP'
          industry: string
          location: string
          funding_goal: number
          equity_offered_percentage: number
          roi_projected_percentage: number | null
          funding_stage: 'SEED' | 'STARTUP' | 'GROWTH'
          status: 'DRAFT' | 'PENDING_ADMIN_REVIEW' | 'ADMIN_REJECTED' | 'FUNDING_LIVE' | 'FUNDING_CLOSED' | 'ACTIVE_INVESTMENT' | 'COMPLETED' | 'FAILED' | 'DISPUTED'
          min_investment_amount: number
          current_funds_raised: number
          start_date: string | null
          end_date: string | null
          due_diligence_summary: string | null
          risk_assessment_score: number | null
          risk_assessment_details: string | null
          admin_rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entrepreneur_id: string
          title: string
          description: string
          category: 'GOING_CONCERN' | 'ORDER_FULFILLMENT' | 'PROJECT_PARTNERSHIP'
          industry: string
          location: string
          funding_goal: number
          equity_offered_percentage: number
          roi_projected_percentage?: number | null
          funding_stage: 'SEED' | 'STARTUP' | 'GROWTH'
          status?: 'DRAFT' | 'PENDING_ADMIN_REVIEW' | 'ADMIN_REJECTED' | 'FUNDING_LIVE' | 'FUNDING_CLOSED' | 'ACTIVE_INVESTMENT' | 'COMPLETED' | 'FAILED' | 'DISPUTED'
          min_investment_amount: number
          current_funds_raised?: number
          start_date?: string | null
          end_date?: string | null
          due_diligence_summary?: string | null
          risk_assessment_score?: number | null
          risk_assessment_details?: string | null
          admin_rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entrepreneur_id?: string
          title?: string
          description?: string
          category?: 'GOING_CONCERN' | 'ORDER_FULFILLMENT' | 'PROJECT_PARTNERSHIP'
          industry?: string
          location?: string
          funding_goal?: number
          equity_offered_percentage?: number
          roi_projected_percentage?: number | null
          funding_stage?: 'SEED' | 'STARTUP' | 'GROWTH'
          status?: 'DRAFT' | 'PENDING_ADMIN_REVIEW' | 'ADMIN_REJECTED' | 'FUNDING_LIVE' | 'FUNDING_CLOSED' | 'ACTIVE_INVESTMENT' | 'COMPLETED' | 'FAILED' | 'DISPUTED'
          min_investment_amount?: number
          current_funds_raised?: number
          start_date?: string | null
          end_date?: string | null
          due_diligence_summary?: string | null
          risk_assessment_score?: number | null
          risk_assessment_details?: string | null
          admin_rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          offer_id: string
          investor_id: string
          opportunity_id: string
          invested_amount: number
          equity_percentage: number
          transaction_reference: string
          proof_of_payment_url: string | null
          payment_method: string
          status: 'PENDING_INVESTOR_PAYMENT' | 'PENDING_ADMIN_CONFIRMATION' | 'FUNDS_IN_ESCROW' | 'FUNDS_RELEASED_TO_ENTREPRENEUR' | 'COMPLETED' | 'REJECTED_BY_ADMIN'
          admin_confirmation_at: string | null
          funds_released_at: string | null
          admin_rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          offer_id: string
          investor_id: string
          opportunity_id: string
          invested_amount: number
          equity_percentage: number
          transaction_reference: string
          proof_of_payment_url?: string | null
          payment_method: string
          status?: 'PENDING_INVESTOR_PAYMENT' | 'PENDING_ADMIN_CONFIRMATION' | 'FUNDS_IN_ESCROW' | 'FUNDS_RELEASED_TO_ENTREPRENEUR' | 'COMPLETED' | 'REJECTED_BY_ADMIN'
          admin_confirmation_at?: string | null
          funds_released_at?: string | null
          admin_rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          offer_id?: string
          investor_id?: string
          opportunity_id?: string
          invested_amount?: number
          equity_percentage?: number
          transaction_reference?: string
          proof_of_payment_url?: string | null
          payment_method?: string
          status?: 'PENDING_INVESTOR_PAYMENT' | 'PENDING_ADMIN_CONFIRMATION' | 'FUNDS_IN_ESCROW' | 'FUNDS_RELEASED_TO_ENTREPRENEUR' | 'COMPLETED' | 'REJECTED_BY_ADMIN'
          admin_confirmation_at?: string | null
          funds_released_at?: string | null
          admin_rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          related_entity_type: string | null
          related_entity_id: string | null
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
          updated_at?: string
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