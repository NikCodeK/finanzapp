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

  // Calculated values
  const totalCreditCardDebt = useMemo(() => {
    return creditCards
      .filter((c) => c.isActive)
      .reduce((sum, c) => sum + c.currentBalance, 0);
  }, [creditCards]);

  const totalCreditLimit = useMemo(() => {
    return creditCards
      .filter((c) => c.isActive)
      .reduce((sum, c) => sum + c.creditLimit, 0);
  }, [creditCards]);

  const averageUtilization = useMemo(() => {
    if (totalCreditLimit === 0) return 0;
    return (totalCreditCardDebt / totalCreditLimit) * 100;
  }, [totalCreditCardDebt, totalCreditLimit]);

  const totalMonthlyFees = useMemo(() => {
    return creditCards
      .filter((c) => c.isActive)
      .reduce((sum, c) => sum + c.monthlyFee, 0);
  }, [creditCards]);

  const totalAnnualFees = useMemo(() => {
    return creditCards
      .filter((c) => c.isActive)
      .reduce((sum, c) => sum + c.annualFee, 0);
  }, [creditCards]);

  const activeCards = useMemo(() => {
    return creditCards.filter((c) => c.isActive);
  }, [creditCards]);

  return {
    creditCards,
    activeCards,
    isLoading,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    loadBalances,
    addBalance,
    deleteBalance,
    totalCreditCardDebt,
    totalCreditLimit,
    averageUtilization,
    totalMonthlyFees,
    totalAnnualFees,
    refresh: loadCreditCards,
  };
}
