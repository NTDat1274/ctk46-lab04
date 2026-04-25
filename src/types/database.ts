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
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: any[]
      }
      posts: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: any[]
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
        }
        Relationships: any[]
      }
      likes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: any[]
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