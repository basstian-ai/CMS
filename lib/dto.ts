export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

export type Variant = {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  currency: string;
  stockQty: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  attributes: Record<string, unknown>;
  defaultImageUrl?: string | null;
  categories: { id: string; name: string; slug: string }[];
  variants: Variant[];
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  meta: Record<string, unknown>;
  blocks: unknown[];
  publishedAt?: string | null;
};

export type CartItem = {
  id: string;
  variantId: string;
  sku: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  rowTotalCents: number;
};

export type CartResponse = {
  cartId: string;
  currency: string;
  items: CartItem[];
  totals: {
    subtotalCents: number;
    totalCents: number;
  };
};

export type OrderSummary = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  placedAt: string | null;
};
