'use client';

import { ReactNode, useCallback, useState } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';
import { FinancialProfileProvider } from '@/contexts/FinancialProfileContext';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleCloseMenu = useCallback(() => setMobileMenuOpen(false), []);
  const handleOpenMenu = useCallback(() => setMobileMenuOpen(true), []);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <FinancialProfileProvider>
      <div className="flex min-h-[100dvh] bg-slate-50 safe-area-top">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={handleCloseMenu}
          onOpen={handleOpenMenu}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </FinancialProfileProvider>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
