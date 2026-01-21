'use client';

import { FinancialSnapshot } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SnapshotDetailViewProps {
  snapshot: FinancialSnapshot;
  onClose: () => void;
}

export default function SnapshotDetailView({
  snapshot,
  onClose,
}: SnapshotDetailViewProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {snapshot.name || 'Snapshot'}
          </h3>
          <p className="text-sm text-slate-500">
            Erstellt am {formatDate(snapshot.snapshotDateISO)}
          </p>
          {snapshot.note && (
            <p className="text-sm text-slate-400 mt-1 italic">{snapshot.note}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Health Score */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
          snapshot.healthScore >= 70 ? 'bg-emerald-500' :
          snapshot.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          {snapshot.healthScore}
        </div>
        <div>
          <p className="font-medium text-slate-900">Financial Health Score</p>
          <p className="text-sm text-slate-500">
            {snapshot.healthScore >= 70 ? 'Sehr gut' :
             snapshot.healthScore >= 40 ? 'Verbesserungspotenzial' : 'Kritisch'}
          </p>
        </div>
      </div>

      {/* Übersicht */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-600">Monatl. Einkommen</p>
          <p className="text-xl font-bold text-emerald-700">
            {formatCurrency(snapshot.monthlyIncome)}
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">Monatl. Ausgaben</p>
          <p className="text-xl font-bold text-red-700">
            {formatCurrency(snapshot.monthlyFixedCosts + snapshot.monthlyVariableCosts)}
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Vermögen</p>
          <p className="text-xl font-bold text-blue-700">
            {formatCurrency(snapshot.totalAssets)}
          </p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-600">Schulden</p>
          <p className="text-xl font-bold text-orange-700">
            {formatCurrency(snapshot.totalDebt)}
          </p>
        </div>
      </div>

      {/* Nettovermögen */}
      <div className={`p-4 rounded-lg border ${
        snapshot.netWorth >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${snapshot.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Nettovermögen
            </p>
            <p className="text-xs text-slate-400">Vermögen - Schulden</p>
          </div>
          <p className={`text-2xl font-bold ${snapshot.netWorth >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(snapshot.netWorth)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Details zum Zeitpunkt</h4>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500">Fixkosten</span>
            <span className="font-medium">{formatCurrency(snapshot.monthlyFixedCosts)}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500">Variable Kosten</span>
            <span className="font-medium">{formatCurrency(snapshot.monthlyVariableCosts)}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500">Einnahmequellen</span>
            <span className="font-medium">{snapshot.incomeSources.length}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500">Schuldenposten</span>
            <span className="font-medium">{snapshot.debts.length}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500">Kreditkarten</span>
            <span className="font-medium">{snapshot.creditCards.length}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500">Fixkosten-Posten</span>
            <span className="font-medium">{snapshot.fixedCosts.length}</span>
          </div>
        </div>
      </div>

      {/* Vermögen Aufschlüsselung */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900">Vermögens-Aufschlüsselung</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm p-3 bg-emerald-50 rounded-lg">
            <span className="text-emerald-600">Ersparnisse</span>
            <span className="font-medium text-emerald-700">{formatCurrency(snapshot.assets.savings)}</span>
          </div>
          <div className="flex justify-between text-sm p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-600">Investments</span>
            <span className="font-medium text-blue-700">{formatCurrency(snapshot.assets.investments)}</span>
          </div>
          <div className="flex justify-between text-sm p-3 bg-purple-50 rounded-lg">
            <span className="text-purple-600">Sonstiges</span>
            <span className="font-medium text-purple-700">{formatCurrency(snapshot.assets.other)}</span>
          </div>
        </div>
      </div>

      <Button onClick={onClose} variant="secondary" className="w-full">
        Schließen
      </Button>
    </div>
  );
}
