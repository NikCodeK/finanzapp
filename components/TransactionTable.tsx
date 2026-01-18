'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, classNames } from '@/lib/utils';
import { PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  showActions = true,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Keine Transaktionen vorhanden</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedTransactions = [...transactions].sort(
    (a, b) => b.dateISO.localeCompare(a.dateISO)
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
              Datum
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
              Kategorie
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
              Notiz
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
              Konto
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
              Betrag
            </th>
            {showActions && (
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                Aktionen
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedTransactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-slate-900">
                {formatDate(transaction.dateISO)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900">
                    {transaction.category}
                  </span>
                  {transaction.recurring && (
                    <ArrowPathIcon
                      className="h-4 w-4 text-indigo-500"
                      title="Wiederkehrend"
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                {transaction.note || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {transaction.account}
              </td>
              <td
                className={classNames(
                  'px-4 py-3 text-sm font-medium text-right',
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </td>
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Bearbeiten"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Löschen"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
