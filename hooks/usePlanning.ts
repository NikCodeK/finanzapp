'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlannedPurchase, LifeScenario, EventBudget } from '@/lib/types';
import {
  getPlannedPurchases,
  addPlannedPurchase as addPlannedPurchaseDB,
  updatePlannedPurchase as updatePlannedPurchaseDB,
  deletePlannedPurchase as deletePlannedPurchaseDB,
  getLifeScenarios,
  addLifeScenario as addLifeScenarioDB,
  updateLifeScenario as updateLifeScenarioDB,
  deleteLifeScenario as deleteLifeScenarioDB,
  getEventBudgets,
  addEventBudget as addEventBudgetDB,
  updateEventBudget as updateEventBudgetDB,
  deleteEventBudget as deleteEventBudgetDB,
} from '@/lib/supabase-storage';
import { differenceInMonths } from 'date-fns';

export function usePlanning() {
  const [plannedPurchases, setPlannedPurchases] = useState<PlannedPurchase[]>([]);
  const [lifeScenarios, setLifeScenarios] = useState<LifeScenario[]>([]);
  const [eventBudgets, setEventBudgets] = useState<EventBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [purchases, scenarios, events] = await Promise.all([
      getPlannedPurchases(),
      getLifeScenarios(),
      getEventBudgets(),
    ]);
    setPlannedPurchases(purchases);
    setLifeScenarios(scenarios);
    setEventBudgets(events);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Planned Purchases CRUD
  const addPlannedPurchase = useCallback(async (purchase: Omit<PlannedPurchase, 'id'>) => {
    const newPurchase = await addPlannedPurchaseDB(purchase);
    if (newPurchase) {
      setPlannedPurchases(prev => [newPurchase, ...prev]);
    }
    return newPurchase;
  }, []);

  const updatePlannedPurchase = useCallback(async (purchase: PlannedPurchase) => {
    const success = await updatePlannedPurchaseDB(purchase);
    if (success) {
      setPlannedPurchases(prev =>
        prev.map(p => (p.id === purchase.id ? purchase : p))
      );
    }
    return success;
  }, []);

  const deletePlannedPurchase = useCallback(async (id: string) => {
    const success = await deletePlannedPurchaseDB(id);
    if (success) {
      setPlannedPurchases(prev => prev.filter(p => p.id !== id));
    }
    return success;
  }, []);

  // Life Scenarios CRUD
  const addLifeScenario = useCallback(async (scenario: Omit<LifeScenario, 'id'>) => {
    const newScenario = await addLifeScenarioDB(scenario);
    if (newScenario) {
      setLifeScenarios(prev => [newScenario, ...prev]);
    }
    return newScenario;
  }, []);

  const updateLifeScenario = useCallback(async (scenario: LifeScenario) => {
    const success = await updateLifeScenarioDB(scenario);
    if (success) {
      setLifeScenarios(prev =>
        prev.map(s => (s.id === scenario.id ? scenario : s))
      );
    }
    return success;
  }, []);

  const deleteLifeScenario = useCallback(async (id: string) => {
    const success = await deleteLifeScenarioDB(id);
    if (success) {
      setLifeScenarios(prev => prev.filter(s => s.id !== id));
    }
    return success;
  }, []);

  // Event Budgets CRUD
  const addEventBudget = useCallback(async (budget: Omit<EventBudget, 'id'>) => {
    const newBudget = await addEventBudgetDB(budget);
    if (newBudget) {
      setEventBudgets(prev => [newBudget, ...prev]);
    }
    return newBudget;
  }, []);

  const updateEventBudget = useCallback(async (budget: EventBudget) => {
    const success = await updateEventBudgetDB(budget);
    if (success) {
      setEventBudgets(prev =>
        prev.map(b => (b.id === budget.id ? budget : b))
      );
    }
    return success;
  }, []);

  const deleteEventBudget = useCallback(async (id: string) => {
    const success = await deleteEventBudgetDB(id);
    if (success) {
      setEventBudgets(prev => prev.filter(b => b.id !== id));
    }
    return success;
  }, []);

  const purchaseSummary = useMemo(() => {
    const activePurchases: PlannedPurchase[] = [];
    let totalPlannedAmount = 0;
    let totalSavedAmount = 0;
    let monthlyContributionsNeeded = 0;

    for (const purchase of plannedPurchases) {
      if (purchase.status !== 'aktiv') continue;
      activePurchases.push(purchase);
      totalPlannedAmount += purchase.targetAmount;
      totalSavedAmount += purchase.currentAmount;
      monthlyContributionsNeeded += purchase.monthlyContribution;
    }

    return {
      activePurchases,
      totalPlannedAmount,
      totalSavedAmount,
      monthlyContributionsNeeded,
    };
  }, [plannedPurchases]);

  // Calculate months until goal for each purchase
  const purchasesWithProjection = useMemo(() => {
    const today = new Date();

    return purchaseSummary.activePurchases.map(purchase => {
        const remaining = purchase.targetAmount - purchase.currentAmount;
        const monthsToGoal = purchase.monthlyContribution > 0
          ? Math.ceil(remaining / purchase.monthlyContribution)
          : null;

        const targetDate = purchase.targetDateISO ? new Date(purchase.targetDateISO) : null;
        const monthsUntilTarget = targetDate ? differenceInMonths(targetDate, today) : null;

        const isOnTrack = monthsToGoal !== null && monthsUntilTarget !== null
          ? monthsToGoal <= monthsUntilTarget
          : null;

        return {
          ...purchase,
          remaining,
          monthsToGoal,
          monthsUntilTarget,
          isOnTrack,
          progress: purchase.targetAmount > 0
            ? (purchase.currentAmount / purchase.targetAmount) * 100
            : 0,
        };
      });
  }, [purchaseSummary.activePurchases]);

  const eventBudgetSummary = useMemo(() => {
    const activeEventBudgets: EventBudget[] = [];
    let totalEventBudgetTarget = 0;
    let totalEventBudgetSaved = 0;

    for (const event of eventBudgets) {
      if (event.status !== 'aktiv') continue;
      activeEventBudgets.push(event);
      totalEventBudgetTarget += event.targetAmount;
      totalEventBudgetSaved += event.currentAmount;
    }

    return {
      activeEventBudgets,
      totalEventBudgetTarget,
      totalEventBudgetSaved,
    };
  }, [eventBudgets]);

  return {
    // Planned Purchases
    plannedPurchases,
    purchasesWithProjection,
    addPlannedPurchase,
    updatePlannedPurchase,
    deletePlannedPurchase,
    totalPlannedAmount: purchaseSummary.totalPlannedAmount,
    totalSavedAmount: purchaseSummary.totalSavedAmount,
    monthlyContributionsNeeded: purchaseSummary.monthlyContributionsNeeded,

    // Life Scenarios
    lifeScenarios,
    addLifeScenario,
    updateLifeScenario,
    deleteLifeScenario,

    // Event Budgets
    eventBudgets,
    activeEventBudgets: eventBudgetSummary.activeEventBudgets,
    addEventBudget,
    updateEventBudget,
    deleteEventBudget,
    totalEventBudgetTarget: eventBudgetSummary.totalEventBudgetTarget,
    totalEventBudgetSaved: eventBudgetSummary.totalEventBudgetSaved,

    // General
    isLoading,
    refresh: loadData,
  };
}
