'use client';

import { WeeklyReport } from '@/lib/types';
import { formatCurrency, formatDateShort, classNames } from '@/lib/utils';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WeeklyReportCardProps {
  report: WeeklyReport;
  onEdit?: (report: WeeklyReport) => void;
  onDelete?: (id: string) => void;
}

const moodEmojis = ['😞', '😕', '😐', '🙂', '😊'] as const;

export default function WeeklyReportCard({
  report,
  onEdit,
  onDelete,
}: WeeklyReportCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            {formatDateShort(report.weekStartISO)} -{' '}
            {formatDateShort(report.weekEndISO)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{moodEmojis[report.mood - 1]}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(report)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Bearbeiten"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(report.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Löschen"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium">Einnahmen</p>
          <p className="text-lg font-semibold text-green-700">
            {formatCurrency(report.income)}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-600 font-medium">Ausgaben</p>
          <p className="text-lg font-semibold text-red-700">
            {formatCurrency(report.expenses)}
          </p>
        </div>
        <div
          className={classNames(
            'rounded-lg p-3',
            report.net >= 0 ? 'bg-indigo-50' : 'bg-orange-50'
          )}
        >
          <p
            className={classNames(
              'text-xs font-medium',
              report.net >= 0 ? 'text-indigo-600' : 'text-orange-600'
            )}
          >
            Netto
          </p>
          <p
            className={classNames(
              'text-lg font-semibold',
              report.net >= 0 ? 'text-indigo-700' : 'text-orange-700'
            )}
          >
            {formatCurrency(report.net)}
          </p>
        </div>
      </div>

      {/* Top 3 Categories */}
      {report.top3 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium mb-1">
            Top 3 Ausgaben
          </p>
          <p className="text-sm text-slate-700">{report.top3}</p>
        </div>
      )}

      {/* Insights */}
      {report.insights && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium mb-1">
            Erkenntnisse
          </p>
          <p className="text-sm text-slate-700">{report.insights}</p>
        </div>
      )}

      {/* Next Decision */}
      {report.nextDecision && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">
            Nächste Schritte
          </p>
          <p className="text-sm text-slate-700">{report.nextDecision}</p>
        </div>
      )}
    </div>
  );
}
