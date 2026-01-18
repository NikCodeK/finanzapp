'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalStatus } from '@/lib/types';
import {
  getGoals,
  getGoalsByYear,
  addGoal as addGoalDB,
  updateGoal as updateGoalDB,
  deleteGoal as deleteGoalDB,
} from '@/lib/supabase-storage';
import { toDateISO } from '@/lib/utils';

export function useGoals(year?: number) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    const data = year ? await getGoalsByYear(year) : await getGoals();
    setGoals(data);
    setIsLoading(false);
  }, [year]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAtISO'>) => {
    const newGoal = await addGoalDB({
      ...goal,
      createdAtISO: toDateISO(new Date()),
    });
    if (newGoal) {
      if (!year || newGoal.year === year) {
        setGoals((prev) => [...prev, newGoal].sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority;
          return a.deadlineISO.localeCompare(b.deadlineISO);
        }));
      }
    }
    return newGoal;
  }, [year]);

  const updateGoal = useCallback(async (updated: Goal) => {
    const success = await updateGoalDB(updated);
    if (success) {
      setGoals((prev) =>
        prev.map((g) => (g.id === updated.id ? updated : g)).sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority;
          return a.deadlineISO.localeCompare(b.deadlineISO);
        })
      );
    }
    return success;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const success = await deleteGoalDB(id);
    if (success) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
    return success;
  }, []);

  const updateGoalProgress = useCallback(async (id: string, newAmount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return false;

    const status: GoalStatus = newAmount >= goal.targetAmount ? 'erreicht' : goal.status;
    const updated = { ...goal, currentAmount: newAmount, status };
    return updateGoal(updated);
  }, [goals, updateGoal]);

  const getGoalProgress = useCallback((goal: Goal, currentIncome?: number) => {
    // For income goals, use live income from financial profile if provided
    const effectiveCurrentAmount = goal.type === 'einkommen' && currentIncome !== undefined
      ? currentIncome
      : goal.currentAmount;
    const range = goal.targetAmount - goal.startAmount;
    const progress = range > 0
      ? (effectiveCurrentAmount - goal.startAmount) / range
      : 0;
    return Math.min(Math.max(progress, 0), 1);
  }, []);

  const getGoalsOnTrack = useCallback(() => {
    const now = new Date();
    return goals.filter((g) => {
      if (g.status !== 'aktiv') return false;
      const deadline = new Date(g.deadlineISO);
      const created = new Date(g.createdAtISO);
      const totalDays = (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      const daysPassed = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      const expectedProgress = daysPassed / totalDays;
      const actualProgress = getGoalProgress(g);
      return actualProgress >= expectedProgress * 0.9;
    });
  }, [goals, getGoalProgress]);

  return {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    getGoalProgress,
    getGoalsOnTrack,
    refresh: loadGoals,
  };
}
