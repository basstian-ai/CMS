import type { CartItem } from './dto';

export const calculateTotals = (items: Pick<CartItem, 'rowTotalCents'>[]) => {
  return items.reduce(
    (totals, item) => {
      return {
        subtotalCents: totals.subtotalCents + item.rowTotalCents,
        totalCents: totals.totalCents + item.rowTotalCents
      };
    },
    { subtotalCents: 0, totalCents: 0 }
  );
};
