'use client';

import { useMemo } from 'react';

interface SimulationParams {
  simulatedIncome: number;
  currentIncome: number;
  fixedCosts: number; // simulated
  variableCosts: number; // simulated
  debtPayments: number; // simulated
  currentFixedCosts: number;
  currentVariableCosts: number;
  currentDebtPayments: number;
  expectedReturn: number; // as decimal, e.g., 0.07 for 7%
  savingsRate: number; // as decimal, e.g., 0.5 for 50%
  timeHorizon: number; // years
  currentPortfolio: number;
}

interface SimulationResult {
  // Current situation
  currentAvailable: number;
  currentSavingsRate: number;
  currentYearlySavings: number;
  currentTotalExpenses: number;

  // Simulated situation
  simulatedAvailable: number;
  simulatedSavingsRate: number;
  simulatedYearlySavings: number;
  simulatedTotalExpenses: number;

  // Differences
  availableDiff: number;
  savingsRateDiff: number;
  yearlySavingsDiff: number;
  fixedCostsDiff: number;
  variableCostsDiff: number;
  debtPaymentsDiff: number;
  totalExpensesDiff: number;

  // Investment projection
  investmentProjection: InvestmentMonth[];
  finalPortfolioValue: number;
  totalContributions: number;
  totalReturns: number;

  // FIRE calculation
  fireTarget: number;
  yearsToFire: number | null;
  fireAchievable: boolean;
}

interface InvestmentMonth {
  month: number;
  year: number;
  label: string;
  contributions: number;
  portfolioValue: number;
  returns: number;
}

export function useSimulation(params: SimulationParams): SimulationResult {
  return useMemo(() => {
    const {
      simulatedIncome,
      currentIncome,
      fixedCosts,
      variableCosts,
      debtPayments,
      currentFixedCosts,
      currentVariableCosts,
      currentDebtPayments,
      expectedReturn,
      savingsRate,
      timeHorizon,
      currentPortfolio,
    } = params;

    const currentTotalExpenses = currentFixedCosts + currentVariableCosts + currentDebtPayments;
    const simulatedTotalExpenses = fixedCosts + variableCosts + debtPayments;

    // Current situation
    const currentAvailable = currentIncome - currentTotalExpenses;
    const currentSavingsRate = currentIncome > 0 ? currentAvailable / currentIncome : 0;
    const currentYearlySavings = Math.max(0, currentAvailable) * 12;

    // Simulated situation
    const simulatedAvailable = simulatedIncome - simulatedTotalExpenses;
    const simulatedSavingsRate = simulatedIncome > 0 ? simulatedAvailable / simulatedIncome : 0;
    const simulatedYearlySavings = Math.max(0, simulatedAvailable) * 12;

    // Differences
    const availableDiff = simulatedAvailable - currentAvailable;
    const savingsRateDiff = simulatedSavingsRate - currentSavingsRate;
    const yearlySavingsDiff = simulatedYearlySavings - currentYearlySavings;
    const fixedCostsDiff = fixedCosts - currentFixedCosts;
    const variableCostsDiff = variableCosts - currentVariableCosts;
    const debtPaymentsDiff = debtPayments - currentDebtPayments;
    const totalExpensesDiff = simulatedTotalExpenses - currentTotalExpenses;

    // Investment projection (monthly compound interest)
    const monthlyContribution = Math.max(0, simulatedAvailable) * savingsRate;
    const monthlyRate = expectedReturn / 12;
    const totalMonths = timeHorizon * 12;

    const investmentProjection: InvestmentMonth[] = [];
    let portfolio = currentPortfolio;
    let totalContributions = currentPortfolio;

    const now = new Date();

    for (let i = 0; i <= totalMonths; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);

      investmentProjection.push({
        month: i,
        year: Math.floor(i / 12),
        label: date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
        contributions: totalContributions,
        portfolioValue: portfolio,
        returns: portfolio - totalContributions,
      });

      // Apply monthly growth and contribution (except for the last iteration which is just for display)
      if (i < totalMonths) {
        portfolio = portfolio * (1 + monthlyRate) + monthlyContribution;
        totalContributions += monthlyContribution;
      }
    }

    const finalPortfolioValue = portfolio;
    const totalReturns = finalPortfolioValue - totalContributions;

    // FIRE calculation (4% rule)
    const monthlyExpenses = simulatedTotalExpenses;
    const yearlyExpenses = monthlyExpenses * 12;
    const fireTarget = yearlyExpenses / 0.04; // 25x yearly expenses

    // Calculate years to FIRE
    let yearsToFire: number | null = null;
    if (monthlyContribution > 0 && expectedReturn > 0) {
      // Use formula: FV = PV(1+r)^n + PMT*((1+r)^n - 1)/r
      // Solve for n when FV = fireTarget
      // This is an approximation using iteration
      let testPortfolio = currentPortfolio;
      for (let months = 0; months < 600; months++) { // max 50 years
        testPortfolio = testPortfolio * (1 + monthlyRate) + monthlyContribution;
        if (testPortfolio >= fireTarget) {
          yearsToFire = months / 12;
          break;
        }
      }
    }

    const fireAchievable = yearsToFire !== null && yearsToFire <= 50;

    return {
      currentAvailable,
      currentSavingsRate,
      currentYearlySavings,
      currentTotalExpenses,
      simulatedAvailable,
      simulatedSavingsRate,
      simulatedYearlySavings,
      simulatedTotalExpenses,
      availableDiff,
      savingsRateDiff,
      yearlySavingsDiff,
      fixedCostsDiff,
      variableCostsDiff,
      debtPaymentsDiff,
      totalExpensesDiff,
      investmentProjection,
      finalPortfolioValue,
      totalContributions,
      totalReturns,
      fireTarget,
      yearsToFire,
      fireAchievable,
    };
  }, [params]);
}

// Helper function to calculate compound interest
export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  let total = principal;

  for (let i = 0; i < months; i++) {
    total = total * (1 + monthlyRate) + monthlyContribution;
  }

  return total;
}
