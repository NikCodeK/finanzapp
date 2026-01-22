'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
  FlagIcon,
  ArrowRightOnRectangleIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  ChartPieIcon,
  CurrencyEuroIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';
import { useAuth } from './AuthProvider';

const currentYear = new Date().getFullYear();

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    name: 'Finanzen',
    icon: WalletIcon,
    defaultOpen: true,
    items: [
      { name: 'Transaktionen', href: '/transactions', icon: BanknotesIcon },
      { name: 'Meine Finanzen', href: '/finanzen', icon: WalletIcon },
      { name: 'Abos', href: '/subscriptions', icon: CreditCardIcon },
    ],
  },
  {
    name: 'Vermögen',
    icon: CurrencyEuroIcon,
    defaultOpen: true,
    items: [
      { name: 'Investments', href: '/investments', icon: CurrencyEuroIcon },
      { name: 'Planung', href: '/planning', icon: ShoppingCartIcon },
    ],
  },
  {
    name: 'Berichte',
    icon: ChartBarIcon,
    defaultOpen: false,
    items: [
      { name: 'Analyse', href: '/analytics', icon: ChartPieIcon },
      { name: 'Wochenberichte', href: '/weekly', icon: CalendarDaysIcon },
      { name: 'Monatsübersicht', href: '/monthly', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Ziele',
    icon: FlagIcon,
    defaultOpen: false,
    items: [
      { name: `Ziele ${currentYear}`, href: `/ziele/${currentYear}`, icon: FlagIcon },
      { name: 'Prognose', href: '/projection', icon: ArrowTrendingUpIcon },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Initialize open state based on current path and defaultOpen
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationGroups.forEach(group => {
      // Open if defaultOpen or if current path is in this group
      const isActiveGroup = group.items.some(item =>
        item.href.startsWith('/ziele')
          ? pathname.startsWith('/ziele')
          : pathname === item.href
      );
      initial[group.name] = group.defaultOpen || isActiveGroup;
    });
    return initial;
  });

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isItemActive = (href: string) => {
    if (href.startsWith('/ziele')) {
      return pathname.startsWith('/ziele');
    }
    return pathname === href;
  };

  return (
    <div className="flex h-screen w-60 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold text-white">Finanzapp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Dashboard - Always visible */}
        <Link
          href="/"
          className={classNames(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          )}
        >
          <HomeIcon className="h-5 w-5 flex-shrink-0" />
          Dashboard
        </Link>

        {/* Grouped Navigation */}
        <div className="pt-4 space-y-1">
          {navigationGroups.map((group) => {
            const isOpen = openGroups[group.name];
            const hasActiveItem = group.items.some(item => isItemActive(item.href));

            return (
              <div key={group.name}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={classNames(
                    'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    hasActiveItem
                      ? 'text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <group.icon className="h-5 w-5 flex-shrink-0" />
                    {group.name}
                  </div>
                  {isOpen ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>

                {/* Group Items */}
                {isOpen && (
                  <div className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-4">
                    {group.items.map((item) => {
                      const isActive = isItemActive(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-indigo-600 text-white font-medium'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-3 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Abmelden
        </button>
      </div>
    </div>
  );
}
