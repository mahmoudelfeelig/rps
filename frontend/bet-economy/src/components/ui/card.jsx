
import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-2xl border border-dark-300 bg-dark-100 shadow-md p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('mt-2 text-base text-muted-foreground', className)} {...props}>
      {children}
    </div>
  );
}
