import type { HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Table = ({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) => (
  <table className={cn('w-full border-collapse text-sm', className)} {...props} />
);

export const THead = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-slate-100 text-left font-medium', className)} {...props} />
);

export const TBody = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-slate-200', className)} {...props} />
);

export const TR = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('hover:bg-slate-50', className)} {...props} />
);

export const TH = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('px-3 py-2 text-xs uppercase tracking-wide text-slate-600', className)} {...props} />
);

export const TD = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-3 py-2 align-top text-slate-700', className)} {...props} />
);
