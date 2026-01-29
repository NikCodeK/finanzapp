'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, classNames } from '@/lib/utils';
import { PencilIcon, TrashIcon, ArrowPathIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { DateGroup } from '@/lib/utils';
import Button from './ui/Button';

type SortField = 'dateISO' | 'amount' | 'category';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  sortField?: SortField;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: SortField) => void;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onToggleSelectAll?: () => void;
  groupedTransactions?: Record<DateGroup, Transaction[]> | null;
  showGrouping?: boolean;
}

const DATE_GROUP_LABELS: Record<DateGroup, string> = {
  'heute': 'Heute',
  'gestern': 'Gestern',
  'diese-woche': 'Diese Woche',
  'dieser-monat': 'Dieser Monat',
  'aelter': 'Älter',
};

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  showActions = true,
  sortField,
  sortDirection,
  onSort,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  groupedTransactions,
  showGrouping,
}: TransactionTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline ml-1" />
    );
  };

  const renderSortableHeader = (field: SortField, label: string, className?: string) => (
    <th
      className={classNames(
        'px-4 py-3 text-sm font-medium text-slate-500 cursor-pointer hover:text-slate-900 select-none',
        className
      )}
      onClick={() => onSort?.(field)}
    >
      {label}
      <SortIcon field={field} />
    </th>
  );

  const renderCheckbox = (transaction: Transaction) => {
    if (!selectedIds || !onToggleSelection) return null;
    return (
      <td className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={selectedIds.has(transaction.id)}
          onChange={() => onToggleSelection(transaction.id)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      </td>
    );
  };

  const renderSelectAllCheckbox = () => {
    if (!selectedIds || !onToggleSelectAll) return null;
    const allSelected = transactions.length > 0 && selectedIds.size === transactions.length;
    return (
      <th className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      </th>
    );
  };

  const renderMobileCheckbox = (transaction: Transaction) => {
    if (!selectedIds || !onToggleSelection) return null;
    return (
      <input
        type="checkbox"
        checked={selectedIds.has(transaction.id)}
        onChange={() => onToggleSelection(transaction.id)}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-3 flex-shrink-0"
      />
    );
  };

  const renderTransactionRow = (transaction: Transaction) => (
    <tr
      key={transaction.id}
      className={classNames(
        'hover:bg-slate-50 transition-colors',
        selectedIds?.has(transaction.id) && 'bg-indigo-50'
      )}
    >
      {renderCheckbox(transaction)}
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
  );

  const renderMobileTransaction = (transaction: Transaction) => (
    <div
      key={transaction.id}
      className={classNames(
        'p-4 hover:bg-slate-50 transition-colors',
        selectedIds?.has(transaction.id) && 'bg-indigo-50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start flex-1 min-w-0">
          {renderMobileCheckbox(transaction)}
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
  );

  const renderGroupHeader = (group: DateGroup) => (
    <tr key={`group-${group}`} className="bg-slate-100">
      <td
        colSpan={selectedIds ? 7 : 6}
        className="px-4 py-2 text-sm font-semibold text-slate-700"
      >
        {DATE_GROUP_LABELS[group]}
      </td>
    </tr>
  );

  const renderMobileGroupHeader = (group: DateGroup) => (
    <div key={`group-${group}`} className="bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
      {DATE_GROUP_LABELS[group]}
    </div>
  );
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Keine Transaktionen vorhanden</p>
      </div>
    );
  }

  // Grouped rendering
  if (showGrouping && groupedTransactions) {
    const groups: DateGroup[] = ['heute', 'gestern', 'diese-woche', 'dieser-monat', 'aelter'];

    return (
      <>
        {/* Mobile Grouped View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {groups.map((group) => {
            const groupTransactions = groupedTransactions[group];
            if (groupTransactions.length === 0) return null;
            return (
              <div key={group}>
                {renderMobileGroupHeader(group)}
                <div className="divide-y divide-slate-100">
                  {groupTransactions.map(renderMobileTransaction)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Grouped Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {renderSelectAllCheckbox()}
                {renderSortableHeader('dateISO', 'Datum', 'text-left')}
                {renderSortableHeader('category', 'Kategorie', 'text-left')}
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                  Notiz
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                  Konto
                </th>
                {renderSortableHeader('amount', 'Betrag', 'text-right')}
                {showActions && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                    Aktionen
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((group) => {
                const groupTransactions = groupedTransactions[group];
                if (groupTransactions.length === 0) return null;
                return [
                  renderGroupHeader(group),
                  ...groupTransactions.map(renderTransactionRow),
                ];
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile List View */}
      <div className="sm:hidden divide-y divide-slate-100">
        {transactions.map(renderMobileTransaction)}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              {renderSelectAllCheckbox()}
              {renderSortableHeader('dateISO', 'Datum', 'text-left')}
              {renderSortableHeader('category', 'Kategorie', 'text-left')}
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                Notiz
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                Konto
              </th>
              {renderSortableHeader('amount', 'Betrag', 'text-right')}
              {showActions && (
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Aktionen
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(renderTransactionRow)}
          </tbody>
        </table>
      </div>
    </>
  );
}
