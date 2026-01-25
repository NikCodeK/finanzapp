'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
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
  Bars3Icon,
  XMarkIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';
import { useAuth } from './AuthProvider';

const currentYear = new Date().getFullYear();

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// Bottom navigation items (most used)
const bottomNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transaktionen', href: '/transactions', icon: BanknotesIcon },
  { name: 'Finanzen', href: '/finanzen', icon: WalletIcon },
  { name: 'Abos', href: '/subscriptions', icon: CreditCardIcon },
];

// All navigation items for drawer
const allNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transaktionen', href: '/transactions', icon: BanknotesIcon },
  { name: 'Meine Finanzen', href: '/finanzen', icon: WalletIcon },
  { name: 'Abos', href: '/subscriptions', icon: CreditCardIcon },
  { name: `Ziele ${currentYear}`, href: `/ziele/${currentYear}`, icon: FlagIcon },
  { name: 'Analyse', href: '/analytics', icon: ChartPieIcon, badge: 'Desktop' },
  { name: 'Investments', href: '/investments', icon: CurrencyEuroIcon, badge: 'Desktop' },
  { name: 'Planung', href: '/planning', icon: ShoppingCartIcon, badge: 'Desktop' },
  { name: 'Simulation', href: '/simulation', icon: BeakerIcon, badge: 'Desktop' },
  { name: 'Wochenberichte', href: '/weekly', icon: CalendarDaysIcon, badge: 'Desktop' },
  { name: 'Monatsübersicht', href: '/monthly', icon: ChartBarIcon, badge: 'Desktop' },
  { name: 'Prognose', href: '/projection', icon: ArrowTrendingUpIcon, badge: 'Desktop' },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function MobileNav({ isOpen, onClose, onOpen }: MobileNavProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const lastOpenAtRef = useRef<number>(0);

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const isItemActive = (href: string) => {
    if (href.startsWith('/ziele')) {
      return pathname.startsWith('/ziele');
    }
    return pathname === href;
  };

  const handleOpen = () => {
    lastOpenAtRef.current = Date.now();
    onOpen();
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return;
    if (Date.now() - lastOpenAtRef.current < 300) return;
    onClose();
  };

  return (
    <>
      {/* Bottom Navigation Bar - visible on mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-bottom-nav">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  'flex flex-col items-center justify-center flex-1 h-full px-2 py-1',
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1 font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
          {/* Menu Button */}
          <button
            onClick={handleOpen}
            className="flex flex-col items-center justify-center flex-1 h-full px-2 py-1 text-slate-500"
          >
            <Bars3Icon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Mehr</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={handleOverlayClick}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={classNames(
          'lg:hidden fixed inset-y-0 right-0 w-72 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <span className="text-lg font-bold text-white">Finanzapp</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {allNavItems.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={classNames(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] uppercase tracking-wide text-slate-300/80">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Drawer Footer */}
        <div className="border-t border-slate-800 px-3 py-4 safe-area-bottom">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Abmelden
          </button>
        </div>
      </div>
    </>
  );
}
