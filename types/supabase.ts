export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          company_name: string
          logo: string | null
          description: string | null
          // Add other fields as necessary
        }
        Insert: {
          id?: string
          company_name: string
          logo?: string | null
          description?: string | null
          // Add other fields as necessary
        }
        Update: {
          id?: string
          company_name?: string
          logo?: string | null
          description?: string | null
          // Add other fields as necessary
        }
      }
      // Add other tables as necessary
    }
    Views: {
      // Add views if you have any
    }
    Functions: {
      // Add functions if you have any
    }
    Enums: {
      // Add enums if you have any
    }
  }
}