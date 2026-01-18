'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalStatus } from '@/lib/types';
import {
  getGoals,
  saveGoals,
  initializeStorage,
} from '@/lib/storage';
import { generateId, toDateISO } from '@/lib/utils';

export function useGoals(year?: number) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    let data = getGoals();
    if (year) {
      data = data.filter((g) => g.year === year);
    }
    // Sort by priority, then by deadline
    const sorted = [...data].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.deadlineISO.localeCompare(b.deadlineISO);
    });
    setGoals(sorted);
    setIsLoading(false);
  }, [year]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAtISO'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAtISO: toDateISO(new Date()),
    };
    setGoals((prev) => {
      // Get all goals including other years
      const allGoals = getGoals();
      const updated = [...allGoals, newGoal];
      saveGoals(updated);
      // Return only filtered goals for current view
      const filtered = year ? updated.filter((g) => g.year === year) : updated;
      return filtered.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.deadlineISO.localeCompare(b.deadlineISO);
      });
    });
    return newGoal;
  }, [year]);

  const updateGoal = useCallback((updated: Goal) => {
    setGoals((prev) => {
      // Update in all goals
      const allGoals = getGoals();
      const newGoals = allGoals.map((g) =>
        g.id === updated.id ? updated : g
      );
      saveGoals(newGoals);
      // Return only filtered goals
      const filtered = year ? newGoals.filter((g) => g.year === year) : newGoals;
      return filtered.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.deadlineISO.localeCompare(b.deadlineISO);
      });
    });
  }, [year]);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const allGoals = getGoals();
      const filtered = allGoals.filter((g) => g.id !== id);
      saveGoals(filtered);
      const yearFiltered = year ? filtered.filter((g) => g.year === year) : filtered;
      return yearFiltered;
    });
  }, [year]);

  const updateGoalProgress = useCallback((id: string, newAmount: number) => {
    setGoals((prev) => {
      const allGoals = getGoals();
      const newGoals = allGoals.map((g) => {
        if (g.id === id) {
          const status: GoalStatus = newAmount >= g.targetAmount ? 'erreicht' : g.status;
          return { ...g, currentAmount: newAmount, status };
        }
        return g;
      });
      saveGoals(newGoals);
      const filtered = year ? newGoals.filter((g) => g.year === year) : newGoals;
      return filtered.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.deadlineISO.localeCompare(b.deadlineISO);
      });
    });
  }, [year]);

  const getGoalProgress = useCallback((goal: Goal) => {
    const progress = goal.targetAmount > 0
      ? (goal.currentAmount - goal.startAmount) / (goal.targetAmount - goal.startAmount)
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
      return actualProgress >= expectedProgress * 0.9; // 10% tolerance
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
  };
}
