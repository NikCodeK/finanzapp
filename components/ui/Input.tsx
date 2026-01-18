'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { classNames } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={classNames(
            'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            error
              ? 'border-red-300 text-red-900 placeholder-red-300'
              : 'border-slate-300 text-slate-900 placeholder-slate-400',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
