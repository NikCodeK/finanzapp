'use client';

import { formatCurrency, formatPercentInt } from '@/lib/utils';

interface FinancialSummaryCardProps {
  monthlyIncome: number;
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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-500">Monatl. Einnahmen</p>
        <p className="text-xl font-semibold text-emerald-600">
          {formatCurrency(monthlyIncome)}
        </p>
      </div>

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

      <div className="bg-slate-50 rounded-lg p-4 col-span-2">
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
  );
}
