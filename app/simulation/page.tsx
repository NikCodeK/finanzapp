'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSharedFinancialProfile } from '@/contexts/FinancialProfileContext';
import { useInvestments } from '@/hooks/useInvestments';
import { useSimulation } from '@/hooks/useSimulation';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import IncomeSlider from '@/components/simulation/IncomeSlider';
import ExpenseSlider from '@/components/simulation/ExpenseSlider';
import ComparisonTable, { KPICard } from '@/components/simulation/ComparisonTable';
import InvestmentProjection from '@/components/simulation/InvestmentProjection';
import { formatCurrency, formatPercentInt, classNames } from '@/lib/utils';
import { ArrowTrendingUpIcon, BanknotesIcon, ChartBarIcon, ArrowPathIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import FinancialHealthScore from '@/components/finanzen/FinancialHealthScore';
import { calculateHealthScore } from '@/lib/healthScore';

export default function SimulationPage() {
  const {
    monthlyIncome,
    monthlyFixedCosts,
    monthlyVariableCosts,
    monthlyDebtPayments,
    assets,
    isLoading: profileLoading,
  } = useSharedFinancialProfile();

  const { portfolioMetrics, isLoading: investmentsLoading } = useInvestments();

  const [mounted, setMounted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [simulatedIncome, setSimulatedIncome] = useState(0);
  const [simulatedFixedCosts, setSimulatedFixedCosts] = useState(0);
  const [simulatedVariableCosts, setSimulatedVariableCosts] = useState(0);
  const [simulatedDebtPayments, setSimulatedDebtPayments] = useState(0);
  const [expectedReturn, setExpectedReturn] = useState(0.07);
  const [savingsRate, setSavingsRate] = useState(0.5);
  const [timeHorizon, setTimeHorizon] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize simulated values to current values when loaded (only once)
  useEffect(() => {
    if (!hasInitialized && !profileLoading) {
      // Set income to at least 1000 if no income is set, otherwise round to nearest 100
      const initialIncome = monthlyIncome > 0
        ? Math.round(monthlyIncome / 100) * 100
        : 2500;
      setSimulatedIncome(initialIncome);
      setSimulatedFixedCosts(monthlyFixedCosts);
      setSimulatedVariableCosts(monthlyVariableCosts);
      setSimulatedDebtPayments(monthlyDebtPayments);
      setHasInitialized(true);
    }
  }, [hasInitialized, profileLoading, monthlyIncome, monthlyFixedCosts, monthlyVariableCosts, monthlyDebtPayments]);

  const simulationParams = useMemo(
    () => ({
      simulatedIncome,
      currentIncome: monthlyIncome,
      fixedCosts: simulatedFixedCosts,
      variableCosts: simulatedVariableCosts,
      debtPayments: simulatedDebtPayments,
      currentFixedCosts: monthlyFixedCosts,
      currentVariableCosts: monthlyVariableCosts,
      currentDebtPayments: monthlyDebtPayments,
      expectedReturn,
      savingsRate,
      timeHorizon,
      currentPortfolio: portfolioMetrics.totalValue,
    }),
    [
      simulatedIncome,
      monthlyIncome,
      simulatedFixedCosts,
      simulatedVariableCosts,
      simulatedDebtPayments,
      monthlyFixedCosts,
      monthlyVariableCosts,
      monthlyDebtPayments,
      expectedReturn,
      savingsRate,
      timeHorizon,
      portfolioMetrics.totalValue,
    ]
  );

  const simulation = useSimulation(simulationParams);
  const simulatedDebtToIncomeRatio =
    simulatedIncome > 0 ? simulatedDebtPayments / simulatedIncome : 0;
  const simulatedEmergencyMonths =
    simulatedFixedCosts + simulatedVariableCosts > 0
      ? assets.savings / (simulatedFixedCosts + simulatedVariableCosts)
      : 0;
  const simulatedHealthScore = useMemo(() => {
    return calculateHealthScore({
      savingsRate: simulation.simulatedSavingsRate,
      debtToIncomeRatio: simulatedDebtToIncomeRatio,
      emergencyMonths: simulatedEmergencyMonths,
    });
  }, [simulation.simulatedSavingsRate, simulatedDebtToIncomeRatio, simulatedEmergencyMonths]);

  const isLoading = profileLoading || investmentsLoading || !mounted;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const monthlyContribution = Math.max(0, simulation.simulatedAvailable) * savingsRate;

  const comparisonRows = [
    {
      label: 'Netto-Einkommen',
      current: monthlyIncome,
      simulated: simulatedIncome,
    },
    {
      label: 'Fixkosten',
      current: monthlyFixedCosts,
      simulated: simulatedFixedCosts,
      invertColors: true,
    },
    {
      label: 'Variable Kosten',
      current: monthlyVariableCosts,
      simulated: simulatedVariableCosts,
      invertColors: true,
    },
    {
      label: 'Schuldenraten',
      current: monthlyDebtPayments,
      simulated: simulatedDebtPayments,
      invertColors: true,
    },
    {
      label: 'Gesamt Ausgaben',
      current: simulation.currentTotalExpenses,
      simulated: simulation.simulatedTotalExpenses,
      invertColors: true,
    },
    {
      label: 'Verfügbar',
      current: simulation.currentAvailable,
      simulated: simulation.simulatedAvailable,
    },
    {
      label: 'Sparquote',
      current: simulation.currentSavingsRate,
      simulated: simulation.simulatedSavingsRate,
      isPercentage: true,
    },
  ];

  // Reset to current values
  const handleResetToActual = () => {
    setSimulatedIncome(Math.round(monthlyIncome / 100) * 100);
    setSimulatedFixedCosts(monthlyFixedCosts);
    setSimulatedVariableCosts(monthlyVariableCosts);
    setSimulatedDebtPayments(monthlyDebtPayments);
  };

  // Check if any value differs from actual
  const hasChanges =
    simulatedIncome !== Math.round(monthlyIncome / 100) * 100 ||
    simulatedFixedCosts !== monthlyFixedCosts ||
    simulatedVariableCosts !== monthlyVariableCosts ||
    simulatedDebtPayments !== monthlyDebtPayments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finanz-Simulation</h1>
          <p className="text-slate-500 mt-1">
            Simuliere deine Finanzen mit verschiedenen Szenarien
          </p>
        </div>
        {hasChanges && (
          <Button variant="secondary" size="sm" onClick={handleResetToActual}>
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Auf Aktuell zurücksetzen
          </Button>
        )}
      </div>

      {/* Income & Expense Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Slider */}
        <Card>
          <CardHeader
            title="Einkommen"
            subtitle="Simuliertes Netto-Einkommen"
          />
          <div className="mt-4">
            <IncomeSlider
              value={simulatedIncome}
              onChange={setSimulatedIncome}
              currentIncome={monthlyIncome}
              min={1000}
              max={20000}
              step={100}
              presets={[2500, 4000, 6000, 8000, 10000]}
            />
          </div>
        </Card>

        {/* Expense Simulation */}
        <Card>
          <CardHeader
            title="Ausgaben"
            subtitle="Simuliere deine monatlichen Kosten"
          />
          <div className="mt-4 space-y-6">
            <ExpenseSlider
              label="Fixkosten"
              value={simulatedFixedCosts}
              currentValue={monthlyFixedCosts}
              onChange={setSimulatedFixedCosts}
              min={0}
              max={Math.max(5000, monthlyFixedCosts * 2)}
              step={50}
              color="red"
            />
            <ExpenseSlider
              label="Variable Kosten"
              value={simulatedVariableCosts}
              currentValue={monthlyVariableCosts}
              onChange={setSimulatedVariableCosts}
              min={0}
              max={Math.max(3000, monthlyVariableCosts * 2)}
              step={50}
              color="orange"
            />
            <ExpenseSlider
              label="Schuldenraten"
              value={simulatedDebtPayments}
              currentValue={monthlyDebtPayments}
              onChange={setSimulatedDebtPayments}
              min={0}
              max={Math.max(2000, monthlyDebtPayments * 2)}
              step={25}
              color="slate"
            />

            {/* Quick presets */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Schnell-Szenarien:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSimulatedFixedCosts(Math.round(monthlyFixedCosts * 0.9));
                    setSimulatedVariableCosts(Math.round(monthlyVariableCosts * 0.9));
                  }}
                  className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                >
                  -10% Kosten
                </button>
                <button
                  onClick={() => {
                    setSimulatedFixedCosts(Math.round(monthlyFixedCosts * 0.8));
                    setSimulatedVariableCosts(Math.round(monthlyVariableCosts * 0.8));
                  }}
                  className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                >
                  -20% Kosten
                </button>
                <button
                  onClick={() => setSimulatedDebtPayments(0)}
                  className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  Schuldenfrei
                </button>
                <button
                  onClick={() => {
                    setSimulatedFixedCosts(monthlyFixedCosts);
                    setSimulatedVariableCosts(monthlyVariableCosts);
                    setSimulatedDebtPayments(monthlyDebtPayments);
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="col-span-2 md:col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <FinancialHealthScore score={simulatedHealthScore} />
          </div>
        </Card>
        <KPICard
          label="Verfügbar/Monat"
          value={formatCurrency(simulation.simulatedAvailable)}
          trend={simulation.availableDiff > 0 ? 'up' : simulation.availableDiff < 0 ? 'down' : 'neutral'}
          color={simulation.simulatedAvailable >= 0 ? 'emerald' : 'red'}
        />
        <KPICard
          label="Sparquote"
          value={formatPercentInt(simulation.simulatedSavingsRate)}
          trend={
            simulation.savingsRateDiff > 0 ? 'up' : simulation.savingsRateDiff < 0 ? 'down' : 'neutral'
          }
          color={simulation.simulatedSavingsRate >= 0.2 ? 'emerald' : 'amber'}
        />
        <KPICard
          label="Jährlich sparen"
          value={formatCurrency(simulation.simulatedYearlySavings)}
          trend={
            simulation.yearlySavingsDiff > 0 ? 'up' : simulation.yearlySavingsDiff < 0 ? 'down' : 'neutral'
          }
          color="indigo"
        />
      </div>

      {/* Comparison Table */}
      <Card padding="none">
        <div className="p-6 border-b border-slate-200">
          <CardHeader
            title="Vergleich: Aktuell vs. Simuliert"
            subtitle="Detaillierte Gegenüberstellung deiner Finanzen"
          />
        </div>
        <ComparisonTable rows={comparisonRows} />
      </Card>

      {/* Investment Projection */}
      <Card>
        <CardHeader
          title="Investment-Projektion"
          subtitle="Portfolio-Entwicklung mit Zinseszins-Effekt"
        />
        <div className="mt-4">
          <InvestmentProjection
            data={simulation.investmentProjection}
            expectedReturn={expectedReturn}
            savingsRate={savingsRate}
            timeHorizon={timeHorizon}
            onReturnChange={setExpectedReturn}
            onSavingsRateChange={setSavingsRate}
            onTimeHorizonChange={setTimeHorizon}
            monthlyContribution={monthlyContribution}
            finalValue={simulation.finalPortfolioValue}
            totalContributions={simulation.totalContributions}
            totalReturns={simulation.totalReturns}
            fireTarget={simulation.fireTarget}
            yearsToFire={simulation.yearsToFire}
          />
        </div>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
              <BanknotesIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Einkommenseffekt</h3>
              <p className="text-xs text-slate-600 mt-1">
                {simulatedIncome - monthlyIncome >= 0 ? '+' : ''}{formatCurrency(simulatedIncome - monthlyIncome)}/Mo
                = <span className="font-medium text-indigo-600">
                  {simulatedIncome - monthlyIncome >= 0 ? '+' : ''}{formatCurrency((simulatedIncome - monthlyIncome) * 12)}/Jahr
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg shrink-0">
              <CalculatorIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Ausgabeneffekt</h3>
              <p className="text-xs text-slate-600 mt-1">
                {simulation.totalExpensesDiff <= 0 ? '' : '+'}{formatCurrency(simulation.totalExpensesDiff)}/Mo
                = <span className={`font-medium ${simulation.totalExpensesDiff <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {simulation.totalExpensesDiff <= 0 ? '' : '+'}{formatCurrency(simulation.totalExpensesDiff * 12)}/Jahr
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Zinseszins</h3>
              <p className="text-xs text-slate-600 mt-1">
                {(expectedReturn * 100).toFixed(0)}% Rendite ={' '}
                <span className="font-medium text-emerald-600">
                  +{formatCurrency(simulation.totalReturns)}
                </span>{' '}
                in {timeHorizon}J
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0">
              <ChartBarIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">FIRE-Ziel</h3>
              <p className="text-xs text-slate-600 mt-1">
                {simulation.yearsToFire !== null ? (
                  <>
                    <span className="font-medium text-amber-600">
                      {simulation.yearsToFire.toFixed(1)} Jahre
                    </span>{' '}
                    bis {formatCurrency(simulation.fireTarget)}
                  </>
                ) : (
                  'Sparrate erhöhen'
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center">
        Diese Simulation dient nur zu Informationszwecken. Die tatsächliche Entwicklung kann
        abweichen. Vergangene Renditen sind keine Garantie für zukünftige Ergebnisse.
      </p>
    </div>
  );
}
