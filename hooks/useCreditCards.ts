'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, CreditCardBalance } from '@/lib/types';
import {
  getCreditCards,
  addCreditCard as addCreditCardDB,
  updateCreditCard as updateCreditCardDB,
  deleteCreditCard as deleteCreditCardDB,
  getCreditCardBalances,
  addCreditCardBalance as addCreditCardBalanceDB,
  deleteCreditCardBalance as deleteCreditCardBalanceDB,
} from '@/lib/supabase-storage';

export function useCreditCards() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCreditCards = useCallback(async () => {
    setIsLoading(true);
    const data = await getCreditCards();
    setCreditCards(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCreditCards();
  }, [loadCreditCards]);

  const addCreditCard = useCallback(async (card: Omit<CreditCard, 'id'>) => {
    const newCard = await addCreditCardDB(card);
    if (newCard) {
      setCreditCards((prev) => [newCard, ...prev]);
    }
    return newCard;
  }, []);

  const updateCreditCard = useCallback(async (updated: CreditCard) => {
    const success = await updateCreditCardDB(updated);
    if (success) {
      setCreditCards((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    }
    return success;
  }, []);

  const deleteCreditCard = useCallback(async (id: string) => {
    const success = await deleteCreditCardDB(id);
    if (success) {
      setCreditCards((prev) => prev.filter((c) => c.id !== id));
    }
    return success;
  }, []);

  // Balance management
  const loadBalances = useCallback(async (creditCardId: string) => {
    return await getCreditCardBalances(creditCardId);
  }, []);

  const addBalance = useCallback(async (balance: Omit<CreditCardBalance, 'id'>) => {
    const newBalance = await addCreditCardBalanceDB(balance);
    if (newBalance) {
      // Update local state with new current balance
      setCreditCards((prev) =>
        prev.map((c) =>
          c.id === balance.creditCardId
            ? { ...c, currentBalance: balance.balance }
            : c
        )
      );
    }
    return newBalance;
  }, []);

  const deleteBalance = useCallback(async (id: string) => {
    return await deleteCreditCardBalanceDB(id);
  }, []);

  const creditCardSummary = useMemo(() => {
    const activeCards: CreditCard[] = [];
    let totalCreditCardDebt = 0;
    let totalCreditLimit = 0;
    let totalMonthlyFees = 0;
    let totalAnnualFees = 0;

    for (const card of creditCards) {
      if (!card.isActive) continue;
      activeCards.push(card);
      totalCreditCardDebt += card.currentBalance;
      totalCreditLimit += card.creditLimit;
      totalMonthlyFees += card.monthlyFee;
      totalAnnualFees += card.annualFee;
    }

    const averageUtilization = totalCreditLimit === 0
      ? 0
      : (totalCreditCardDebt / totalCreditLimit) * 100;

    return {
      activeCards,
      totalCreditCardDebt,
      totalCreditLimit,
      averageUtilization,
      totalMonthlyFees,
      totalAnnualFees,
    };
  }, [creditCards]);

  return {
    creditCards,
    activeCards: creditCardSummary.activeCards,
    isLoading,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    loadBalances,
    addBalance,
    deleteBalance,
    totalCreditCardDebt: creditCardSummary.totalCreditCardDebt,
    totalCreditLimit: creditCardSummary.totalCreditLimit,
    averageUtilization: creditCardSummary.averageUtilization,
    totalMonthlyFees: creditCardSummary.totalMonthlyFees,
    totalAnnualFees: creditCardSummary.totalAnnualFees,
    refresh: loadCreditCards,
  };
}
