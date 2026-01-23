'use client';

import { Subscription } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { differenceInDays, addDays } from 'date-fns';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

function getMonthlyAmount(subscription: Subscription): number {
  switch (subscription.frequency) {
    case 'vierteljaehrlich':
      return subscription.amount / 3;
    case 'halbjaehrlich':
      return subscription.amount / 6;
    case 'jaehrlich':
      return subscription.amount / 12;
    default:
      return subscription.amount;
  }
}

function getFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'monatlich':
      return 'Monatlich';
    case 'vierteljaehrlich':
      return 'Vierteljährlich';
    case 'halbjaehrlich':
      return 'Halbjährlich';
    case 'jaehrlich':
      return 'Jährlich';
    default:
      return frequency;
  }
}

export default function SubscriptionList({
  subscriptions,
  onEdit,
  onDelete,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Keine Abos vorhanden. Füge dein erstes Abo hinzu!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => {
        const monthlyAmount = getMonthlyAmount(sub);
        const today = new Date();

        // Calculate cancellation deadline
        let cancellationInfo = null;
        if (sub.nextBillingDateISO && sub.isActive) {
          const nextBilling = new Date(sub.nextBillingDateISO);
          const cancellationDeadline = addDays(nextBilling, -sub.cancellationPeriodDays);
          const daysUntilDeadline = differenceInDays(cancellationDeadline, today);

          if (daysUntilDeadline >= 0 && daysUntilDeadline <= 30) {
            cancellationInfo = {
              deadline: cancellationDeadline,
              daysLeft: daysUntilDeadline,
              isUrgent: daysUntilDeadline <= 7,
            };
          }
        }

        return (
          <div
            key={sub.id}
            className={`p-4 rounded-lg border ${
              sub.isActive
                ? 'bg-white border-slate-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-900">{sub.name}</h3>
                  {sub.isActive ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                {sub.provider && (
                  <p className="text-sm text-slate-500">{sub.provider}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">{sub.category}</span>
                  <span>{getFrequencyLabel(sub.frequency)}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(sub.amount)}
                </p>
                {sub.frequency !== 'monatlich' && (
                  <p className="text-xs text-slate-500">
                    ({formatCurrency(monthlyAmount)}/Monat)
                  </p>
                )}
              </div>
            </div>

            {/* Cancellation Info - nur dezent anzeigen */}
            {cancellationInfo && sub.cancellationPeriodDays > 7 && (
              <p className="mt-2 text-xs text-slate-400">
                Kündigungsfrist: {formatDate(cancellationInfo.deadline.toISOString())}
              </p>
            )}

            {/* Next billing date */}
            {sub.nextBillingDateISO && sub.isActive && (
              <p className="mt-2 text-xs text-slate-500">
                Nächste Abrechnung: {formatDate(sub.nextBillingDateISO)}
              </p>
            )}

            {/* Note */}
            {sub.note && (
              <p className="mt-2 text-sm text-slate-500 italic">{sub.note}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(sub)}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Bearbeiten
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Möchtest du "${sub.name}" wirklich löschen?`)) {
                    onDelete(sub.id);
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Löschen
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
