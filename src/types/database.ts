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
          phone_number: string | null
          role: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER' | 'OBSERVER'
          status: 'PENDING_EMAIL_CONFIRMATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
          first_name: string
          last_name: string
          organization_id: string | null
          profile_picture_url: string | null
          profile_completion_percentage: number | null
          reliability_score: number | null
          last_login: string | null
          preferences: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone_number?: string | null
          role?: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER' | 'OBSERVER'
          status?: 'PENDING_EMAIL_CONFIRMATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
          first_name: string
          last_name: string
          organization_id?: string | null
          profile_picture_url?: string | null
          profile_completion_percentage?: number | null
          reliability_score?: number | null
          last_login?: string | null
          preferences?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone_number?: string | null
          role?: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER' | 'OBSERVER'
          status?: 'PENDING_EMAIL_CONFIRMATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
          first_name?: string
          last_name?: string
          organization_id?: string | null
          profile_picture_url?: string | null
          profile_completion_percentage?: number | null
          reliability_score?: number | null
          last_login?: string | null
          preferences?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string | null
          owner_id: string
          name: string
          description: string | null
          status: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
          start_date: string | null
          end_date: string | null
          budget: number | null
          currency: string | null
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null
          tags: string[] | null
          settings: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          owner_id: string
          name: string
          description?: string | null
          status?: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          currency?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null
          tags?: string[] | null
          settings?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          owner_id?: string
          name?: string
          description?: string | null
          status?: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          currency?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null
          tags?: string[] | null
          settings?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          assigned_to_id: string | null
          created_by_id: string
          title: string
          description: string | null
          status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          due_date: string | null
          completed_at: string | null
          estimated_hours: number | null
          actual_hours: number | null
          progress_percentage: number | null
          tags: string[] | null
          dependencies: string[] | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          assigned_to_id?: string | null
          created_by_id: string
          title: string
          description?: string | null
          status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          progress_percentage?: number | null
          tags?: string[] | null
          dependencies?: string[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          assigned_to_id?: string | null
          created_by_id?: string
          title?: string
          description?: string | null
          status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          progress_percentage?: number | null
          tags?: string[] | null
          dependencies?: string[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          entity_type: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment'
          entity_id: string
          content: string
          parent_comment_id: string | null
          is_edited: boolean | null
          edited_at: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entity_type: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment'
          entity_id: string
          content: string
          parent_comment_id?: string | null
          is_edited?: boolean | null
          edited_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entity_type?: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment'
          entity_id?: string
          content?: string
          parent_comment_id?: string | null
          is_edited?: boolean | null
          edited_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          uploaded_by_id: string
          entity_type: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment'
          entity_id: string
          filename: string
          original_filename: string
          mime_type: string | null
          file_size: number | null
          file_url: string
          storage_path: string | null
          is_public: boolean | null
          download_count: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          uploaded_by_id: string
          entity_type: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment'
          entity_id: string
          filename: string
          original_filename: string
          mime_type?: string | null
          file_size?: number | null
          file_url: string
          storage_path?: string | null
          is_public?: boolean | null
          download_count?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          uploaded_by_id?: string
          entity_type?: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment'
          entity_id?: string
          filename?: string
          original_filename?: string
          mime_type?: string | null
          file_size?: number | null
          file_url?: string
          storage_path?: string | null
          is_public?: boolean | null
          download_count?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string | null
          status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          settings: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id?: string | null
          status?: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          settings?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string | null
          status?: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          settings?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment' | null
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment' | null
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: 'user' | 'organization' | 'project' | 'task' | 'comment' | 'attachment' | null
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
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