import { z } from 'zod';

export const pageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['draft', 'published']),
  meta: z.record(z.any()).default({}),
  blocks: z.array(z.any()).default([]),
  publishedAt: z.string().datetime().nullish()
});

export const pageCreateSchema = pageSchema.pick({ slug: true, title: true, status: true }).extend({
  meta: z.record(z.any()).optional(),
  blocks: z.array(z.any()).optional()
});

export const pageUpdateSchema = pageSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().uuid().nullable().optional()
});

export const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  attributes: z.record(z.any()).default({}),
  defaultImageUrl: z.string().url().optional().nullable(),
  categories: z.array(z.string().uuid()).default([]),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1),
        name: z.string().min(1),
        priceCents: z.number().int().nonnegative(),
        currency: z.string().length(3).default('NOK'),
        stockQty: z.number().int().nonnegative().default(0)
      })
    )
    .min(1)
});

export const cartAddItemSchema = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().positive()
});

export const orderCheckoutSchema = z.object({
  cartId: z.string().uuid()
});
