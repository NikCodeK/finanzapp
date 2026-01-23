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

  return (
    <>
      {/* Mobile List View */}
      <div className="sm:hidden divide-y divide-slate-100">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {transaction.category}
                  </span>
                  {transaction.recurring && (
                    <ArrowPathIcon
                      className="h-4 w-4 text-indigo-500 flex-shrink-0"
                      title="Wiederkehrend"
                    />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDate(transaction.dateISO)} • {transaction.account}
                </p>
                {transaction.note && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {transaction.note}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={classNames(
                    'text-sm font-semibold',
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
                {showActions && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Bearbeiten"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Löschen"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
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
            {transactions.map((transaction) => (
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
    </>
  );
}
