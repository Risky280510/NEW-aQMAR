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
      colors: {
        Row: {
          color_name: string
          created_at: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          color_name: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          color_name?: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      install_inventory: {
        Row: {
          color_id: number
          created_at: string | null
          id: number
          install_stock: number
          location_id: number
          product_id: number
          size_id: number
          updated_at: string | null
          variant_sku: string | null
        }
        Insert: {
          color_id: number
          created_at?: string | null
          id?: number
          install_stock?: number
          location_id: number
          product_id: number
          size_id: number
          updated_at?: string | null
          variant_sku?: string | null
        }
        Update: {
          color_id?: number
          created_at?: string | null
          id?: number
          install_stock?: number
          location_id?: number
          product_id?: number
          size_id?: number
          updated_at?: string | null
          variant_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "install_inventory_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_inventory_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_dus: {
        Row: {
          color_id: number
          created_at: string | null
          id: number
          location_id: number
          product_id: number
          stok_dus: number
          updated_at: string | null
        }
        Insert: {
          color_id: number
          created_at?: string | null
          id?: number
          location_id: number
          product_id: number
          stok_dus?: number
          updated_at?: string | null
        }
        Update: {
          color_id?: number
          created_at?: string | null
          id?: number
          location_id?: number
          product_id?: number
          stok_dus?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_dus_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_dus_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_dus_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          color_id: number | null
          destination_location_id: number | null
          id: number
          jumlah_dus: number | null
          jumlah_pasang: number | null
          location_id: number | null
          notes: string | null
          product_id: number | null
          reference_id: string | null
          size_id: number | null
          source_location_id: number | null
          transaction_date: string
          type: string
          user_id: string | null
        }
        Insert: {
          color_id?: number | null
          destination_location_id?: number | null
          id?: number
          jumlah_dus?: number | null
          jumlah_pasang?: number | null
          location_id?: number | null
          notes?: string | null
          product_id?: number | null
          reference_id?: string | null
          size_id?: number | null
          source_location_id?: number | null
          transaction_date?: string
          type: string
          user_id?: string | null
        }
        Update: {
          color_id?: number | null
          destination_location_id?: number | null
          id?: number
          jumlah_dus?: number | null
          jumlah_pasang?: number | null
          location_id?: number | null
          notes?: string | null
          product_id?: number | null
          reference_id?: string | null
          size_id?: number | null
          source_location_id?: number | null
          transaction_date?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string | null
          id: number
          location_name: string
          location_type: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: number
          location_name: string
          location_type: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: number
          location_name?: string
          location_type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          id: number
          isi_dus: number
          product_name: string
          product_sku: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          isi_dus: number
          product_name: string
          product_sku: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          isi_dus?: number
          product_name?: string
          product_sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sizes: {
        Row: {
          created_at: string | null
          id: number
          size_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          size_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          size_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          is_active: boolean | null
          location_id: number | null
          name: string | null
          role: string
        }
        Insert: {
          id: string
          is_active?: boolean | null
          location_id?: number | null
          name?: string | null
          role: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          location_id?: number | null
          name?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
