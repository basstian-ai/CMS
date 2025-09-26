export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      cms_pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          status: 'draft' | 'published';
          meta: Json;
          blocks: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          status: 'draft' | 'published';
          meta?: Json;
          blocks?: Json;
          published_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['cms_pages']['Insert']>;
      };
      cms_assets: {
        Row: {
          id: string;
          url: string;
          alt: string | null;
          width: number | null;
          height: number | null;
          type: string | null;
          created_at: string;
        };
      };
      pim_categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          path: string | null;
          created_at: string;
        };
      };
      pim_products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          brand: string | null;
          attributes: Json;
          default_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      pim_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          name: string;
          price_cents: number;
          currency: string;
          created_at: string;
        };
      };
      stock_levels: {
        Row: {
          variant_id: string;
          quantity: number;
          updated_at: string;
        };
      };
      pim_product_categories: {
        Row: {
          product_id: string;
          category_id: string;
        };
      };
      customers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          company: string | null;
          segment: string | null;
        };
      };
      carts: {
        Row: {
          id: string;
          session_id: string;
          customer_id: string | null;
          currency: string;
          subtotal_cents: number;
          total_cents: number;
          created_at: string;
          updated_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          qty: number;
          unit_price_cents: number;
          row_total_cents: number;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          status: string;
          currency: string;
          subtotal_cents: number;
          total_cents: number;
          placed_at: string | null;
          created_at: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          sku: string;
          name: string;
          qty: number;
          unit_price_cents: number;
          row_total_cents: number;
        };
      };
      roles: {
        Row: {
          user_id: string;
          role: 'admin' | 'editor';
        };
      };
    };
  };
}
