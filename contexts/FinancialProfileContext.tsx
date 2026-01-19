'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';

type FinancialProfileContextType = ReturnType<typeof useFinancialProfile>;

const FinancialProfileContext = createContext<FinancialProfileContextType | null>(null);

export function FinancialProfileProvider({ children }: { children: ReactNode }) {
  const financialProfile = useFinancialProfile();

  return (
    <FinancialProfileContext.Provider value={financialProfile}>
      {children}
    </FinancialProfileContext.Provider>
  );
}

export function useSharedFinancialProfile() {
  const context = useContext(FinancialProfileContext);
  if (!context) {
    throw new Error('useSharedFinancialProfile must be used within a FinancialProfileProvider');
  }
  return context;
}
