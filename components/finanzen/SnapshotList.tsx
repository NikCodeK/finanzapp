'use client';

import { FinancialSnapshot } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrashIcon, EyeIcon, CameraIcon } from '@heroicons/react/24/outline';

interface SnapshotListProps {
  snapshots: FinancialSnapshot[];
  onView: (snapshot: FinancialSnapshot) => void;
  onDelete: (id: string) => void;
}

export default function SnapshotList({
  snapshots,
  onView,
  onDelete,
}: SnapshotListProps) {
  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (snapshots.length === 0) {
    return (
      <div className="text-center py-8">
        <CameraIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">
          Keine Snapshots vorhanden.
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Erstelle einen Snapshot um deine aktuelle Finanzlage zu speichern.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {snapshots.map((snapshot) => (
        <div
          key={snapshot.id}
          className="p-4 rounded-lg border bg-white border-slate-200 hover:border-indigo-200 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CameraIcon className="h-5 w-5 text-slate-400" />
                <p className="font-medium text-slate-900">
                  {snapshot.name || formatDate(snapshot.snapshotDateISO)}
                </p>
              </div>
              {snapshot.name && (
                <p className="text-sm text-slate-500 mt-0.5 ml-7">
                  {formatDate(snapshot.snapshotDateISO)}
                </p>
              )}
              {snapshot.note && (
                <p className="text-sm text-slate-400 mt-1 ml-7 italic">
                  {snapshot.note}
                </p>
              )}
            </div>
            <div className="flex gap-1 ml-4">
              <button
                onClick={() => onView(snapshot)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="Details anzeigen"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(snapshot.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Löschen"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 ml-7">
            <div>
              <p className="text-xs text-slate-400">Monatl. Einkommen</p>
              <p className="text-sm font-semibold text-emerald-600">
                {formatCurrency(snapshot.monthlyIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Monatl. Ausgaben</p>
              <p className="text-sm font-semibold text-red-600">
                {formatCurrency(snapshot.monthlyFixedCosts + snapshot.monthlyVariableCosts)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Nettovermögen</p>
              <p className={`text-sm font-semibold ${snapshot.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(snapshot.netWorth)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Health Score</p>
              <p className={`text-sm font-semibold ${
                snapshot.healthScore >= 70 ? 'text-emerald-600' :
                snapshot.healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {snapshot.healthScore}/100
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
