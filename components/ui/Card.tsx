'use client';

import { ReactNode } from 'react';
import { classNames } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-4 sm:p-6 lg:p-8',
  };

  return (
    <div
      className={classNames(
        'bg-white rounded-xl shadow-sm border border-slate-200',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-2 mb-4">
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{title}</h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
