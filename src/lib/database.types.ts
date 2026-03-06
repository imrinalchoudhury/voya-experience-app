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
      journeys: {
        Row: {
          id: string
          title: string
          destination: string
          category: string
          tagline: string
          depart_date: string
          return_date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          destination: string
          category: string
          tagline: string
          depart_date: string
          return_date: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          destination?: string
          category?: string
          tagline?: string
          depart_date?: string
          return_date?: string
          created_at?: string
        }
      }
      days: {
        Row: {
          id: string
          journey_id: string
          day_number: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          journey_id: string
          day_number: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          journey_id?: string
          day_number?: number
          date?: string
          created_at?: string
        }
      }
      experiences: {
        Row: {
          id: string
          day_id: string
          time: string
          title: string
          category: string
          concierge_details: string
          created_at: string
        }
        Insert: {
          id?: string
          day_id: string
          time: string
          title: string
          category: string
          concierge_details?: string
          created_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          time?: string
          title?: string
          category?: string
          concierge_details?: string
          created_at?: string
        }
      }
    }
  }
}
