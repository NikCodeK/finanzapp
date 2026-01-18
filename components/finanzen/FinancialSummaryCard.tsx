'use client';

import { formatCurrency, formatPercentInt } from '@/lib/utils';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface QuarterlyBonusOverview {
  totalBonusPerQuarter: number;
  confirmedQuarters: {
    Q1: boolean;
    Q2: boolean;
    Q3: boolean;
    Q4: boolean;
  };
  confirmedCount: number;
  totalConfirmedBonus: number;
  totalPotentialBonus: number;
}

interface FinancialSummaryCardProps {
  monthlyIncome: number;
  monthlyIncomeWithoutBonus: number;
  monthlyBonusIncome: number;
  quarterlyBonusOverview: QuarterlyBonusOverview | null;
  monthlyFixedCosts: number;
  monthlyVariableCosts: number;
  monthlyDebtPayments: number;
  totalDebt: number;
  totalAssets: number;
  netWorth: number;
  availableIncome: number;
  debtToIncomeRatio: number;
  savingsRate: number;
}

export default function FinancialSummaryCard({
  monthlyIncome,
  monthlyIncomeWithoutBonus,
  monthlyBonusIncome,
  quarterlyBonusOverview,
  monthlyFixedCosts,
  monthlyVariableCosts,
  monthlyDebtPayments,
  totalDebt,
  totalAssets,
  netWorth,
  availableIncome,
  debtToIncomeRatio,
  savingsRate,
}: FinancialSummaryCardProps) {
  const quarterLabels = {
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4',
  };

  return (
    <div className="space-y-6">
      {/* Einkommens-Übersicht mit Bonus-Aufschlüsselung */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
        <h3 className="text-sm font-semibold text-emerald-800 mb-4">Monatliches Einkommen</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ohne Bonus */}
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Basis (ohne Bonus)</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">
              {formatCurrency(monthlyIncomeWithoutBonus)}
            </p>
          </div>

          {/* Bonus-Anteil */}
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">+ Bonus-Anteil</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {formatCurrency(monthlyBonusIncome)}
            </p>
            {quarterlyBonusOverview && (
              <p className="text-xs text-slate-400 mt-1">
                {quarterlyBonusOverview.confirmedCount}/4 Quartale bestätigt
              </p>
            )}
          </div>

          {/* Gesamt */}
          <div className="bg-emerald-100 rounded-lg p-4">
            <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Gesamt</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
        </div>

        {/* Quartalsbonus-Retrospektive */}
        {quarterlyBonusOverview && (
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-emerald-800">Quartalsbonus Jahresübersicht</p>
              <p className="text-sm text-emerald-600">
                {formatCurrency(quarterlyBonusOverview.totalConfirmedBonus)} von {formatCurrency(quarterlyBonusOverview.totalPotentialBonus)}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((quarter) => {
                const isConfirmed = quarterlyBonusOverview.confirmedQuarters[quarter];
                return (
                  <div
                    key={quarter}
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      isConfirmed
                        ? 'bg-emerald-100 border-2 border-emerald-400'
                        : 'bg-slate-100 border-2 border-slate-200'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isConfirmed ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {quarterLabels[quarter]}
                    </span>
                    {isConfirmed ? (
                      <CheckCircleIcon className="h-6 w-6 text-emerald-500 mt-1" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-slate-300 mt-1" />
                    )}
                    <span className={`text-xs mt-1 ${isConfirmed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isConfirmed ? formatCurrency(quarterlyBonusOverview.totalBonusPerQuarter) : 'Offen'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rest der Finanzübersicht */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">Monatl. Ausgaben</p>
          <p className="text-xl font-semibold text-red-600">
            {formatCurrency(monthlyFixedCosts + monthlyVariableCosts + monthlyDebtPayments)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Fix: {formatCurrency(monthlyFixedCosts)} | Var: {formatCurrency(monthlyVariableCosts)}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">Verfügbar</p>
          <p className={`text-xl font-semibold ${availableIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(availableIncome)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Sparquote: {formatPercentInt(savingsRate)}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">Nettovermögen</p>
          <p className={`text-xl font-semibold ${netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(netWorth)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Vermögen: {formatCurrency(totalAssets)}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">Schulden gesamt</p>
          <p className="text-xl font-semibold text-slate-800">
            {formatCurrency(totalDebt)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Monatl. Raten: {formatCurrency(monthlyDebtPayments)}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">Schulden/Einkommen</p>
          <p className={`text-xl font-semibold ${debtToIncomeRatio <= 0.35 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatPercentInt(debtToIncomeRatio)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {debtToIncomeRatio <= 0.35 ? 'Im gesunden Bereich' : 'Zu hoch'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 col-span-2 md:col-span-3">
          <p className="text-sm text-slate-500">Monatliche Aufschlüsselung</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Fixkosten</span>
              <span className="font-medium">{formatCurrency(monthlyFixedCosts)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Variable Kosten</span>
              <span className="font-medium">{formatCurrency(monthlyVariableCosts)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Schuldenraten</span>
              <span className="font-medium">{formatCurrency(monthlyDebtPayments)}</span>
            </div>
            <div className="border-t border-slate-200 pt-1 flex justify-between text-sm font-semibold">
              <span className="text-slate-700">Gesamt</span>
              <span>{formatCurrency(monthlyFixedCosts + monthlyVariableCosts + monthlyDebtPayments)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
