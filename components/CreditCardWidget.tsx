'use client';

import { useState } from 'react';
import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CreditCardBalanceForm from '@/components/finanzen/CreditCardBalanceForm';
import { CreditCard, CreditCardBalance } from '@/lib/types';
import { formatCurrency, classNames } from '@/lib/utils';
import Link from 'next/link';

interface CreditCardWidgetProps {
  creditCards: CreditCard[];
  totalCreditCardDebt: number;
  totalCreditLimit: number;
  averageUtilization: number;
  onAddBalance: (balance: Omit<CreditCardBalance, 'id'>) => Promise<CreditCardBalance | null>;
}

export default function CreditCardWidget({
  creditCards,
  totalCreditCardDebt,
  totalCreditLimit,
  averageUtilization,
  onAddBalance,
}: CreditCardWidgetProps) {
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>();

  const activeCards = creditCards.filter((c) => c.isActive);

  const handleAddBalanceClick = (cardId?: string) => {
    setSelectedCardId(cardId);
    setBalanceModalOpen(true);
  };

  const handleSaveBalance = async (balance: Omit<CreditCardBalance, 'id'>) => {
    await onAddBalance(balance);
    setBalanceModalOpen(false);
    setSelectedCardId(undefined);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600';
    if (utilization >= 50) return 'text-orange-500';
    return 'text-green-600';
  };

  const getUtilizationBg = (utilization: number) => {
    if (utilization >= 80) return 'bg-red-500';
    if (utilization >= 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Kreditkarten"
          subtitle={activeCards.length > 0 ? `${activeCards.length} aktive Karte${activeCards.length !== 1 ? 'n' : ''}` : 'Keine Karten'}
          action={
            <div className="flex gap-2">
              {activeCards.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddBalanceClick()}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Stand
                </Button>
              )}
              <Link href="/finanzen?tab=kreditkarten">
                <Button variant="ghost" size="sm">
                  {activeCards.length > 0 ? 'Verwalten' : 'Hinzufügen'}
                </Button>
              </Link>
            </div>
          }
        />

        {activeCards.length === 0 ? (
          <div className="text-center py-6">
            <CreditCardIcon className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 mb-3">Keine Kreditkarten vorhanden</p>
            <Link href="/finanzen?tab=kreditkarten">
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Kreditkarte hinzufügen
              </Button>
            </Link>
          </div>
        ) : (
          <>
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Gesamtstand</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(totalCreditCardDebt)}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Auslastung</p>
            <p className={classNames('text-xl font-bold', getUtilizationColor(averageUtilization))}>
              {averageUtilization.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Individual Cards */}
        <div className="space-y-3">
          {activeCards.slice(0, 3).map((card) => {
            const utilization = card.creditLimit > 0
              ? (card.currentBalance / card.creditLimit) * 100
              : 0;
            return (
              <div
                key={card.id}
                className="p-3 bg-white border border-slate-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">{card.name}</p>
                      {card.bank && (
                        <p className="text-xs text-slate-500">{card.bank}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddBalanceClick(card.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    title="Stand aktualisieren"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Stand</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(card.currentBalance)} / {formatCurrency(card.creditLimit)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={classNames(
                        'h-1.5 rounded-full transition-all',
                        getUtilizationBg(utilization)
                      )}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                  <p className={classNames('text-xs', getUtilizationColor(utilization))}>
                    {utilization.toFixed(1)}% genutzt
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {activeCards.length > 3 && (
          <p className="text-sm text-slate-500 mt-3 text-center">
            +{activeCards.length - 3} weitere Karte{activeCards.length - 3 !== 1 ? 'n' : ''}
          </p>
        )}
          </>
        )}
      </Card>

      {/* Balance Modal */}
      <Modal
        isOpen={balanceModalOpen}
        onClose={() => {
          setBalanceModalOpen(false);
          setSelectedCardId(undefined);
        }}
        title="Stand aktualisieren"
      >
        <CreditCardBalanceForm
          creditCards={activeCards}
          onSave={handleSaveBalance}
          onCancel={() => {
            setBalanceModalOpen(false);
            setSelectedCardId(undefined);
          }}
          preselectedCardId={selectedCardId}
        />
      </Modal>
    </>
  );
}
