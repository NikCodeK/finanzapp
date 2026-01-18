'use client';

import { useEffect, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useWeeklyReports } from '@/hooks/useWeeklyReports';
import KPICard from '@/components/KPICard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TransactionTable from '@/components/TransactionTable';
import IncomeExpenseBar from '@/components/charts/IncomeExpenseBar';
import CategoryPie from '@/components/charts/CategoryPie';
import NetWorthLine from '@/components/charts/NetWorthLine';
import Link from 'next/link';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, getCurrentMonthISO, formatMonth } from '@/lib/utils';
import {
  computeMonthlySummary,
  getMonthlyIncomeExpenseData,
  calculateNetWorthOverTime,
  getTopCategories,
  getTransactionsForMonth,
} from '@/lib/calculations';

export default function Dashboard() {
  const { transactions, isLoading } = useTransactions();
  const { reports } = useWeeklyReports();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const currentMonthISO = getCurrentMonthISO();
  const monthlySummary = computeMonthlySummary(transactions, currentMonthISO);
  const incomeExpenseData = getMonthlyIncomeExpenseData(transactions, 6);
  const netWorthData = calculateNetWorthOverTime(transactions, 6);
  const topExpenseCategories = getTopCategories(
    getTransactionsForMonth(transactions, currentMonthISO),
    'expense',
    5
  );
  const recentTransactions = [...transactions]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Übersicht für {formatMonth(currentMonthISO + '-01')}
          </p>
        </div>
        <Link href="/transactions">
          <Button>Neue Transaktion</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Einnahmen"
          value={formatCurrency(monthlySummary.income)}
          subtitle="Dieser Monat"
          variant="income"
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Ausgaben"
          value={formatCurrency(monthlySummary.expenses)}
          subtitle="Dieser Monat"
          variant="expense"
          icon={<ArrowTrendingDownIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Netto"
          value={formatCurrency(monthlySummary.net)}
          subtitle="Dieser Monat"
          variant={monthlySummary.net >= 0 ? 'income' : 'expense'}
          icon={<WalletIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Sparquote"
          value={`${(monthlySummary.savingsRate * 100).toFixed(1)}%`}
          subtitle="Dieser Monat"
          icon={<BanknotesIcon className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Einnahmen vs. Ausgaben" subtitle="Letzte 6 Monate" />
          <IncomeExpenseBar data={incomeExpenseData} />
        </Card>

        <Card>
          <CardHeader title="Ausgaben nach Kategorie" subtitle="Dieser Monat" />
          {topExpenseCategories.length > 0 ? (
            <CategoryPie data={topExpenseCategories} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              Keine Ausgaben in diesem Monat
            </div>
          )}
        </Card>
      </div>

      {/* Net Worth Chart */}
      <Card>
        <CardHeader
          title="Nettovermögen Entwicklung"
          subtitle="Letzte 6 Monate"
        />
        <NetWorthLine data={netWorthData} />
      </Card>

      {/* Recent Transactions */}
      <Card padding="none">
        <div className="p-6 border-b border-slate-200">
          <CardHeader
            title="Letzte Transaktionen"
            action={
              <Link href="/transactions">
                <Button variant="ghost" size="sm">
                  Alle anzeigen
                </Button>
              </Link>
            }
          />
        </div>
        <TransactionTable
          transactions={recentTransactions}
          showActions={false}
        />
      </Card>

      {/* Weekly Reports Summary */}
      {reports.length > 0 && (
        <Card>
          <CardHeader
            title="Letzter Wochenbericht"
            action={
              <Link href="/weekly">
                <Button variant="ghost" size="sm">
                  Alle Berichte
                </Button>
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Erkenntnisse</p>
              <p className="text-slate-900 mt-1">{reports[0].insights || '-'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Nächste Schritte</p>
              <p className="text-slate-900 mt-1">
                {reports[0].nextDecision || '-'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Stimmung</p>
              <p className="text-2xl mt-1">
                {['😞', '😕', '😐', '🙂', '😊'][reports[0].mood - 1]}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
