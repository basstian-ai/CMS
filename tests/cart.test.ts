import { describe, expect, it } from 'vitest';
import { calculateTotals } from '@/lib/cart';

describe('cart totals', () => {
  it('sums row totals into subtotal and total', () => {
    const totals = calculateTotals([
      { rowTotalCents: 1000 },
      { rowTotalCents: 2500 }
    ]);
    expect(totals).toEqual({ subtotalCents: 3500, totalCents: 3500 });
  });
});
