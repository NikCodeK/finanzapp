'use client';

import { YearlyIncomeRecord } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface YearlyIncomeListProps {
  records: YearlyIncomeRecord[];
  onEdit: (record: YearlyIncomeRecord) => void;
  onDelete: (id: string) => void;
}

export default function YearlyIncomeList({
  records,
  onEdit,
  onDelete,
}: YearlyIncomeListProps) {
  const calculateTotal = (record: YearlyIncomeRecord) => {
    return (
      record.baseSalary +
      record.bonusQ1 +
      record.bonusQ2 +
      record.bonusQ3 +
      record.bonusQ4 +
      record.gifts +
      record.otherIncome
    );
  };

  const calculateTotalBonus = (record: YearlyIncomeRecord) => {
    return record.bonusQ1 + record.bonusQ2 + record.bonusQ3 + record.bonusQ4;
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">
          Keine Jahresübersichten vorhanden.
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Dokumentiere dein Jahreseinkommen für vergangene Jahre.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const total = calculateTotal(record);
        const totalBonus = calculateTotalBonus(record);

        return (
          <div
            key={record.id}
            className="p-4 rounded-lg border bg-white border-slate-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">
                    {record.year.toString().slice(-2)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">{record.year}</p>
                  <p className="text-sm text-slate-500">
                    Gesamt: <span className="font-medium text-emerald-600">{formatCurrency(total)}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(record)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Bearbeiten"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Löschen"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {record.note && (
              <p className="text-sm text-slate-400 mt-2 italic ml-17">{record.note}</p>
            )}

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-600">Grundgehalt</p>
                <p className="font-semibold text-emerald-700">{formatCurrency(record.baseSalary)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Boni gesamt</p>
                <p className="font-semibold text-blue-700">{formatCurrency(totalBonus)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600">Geschenke</p>
                <p className="font-semibold text-purple-700">{formatCurrency(record.gifts)}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-600">Sonstiges</p>
                <p className="font-semibold text-orange-700">{formatCurrency(record.otherIncome)}</p>
              </div>
            </div>

            {totalBonus > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Quartals-Boni Aufschlüsselung:</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className={`p-2 rounded-lg text-center ${record.bonusQ1 > 0 ? 'bg-blue-100' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500">Q1</p>
                    <p className={`text-sm font-medium ${record.bonusQ1 > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                      {formatCurrency(record.bonusQ1)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${record.bonusQ2 > 0 ? 'bg-blue-100' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500">Q2</p>
                    <p className={`text-sm font-medium ${record.bonusQ2 > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                      {formatCurrency(record.bonusQ2)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${record.bonusQ3 > 0 ? 'bg-blue-100' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500">Q3</p>
                    <p className={`text-sm font-medium ${record.bonusQ3 > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                      {formatCurrency(record.bonusQ3)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${record.bonusQ4 > 0 ? 'bg-blue-100' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500">Q4</p>
                    <p className={`text-sm font-medium ${record.bonusQ4 > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                      {formatCurrency(record.bonusQ4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
