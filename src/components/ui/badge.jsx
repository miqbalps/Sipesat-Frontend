import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-600 text-white',
        secondary: 'border-transparent bg-slate-100 text-slate-900',
        outline: 'text-slate-900',
        pending: 'border-transparent bg-red-50 text-red-700',
        scheduled: 'border-transparent bg-amber-50 text-amber-800',
        done: 'border-transparent bg-emerald-50 text-emerald-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
