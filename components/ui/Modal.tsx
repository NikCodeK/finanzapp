'use client';

import { Fragment, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className={`relative w-full ${sizeClasses[size]} transform rounded-t-xl sm:rounded-xl bg-white shadow-2xl transition-all max-h-[95vh] sm:max-h-[90vh] flex flex-col`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors -mr-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
