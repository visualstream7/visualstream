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
      DeliverableProducts: {
        Row: {
          id: number
          image_id: number
          mock_image_url: string | null
          product_id: number
          variant_id: number
        }
        Insert: {
          id?: number
          image_id: number
          mock_image_url?: string | null
          product_id?: number
          variant_id: number
        }
        Update: {
          id?: number
          image_id?: number
          mock_image_url?: string | null
          product_id?: number
          variant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "DeliverableProducts_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "Images"
            referencedColumns: ["id"]
          },
        ]
      }
      FavouriteImages: {
        Row: {
          favourited_at: string | null
          image_id: number
          user_id: string
        }
        Insert: {
          favourited_at?: string | null
          image_id?: number
          user_id: string
        }
        Update: {
          favourited_at?: string | null
          image_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "FavouriteImages_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "Images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FavouriteImages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Images: {
        Row: {
          ai_describe: string | null
          article_link: string | null
          caption: string | null
          category: string | null
          color_composition: Json | null
          created_at: string
          id: number
          image_url: string | null
          is_mock_generated: boolean | null
          low_resolution_image_url: string | null
          title: string | null
        }
        Insert: {
          ai_describe?: string | null
          article_link?: string | null
          caption?: string | null
          category?: string | null
          color_composition?: Json | null
          created_at?: string
          id?: number
          image_url?: string | null
          is_mock_generated?: boolean | null
          low_resolution_image_url?: string | null
          title?: string | null
        }
        Update: {
          ai_describe?: string | null
          article_link?: string | null
          caption?: string | null
          category?: string | null
          color_composition?: Json | null
          created_at?: string
          id?: number
          image_url?: string | null
          is_mock_generated?: boolean | null
          low_resolution_image_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      Orders: {
        Row: {
          order_id: number
        }
        Insert: {
          order_id?: number
        }
        Update: {
          order_id?: number
        }
        Relationships: []
      }
      Products: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          image: string | null
          title: string | null
          type_name: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: number
          image?: string | null
          title?: string | null
          type_name?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          image?: string | null
          title?: string | null
          type_name?: string | null
        }
        Relationships: []
      }
      Users: {
        Row: {
          city: string | null
          country_code: string | null
          created_at: string
          delivery_address: string | null
          email: string
          id: string
          state_code: string | null
          stripe_customer_id: string | null
          zip: number | null
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          created_at?: string
          delivery_address?: string | null
          email: string
          id: string
          state_code?: string | null
          stripe_customer_id?: string | null
          zip?: number | null
        }
        Update: {
          city?: string | null
          country_code?: string | null
          created_at?: string
          delivery_address?: string | null
          email?: string
          id?: string
          state_code?: string | null
          stripe_customer_id?: string | null
          zip?: number | null
        }
        Relationships: []
      }
      Variants: {
        Row: {
          availability: Json | null
          color_code: string | null
          id: number
          image: string | null
          in_stock: boolean | null
          price: string | null
          product_id: number
          size: string | null
        }
        Insert: {
          availability?: Json | null
          color_code?: string | null
          id: number
          image?: string | null
          in_stock?: boolean | null
          price?: string | null
          product_id?: number
          size?: string | null
        }
        Update: {
          availability?: Json | null
          color_code?: string | null
          id?: number
          image?: string | null
          in_stock?: boolean | null
          price?: string | null
          product_id?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Products"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
