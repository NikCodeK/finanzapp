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
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full ${sizeClasses[size]} transform rounded-xl bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
