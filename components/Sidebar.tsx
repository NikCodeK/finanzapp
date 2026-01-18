'use client';

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
} from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';

const currentYear = new Date().getFullYear();

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transaktionen', href: '/transactions', icon: BanknotesIcon },
  { name: 'Meine Finanzen', href: '/finanzen', icon: WalletIcon },
  { name: `Ziele ${currentYear}`, href: `/ziele/${currentYear}`, icon: FlagIcon },
  { name: 'Wochenberichte', href: '/weekly', icon: CalendarDaysIcon },
  { name: 'Monatsübersicht', href: '/monthly', icon: ChartBarIcon },
  { name: 'Prognose', href: '/projection', icon: ArrowTrendingUpIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-60 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold text-white">Finanzapp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          // Handle dynamic routes for ziele
          const isActive = item.href.startsWith('/ziele')
            ? pathname.startsWith('/ziele')
            : pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-6 py-4">
        <p className="text-xs text-slate-500">
          Personal Finance Tracker
        </p>
      </div>
    </div>
  );
}
