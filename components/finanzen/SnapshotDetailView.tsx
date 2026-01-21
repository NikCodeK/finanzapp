'use client';

import { useState } from 'react';
import { FinancialSnapshot } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  WalletIcon,
  ReceiptPercentIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface SnapshotDetailViewProps {
  snapshot: FinancialSnapshot;
  onClose: () => void;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  total?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  colorClass?: string;
}

function CollapsibleSection({
  title,
  icon,
  count,
  total,
  children,
  defaultOpen = false,
  colorClass = 'bg-slate-50 border-slate-200'
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-lg border ${colorClass}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="font-medium text-slate-900">{title}</p>
            <p className="text-sm text-slate-500">
              {count} Einträge
              {total !== undefined && ` - ${formatCurrency(total)}`}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronDownIcon className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
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

  const formatShortDate = (dateISO: string) => {
    const date = new Date(dateISO);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const totalCreditCardDebt = snapshot.creditCards.reduce(
    (sum, card) => sum + (card.currentBalance || 0),
    0
  );

  const availableIncome = snapshot.monthlyIncome - snapshot.monthlyFixedCosts - snapshot.monthlyVariableCosts;
  const savingsRate = snapshot.monthlyIncome > 0
    ? (availableIncome / snapshot.monthlyIncome) * 100
    : 0;

  // Transaction summary
  const incomeTransactions = snapshot.transactions?.filter(t => t.type === 'income') || [];
  const expenseTransactions = snapshot.transactions?.filter(t => t.type === 'expense') || [];
  const totalTransactionIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactionExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between sticky top-0 bg-white pb-2">
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

      {/* Quartalsbonus-Status */}
      {snapshot.quarterlyBonusOverview && (
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-medium text-emerald-800 mb-3">Quartalsbonus-Status</h4>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((quarter) => {
              const isConfirmed = snapshot.quarterlyBonusOverview?.confirmedQuarters[quarter];
              return (
                <div
                  key={quarter}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    isConfirmed
                      ? 'bg-emerald-100 border-2 border-emerald-400'
                      : 'bg-slate-100 border-2 border-slate-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${isConfirmed ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {quarter}
                  </span>
                  {isConfirmed ? (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500 mt-1" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-slate-300 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-emerald-600">Bestätigt:</span>
              <span className="font-medium text-emerald-700">
                {formatCurrency(snapshot.quarterlyBonusOverview.totalConfirmedBonus)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Potenzial:</span>
              <span className="font-medium text-slate-600">
                {formatCurrency(snapshot.quarterlyBonusOverview.totalPotentialBonus)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Einkommen Aufschlüsselung */}
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <h4 className="font-medium text-emerald-800 mb-3">Monatliches Einkommen</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600">Basis (ohne Bonus)</span>
            <span className="font-medium text-emerald-700">
              {formatCurrency(snapshot.monthlyIncomeWithoutBonus || snapshot.monthlyIncome)}
            </span>
          </div>
          {(snapshot.monthlyBonusIncome || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">+ Bestätigter Bonus-Anteil</span>
              <span className="font-medium text-emerald-700">
                {formatCurrency(snapshot.monthlyBonusIncome || 0)}
              </span>
            </div>
          )}
          <div className="border-t border-emerald-200 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-emerald-700">Gesamt</span>
            <span className="text-emerald-800">{formatCurrency(snapshot.monthlyIncome)}</span>
          </div>
        </div>
      </div>

      {/* Übersicht Kennzahlen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">Monatl. Ausgaben</p>
          <p className="text-xl font-bold text-red-700">
            {formatCurrency(snapshot.monthlyFixedCosts + snapshot.monthlyVariableCosts)}
          </p>
        </div>
        <div className={`p-4 rounded-lg border ${
          savingsRate >= 20 ? 'bg-emerald-50 border-emerald-200' :
          savingsRate >= 10 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${
            savingsRate >= 20 ? 'text-emerald-600' :
            savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Sparquote
          </p>
          <p className={`text-xl font-bold ${
            savingsRate >= 20 ? 'text-emerald-700' :
            savingsRate >= 10 ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {savingsRate.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Vermögen gesamt</p>
          <p className="text-xl font-bold text-blue-700">
            {formatCurrency(snapshot.totalAssets)}
          </p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-600">Schulden gesamt</p>
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
            <p className={`text-sm font-medium ${snapshot.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Nettovermögen
            </p>
            <p className="text-xs text-slate-400">Vermögen - Schulden</p>
          </div>
          <p className={`text-2xl font-bold ${snapshot.netWorth >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(snapshot.netWorth)}
          </p>
        </div>
      </div>

      {/* Vermögens-Aufschlüsselung */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-3">Vermögens-Aufschlüsselung</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">Ersparnisse</span>
            <span className="font-medium text-blue-700">{formatCurrency(snapshot.assets.savings)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">Investments</span>
            <span className="font-medium text-blue-700">{formatCurrency(snapshot.assets.investments)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">Sonstiges</span>
            <span className="font-medium text-blue-700">{formatCurrency(snapshot.assets.other)}</span>
          </div>
        </div>
      </div>

      {/* Ausgaben-Aufschlüsselung */}
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <h4 className="font-medium text-red-800 mb-3">Monatliche Ausgaben-Aufschlüsselung</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-red-600">Fixkosten</span>
            <span className="font-medium text-red-700">{formatCurrency(snapshot.monthlyFixedCosts)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-red-600">Variable Kosten</span>
            <span className="font-medium text-red-700">{formatCurrency(snapshot.monthlyVariableCosts)}</span>
          </div>
          <div className="border-t border-red-200 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-red-700">Gesamt</span>
            <span className="text-red-800">{formatCurrency(snapshot.monthlyFixedCosts + snapshot.monthlyVariableCosts)}</span>
          </div>
        </div>
      </div>

      {/* Detaillierte Aufschlüsselungen */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900 text-lg">Detaillierte Aufschlüsselung</h4>

        {/* Transaktionen */}
        {snapshot.transactions && snapshot.transactions.length > 0 && (
          <CollapsibleSection
            title="Transaktionen"
            icon={<ArrowTrendingUpIcon className="h-6 w-6 text-cyan-500" />}
            count={snapshot.transactions.length}
            colorClass="bg-cyan-50 border-cyan-200"
            defaultOpen={false}
          >
            <div className="space-y-3 mt-3">
              {/* Transaction summary */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-lg border border-cyan-100">
                <div>
                  <p className="text-xs text-emerald-600">Einnahmen</p>
                  <p className="font-semibold text-emerald-700">{formatCurrency(totalTransactionIncome)}</p>
                  <p className="text-xs text-slate-400">{incomeTransactions.length} Transaktionen</p>
                </div>
                <div>
                  <p className="text-xs text-red-600">Ausgaben</p>
                  <p className="font-semibold text-red-700">{formatCurrency(totalTransactionExpense)}</p>
                  <p className="text-xs text-slate-400">{expenseTransactions.length} Transaktionen</p>
                </div>
              </div>

              {/* Recent transactions */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {snapshot.transactions.slice(0, 20).map((transaction, index) => (
                  <div key={index} className="p-2 bg-white rounded-lg border border-cyan-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{transaction.category}</p>
                        <p className="text-xs text-slate-400">{formatShortDate(transaction.dateISO)}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
                {snapshot.transactions.length > 20 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    ... und {snapshot.transactions.length - 20} weitere Transaktionen
                  </p>
                )}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Einnahmequellen */}
        <CollapsibleSection
          title="Einnahmequellen"
          icon={<BanknotesIcon className="h-6 w-6 text-emerald-500" />}
          count={snapshot.incomeSources.length}
          total={snapshot.monthlyIncome}
          colorClass="bg-emerald-50 border-emerald-200"
          defaultOpen={true}
        >
          {snapshot.incomeSources.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Keine Einnahmequellen</p>
          ) : (
            <div className="space-y-2 mt-3">
              {snapshot.incomeSources.map((source, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-emerald-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">{source.name}</p>
                      <p className="text-xs text-slate-500">
                        {source.frequency === 'monatlich' ? 'Monatlich' :
                         source.frequency === 'jaehrlich' ? 'Jährlich' : 'Quartalsbonus'}
                        {!source.isActive && ' (Inaktiv)'}
                      </p>
                      {source.frequency === 'quartalsbonus' && source.confirmedQuarters && (
                        <div className="flex gap-1 mt-1">
                          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                            <span
                              key={q}
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                source.confirmedQuarters?.[q]
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {q}
                            </span>
                          ))}
                        </div>
                      )}
                      {source.note && <p className="text-xs text-slate-400 mt-1">{source.note}</p>}
                    </div>
                    <p className="font-semibold text-emerald-600">{formatCurrency(source.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Fixkosten */}
        <CollapsibleSection
          title="Fixkosten"
          icon={<ReceiptPercentIcon className="h-6 w-6 text-red-500" />}
          count={snapshot.fixedCosts.length}
          total={snapshot.monthlyFixedCosts}
          colorClass="bg-red-50 border-red-200"
        >
          {snapshot.fixedCosts.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Keine Fixkosten</p>
          ) : (
            <div className="space-y-2 mt-3">
              {snapshot.fixedCosts.map((cost, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-red-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">{cost.name}</p>
                      <p className="text-xs text-slate-500">
                        {cost.category} - {cost.frequency === 'monatlich' ? 'Monatlich' :
                         cost.frequency === 'vierteljaehrlich' ? 'Vierteljährlich' : 'Jährlich'}
                        {!cost.isActive && ' (Inaktiv)'}
                      </p>
                      {cost.note && <p className="text-xs text-slate-400 mt-1">{cost.note}</p>}
                    </div>
                    <p className="font-semibold text-red-600">{formatCurrency(cost.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Variable Kosten */}
        <CollapsibleSection
          title="Variable Kosten"
          icon={<WalletIcon className="h-6 w-6 text-orange-500" />}
          count={snapshot.variableCosts.length}
          total={snapshot.monthlyVariableCosts}
          colorClass="bg-orange-50 border-orange-200"
        >
          {snapshot.variableCosts.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Keine variablen Kosten</p>
          ) : (
            <div className="space-y-2 mt-3">
              {snapshot.variableCosts.map((cost, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-orange-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">{cost.category}</p>
                      {cost.note && <p className="text-xs text-slate-400 mt-1">{cost.note}</p>}
                    </div>
                    <p className="font-semibold text-orange-600">~{formatCurrency(cost.estimatedMonthly)}/Mo</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Schulden */}
        <CollapsibleSection
          title="Schulden & Kredite"
          icon={<BuildingLibraryIcon className="h-6 w-6 text-purple-500" />}
          count={snapshot.debts.length}
          total={snapshot.totalDebt}
          colorClass="bg-purple-50 border-purple-200"
        >
          {snapshot.debts.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Keine Schulden</p>
          ) : (
            <div className="space-y-2 mt-3">
              {snapshot.debts.map((debt, index) => {
                const progress = debt.originalAmount > 0
                  ? ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100
                  : 0;
                return (
                  <div key={index} className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{debt.name}</p>
                        <p className="text-xs text-slate-500">
                          {debt.type} - {debt.interestRate}% Zinsen - {formatCurrency(debt.monthlyPayment)}/Mo
                        </p>
                        {debt.note && <p className="text-xs text-slate-400 mt-1">{debt.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">{formatCurrency(debt.currentBalance)}</p>
                        <p className="text-xs text-slate-400">von {formatCurrency(debt.originalAmount)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-purple-600 mt-1">{progress.toFixed(1)}% abbezahlt</p>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>

        {/* Kreditkarten */}
        <CollapsibleSection
          title="Kreditkarten"
          icon={<CreditCardIcon className="h-6 w-6 text-indigo-500" />}
          count={snapshot.creditCards.length}
          total={totalCreditCardDebt}
          colorClass="bg-indigo-50 border-indigo-200"
        >
          {snapshot.creditCards.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">Keine Kreditkarten</p>
          ) : (
            <div className="space-y-2 mt-3">
              {snapshot.creditCards.map((card, index) => {
                const utilization = card.creditLimit > 0
                  ? (card.currentBalance / card.creditLimit) * 100
                  : 0;
                return (
                  <div key={index} className="p-3 bg-white rounded-lg border border-indigo-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{card.name}</p>
                        <p className="text-xs text-slate-500">
                          {card.bank && `${card.bank} - `}
                          Limit: {formatCurrency(card.creditLimit)}
                          {card.interestRate > 0 && ` - ${card.interestRate}% Zinsen`}
                          {!card.isActive && ' (Inaktiv)'}
                        </p>
                        {card.note && <p className="text-xs text-slate-400 mt-1">{card.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-indigo-600">{formatCurrency(card.currentBalance)}</p>
                        <p className="text-xs text-slate-400">{utilization.toFixed(1)}% genutzt</p>
                      </div>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          utilization >= 80 ? 'bg-red-500' :
                          utilization >= 50 ? 'bg-yellow-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    {(card.monthlyFee > 0 || card.annualFee > 0) && (
                      <p className="text-xs text-slate-500 mt-2">
                        Gebühren: {card.monthlyFee > 0 && `${formatCurrency(card.monthlyFee)}/Mo`}
                        {card.monthlyFee > 0 && card.annualFee > 0 && ' - '}
                        {card.annualFee > 0 && `${formatCurrency(card.annualFee)}/Jahr`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>
      </div>

      <Button onClick={onClose} variant="secondary" className="w-full">
        Schließen
      </Button>
    </div>
  );
}
