import { describe, expect, it } from 'vitest';
import { pageCreateSchema, cartAddItemSchema } from '@/lib/validation';

describe('validation schemas', () => {
  it('validates page creation payload', () => {
    const parsed = pageCreateSchema.parse({
      slug: 'home',
      title: 'Home',
      status: 'draft',
      blocks: [],
      meta: {}
    });
    expect(parsed.slug).toBe('home');
  });

  it('rejects invalid cart quantity', () => {
    expect(() => cartAddItemSchema.parse({ variantId: 'not-a-uuid', qty: 0 })).toThrow();
  });
});
