'use client';

import { useState } from 'react';
import { useInvestments } from '@/hooks/useInvestments';
import { Investment, SavingsPlan, INVESTMENT_TYPES } from '@/lib/types';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import InvestmentForm from '@/components/investments/InvestmentForm';
import SavingsPlanForm from '@/components/investments/SavingsPlanForm';
import PortfolioOverview from '@/components/investments/PortfolioOverview';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ClockIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';

type TabType = 'portfolio' | 'savingsPlans';
type ModalType = 'investment' | 'savingsPlan' | null;

export default function InvestmentsPage() {
  const {
    investments,
    investmentsWithPerformance,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    savingsPlans,
    addSavingsPlan,
    updateSavingsPlan,
    deleteSavingsPlan,
    monthlySavingsPlanAmount,
    activeSavingsPlans,
    portfolioMetrics,
    totalDividends,
    isLoading,
  } = useInvestments();

  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editingSavingsPlan, setEditingSavingsPlan] = useState<SavingsPlan | null>(null);

  const handleSaveInvestment = async (data: Omit<Investment, 'id'>) => {
    if (editingInvestment) {
      await updateInvestment({ ...data, id: editingInvestment.id });
    } else {
      await addInvestment(data);
    }
    closeModal();
  };

  const handleSaveSavingsPlan = async (data: Omit<SavingsPlan, 'id'>) => {
    if (editingSavingsPlan) {
      await updateSavingsPlan({ ...data, id: editingSavingsPlan.id });
    } else {
      await addSavingsPlan(data);
    }
    closeModal();
  };

  const closeModal = () => {
    setModalType(null);
    setEditingInvestment(null);
    setEditingSavingsPlan(null);
  };

  const getTypeLabel = (type: string) => {
    return INVESTMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Investments</h1>
          <p className="text-slate-500 mt-1">Portfolio-Übersicht und Sparpläne</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModalType('savingsPlan')} variant="secondary">
            <ClockIcon className="h-5 w-5 mr-2" />
            Neuer Sparplan
          </Button>
          <Button onClick={() => setModalType('investment')}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Neues Investment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BanknotesIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Portfolio-Wert</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(portfolioMetrics.totalValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${portfolioMetrics.totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {portfolioMetrics.totalGainLoss >= 0 ? (
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Gewinn/Verlust</p>
              <p className={`text-xl font-bold ${portfolioMetrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioMetrics.totalGainLoss >= 0 ? '+' : ''}
                {formatCurrency(portfolioMetrics.totalGainLoss)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Monatl. Sparpläne</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(monthlySavingsPlanAmount)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyEuroIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Dividenden</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalDividends)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'portfolio'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Portfolio ({portfolioMetrics.investmentCount})
        </button>
        <button
          onClick={() => setActiveTab('savingsPlans')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'savingsPlans'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Sparpläne ({activeSavingsPlans.length})
        </button>
      </div>

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <>
          {/* Portfolio Overview */}
          <Card>
            <CardHeader title="Portfolio-Übersicht" />
            <PortfolioOverview metrics={portfolioMetrics} />
          </Card>

          {/* Investment List */}
          <Card>
            <CardHeader title="Alle Investments" />
            {investmentsWithPerformance.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                Keine Investments vorhanden. Füge dein erstes Investment hinzu!
              </p>
            ) : (
              <div className="space-y-4">
                {investmentsWithPerformance.map((inv) => (
                  <div
                    key={inv.id}
                    className={`p-4 rounded-lg border ${
                      inv.isActive
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{inv.name}</h3>
                          {inv.symbol && (
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
                              {inv.symbol}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                          <span>{getTypeLabel(inv.type)}</span>
                          {inv.broker && <span>• {inv.broker}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(inv.value)}
                        </p>
                        <p
                          className={`text-sm ${
                            inv.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {inv.gainLoss >= 0 ? '+' : ''}
                          {formatCurrency(inv.gainLoss)} ({inv.gainLossPercent >= 0 ? '+' : ''}
                          {inv.gainLossPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-slate-100 text-sm">
                      <div>
                        <p className="text-slate-500">Anzahl</p>
                        <p className="font-medium">{inv.quantity}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Kaufpreis</p>
                        <p className="font-medium">{inv.purchasePrice.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Aktueller Preis</p>
                        <p className="font-medium">{inv.currentPrice.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Investiert</p>
                        <p className="font-medium">{formatCurrency(inv.cost)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingInvestment(inv);
                          setModalType('investment');
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`"${inv.name}" wirklich löschen?`)) {
                            deleteInvestment(inv.id);
                          }
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Löschen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Savings Plans Tab */}
      {activeTab === 'savingsPlans' && (
        <Card>
          <CardHeader
            title="Sparpläne"
            subtitle={`${formatCurrency(monthlySavingsPlanAmount)} monatlich`}
          />
          {savingsPlans.length === 0 ? (
            <p className="text-center py-8 text-slate-500">
              Keine Sparpläne vorhanden. Erstelle deinen ersten Sparplan!
            </p>
          ) : (
            <div className="space-y-4">
              {savingsPlans.map((plan) => {
                const linkedInvestment = investments.find(i => i.id === plan.investmentId);
                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border ${
                      plan.isActive
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-slate-900">{plan.name}</h3>
                        {linkedInvestment && (
                          <p className="text-sm text-slate-500">
                            Verknüpft mit: {linkedInvestment.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(plan.amount)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {plan.frequency === 'monatlich'
                            ? 'Monatlich'
                            : plan.frequency === 'vierteljaehrlich'
                            ? 'Vierteljährlich'
                            : plan.frequency === 'halbjaehrlich'
                            ? 'Halbjährlich'
                            : 'Jährlich'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <span>Ausführung: {plan.executionDay}. des Monats</span>
                      <span>Start: {formatDate(plan.startDateISO)}</span>
                      {plan.endDateISO && <span>Ende: {formatDate(plan.endDateISO)}</span>}
                    </div>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSavingsPlan(plan);
                          setModalType('savingsPlan');
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`"${plan.name}" wirklich löschen?`)) {
                            deleteSavingsPlan(plan.id);
                          }
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Löschen
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <Modal
        isOpen={modalType === 'investment'}
        onClose={closeModal}
        title={editingInvestment ? 'Investment bearbeiten' : 'Neues Investment'}
      >
        <InvestmentForm
          onSave={handleSaveInvestment}
          onCancel={closeModal}
          initialData={editingInvestment}
        />
      </Modal>

      <Modal
        isOpen={modalType === 'savingsPlan'}
        onClose={closeModal}
        title={editingSavingsPlan ? 'Sparplan bearbeiten' : 'Neuer Sparplan'}
      >
        <SavingsPlanForm
          onSave={handleSaveSavingsPlan}
          onCancel={closeModal}
          initialData={editingSavingsPlan}
          investments={investments}
        />
      </Modal>
    </div>
  );
}
