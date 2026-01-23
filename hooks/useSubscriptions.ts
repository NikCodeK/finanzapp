'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Subscription } from '@/lib/types';
import {
  getSubscriptions,
  addSubscription as addSubscriptionDB,
  updateSubscription as updateSubscriptionDB,
  deleteSubscription as deleteSubscriptionDB,
} from '@/lib/supabase-storage';
import { addMonths, addDays, isBefore, differenceInDays } from 'date-fns';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    const data = await getSubscriptions();
    setSubscriptions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const addSubscription = useCallback(async (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription = await addSubscriptionDB(subscription);
    if (newSubscription) {
      setSubscriptions(prev => [newSubscription, ...prev]);
    }
    return newSubscription;
  }, []);

  const updateSubscription = useCallback(async (subscription: Subscription) => {
    const success = await updateSubscriptionDB(subscription);
    if (success) {
      setSubscriptions(prev =>
        prev.map(s => (s.id === subscription.id ? subscription : s))
      );
    }
    return success;
  }, []);

  const deleteSubscription = useCallback(async (id: string) => {
    const success = await deleteSubscriptionDB(id);
    if (success) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    }
    return success;
  }, []);

  const subscriptionSummary = useMemo(() => {
    const grouped: Record<string, { subscriptions: Subscription[]; totalMonthly: number }> = {};
    let monthlySubscriptionCost = 0;
    let activeCount = 0;

    for (const sub of subscriptions) {
      if (!sub.isActive) continue;
      activeCount += 1;

      let monthlyCost = sub.amount;
      switch (sub.frequency) {
        case 'vierteljaehrlich':
          monthlyCost = sub.amount / 3;
          break;
        case 'halbjaehrlich':
          monthlyCost = sub.amount / 6;
          break;
        case 'jaehrlich':
          monthlyCost = sub.amount / 12;
          break;
      }

      monthlySubscriptionCost += monthlyCost;

      if (!grouped[sub.category]) {
        grouped[sub.category] = { subscriptions: [], totalMonthly: 0 };
      }
      grouped[sub.category].subscriptions.push(sub);
      grouped[sub.category].totalMonthly += monthlyCost;
    }

    return {
      monthlySubscriptionCost,
      activeCount,
      subscriptionsByCategory: grouped,
    };
  }, [subscriptions]);

  // Calculate yearly cost
  const yearlySubscriptionCost = useMemo(() => {
    return subscriptionSummary.monthlySubscriptionCost * 12;
  }, [subscriptionSummary.monthlySubscriptionCost]);

  // Get subscriptions that can be cancelled soon
  const upcomingCancellations = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    return subscriptions
      .filter(sub => {
        if (!sub.isActive || !sub.nextBillingDateISO) return false;

        const nextBilling = new Date(sub.nextBillingDateISO);
        const cancellationDeadline = addDays(nextBilling, -sub.cancellationPeriodDays);

        return isBefore(cancellationDeadline, thirtyDaysFromNow) && isBefore(today, cancellationDeadline);
      })
      .map(sub => {
        const nextBilling = new Date(sub.nextBillingDateISO!);
        const cancellationDeadline = addDays(nextBilling, -sub.cancellationPeriodDays);
        const daysUntilDeadline = differenceInDays(cancellationDeadline, today);

        return {
          ...sub,
          cancellationDeadline,
          daysUntilDeadline,
        };
      })
      .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
  }, [subscriptions]);

  return {
    subscriptions,
    isLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refresh: loadSubscriptions,
    monthlySubscriptionCost: subscriptionSummary.monthlySubscriptionCost,
    yearlySubscriptionCost,
    upcomingCancellations,
    subscriptionsByCategory: subscriptionSummary.subscriptionsByCategory,
    activeCount: subscriptionSummary.activeCount,
  };
}
