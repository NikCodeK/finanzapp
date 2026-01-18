'use client';

import { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartPieIcon,
  BuildingLibraryIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FinancialHealthScore from '@/components/finanzen/FinancialHealthScore';
import FinancialSummaryCard from '@/components/finanzen/FinancialSummaryCard';
import IncomeSourceForm from '@/components/finanzen/IncomeSourceForm';
import FixedCostForm from '@/components/finanzen/FixedCostForm';
import VariableCostForm from '@/components/finanzen/VariableCostForm';
import DebtForm from '@/components/finanzen/DebtForm';
import AssetsForm from '@/components/finanzen/AssetsForm';
import { IncomeSource, FixedCost, VariableCostEstimate, Debt, Assets } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type TabType = 'uebersicht' | 'einnahmen' | 'fixkosten' | 'variable' | 'schulden' | 'vermoegen';

export default function FinanzenPage() {
  const [activeTab, setActiveTab] = useState<TabType>('uebersicht');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeSource | FixedCost | VariableCostEstimate | Debt | null>(null);
  const [editingAssets, setEditingAssets] = useState(false);

  const {
    incomeSources,
    fixedCosts,
    variableCosts,
    debts,
    assets,
    isLoading,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    addFixedCost,
    updateFixedCost,
    deleteFixedCost,
    addVariableCost,
    updateVariableCost,
    deleteVariableCost,
    addDebt,
    updateDebt,
    deleteDebt,
    updateAssets,
    monthlyIncome,
    monthlyIncomeWithoutBonus,
    monthlyBonusIncome,
    quarterlyBonusOverview,
    monthlyFixedCosts,
    monthlyVariableCosts,
    totalDebt,
    monthlyDebtPayments,
    totalAssets,
    netWorth,
    availableIncome,
    debtToIncomeRatio,
    savingsRate,
    healthScore,
  } = useFinancialProfile();

  const tabs = [
    { id: 'uebersicht' as TabType, label: 'Übersicht', icon: ChartPieIcon },
    { id: 'einnahmen' as TabType, label: 'Einnahmen', icon: BanknotesIcon },
    { id: 'fixkosten' as TabType, label: 'Fixkosten', icon: CreditCardIcon },
    { id: 'variable' as TabType, label: 'Variable', icon: WalletIcon },
    { id: 'schulden' as TabType, label: 'Schulden', icon: BuildingLibraryIcon },
    { id: 'vermoegen' as TabType, label: 'Vermögen', icon: WalletIcon },
  ];

  const handleAddClick = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEditClick = (item: IncomeSource | FixedCost | VariableCostEstimate | Debt) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setEditingAssets(false);
  };

  const renderModalContent = () => {
    switch (activeTab) {
      case 'einnahmen':
        return (
          <IncomeSourceForm
            onSave={(source) => {
              if (editingItem) {
                updateIncomeSource({ ...source, id: editingItem.id });
              } else {
                addIncomeSource(source);
              }
              handleCloseModal();
            }}
            onCancel={handleCloseModal}
            initialData={editingItem as IncomeSource | null}
          />
        );
      case 'fixkosten':
        return (
          <FixedCostForm
            onSave={(cost) => {
              if (editingItem) {
                updateFixedCost({ ...cost, id: editingItem.id });
              } else {
                addFixedCost(cost);
              }
              handleCloseModal();
            }}
            onCancel={handleCloseModal}
            initialData={editingItem as FixedCost | null}
          />
        );
      case 'variable':
        return (
          <VariableCostForm
            onSave={(cost) => {
              if (editingItem) {
                updateVariableCost({ ...cost, id: editingItem.id });
              } else {
                addVariableCost(cost);
              }
              handleCloseModal();
            }}
            onCancel={handleCloseModal}
            initialData={editingItem as VariableCostEstimate | null}
          />
        );
      case 'schulden':
        return (
          <DebtForm
            onSave={(debt) => {
              if (editingItem) {
                updateDebt({ ...debt, id: editingItem.id });
              } else {
                addDebt(debt);
              }
              handleCloseModal();
            }}
            onCancel={handleCloseModal}
            initialData={editingItem as Debt | null}
          />
        );
      case 'vermoegen':
        return (
          <AssetsForm
            onSave={(newAssets) => {
              updateAssets(newAssets);
              handleCloseModal();
            }}
            onCancel={handleCloseModal}
            initialData={assets}
          />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const isEditing = editingItem !== null || editingAssets;
    switch (activeTab) {
      case 'einnahmen':
        return isEditing ? 'Einnahme bearbeiten' : 'Neue Einnahme';
      case 'fixkosten':
        return isEditing ? 'Fixkosten bearbeiten' : 'Neue Fixkosten';
      case 'variable':
        return isEditing ? 'Variable Kosten bearbeiten' : 'Neue Variable Kosten';
      case 'schulden':
        return isEditing ? 'Schulden bearbeiten' : 'Neue Schulden';
      case 'vermoegen':
        return 'Vermögen bearbeiten';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meine Finanzen</h1>
          <p className="text-slate-500 mt-1">Verwalte deine Einnahmen, Ausgaben und Vermögenswerte</p>
        </div>
        <div className="flex items-center gap-4">
          <FinancialHealthScore score={healthScore} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'uebersicht' && (
          <Card>
            <CardHeader title="Finanzübersicht" subtitle="Zusammenfassung deiner finanziellen Situation" />
            <FinancialSummaryCard
              monthlyIncome={monthlyIncome}
              monthlyIncomeWithoutBonus={monthlyIncomeWithoutBonus}
              monthlyBonusIncome={monthlyBonusIncome}
              quarterlyBonusOverview={quarterlyBonusOverview}
              monthlyFixedCosts={monthlyFixedCosts}
              monthlyVariableCosts={monthlyVariableCosts}
              monthlyDebtPayments={monthlyDebtPayments}
              totalDebt={totalDebt}
              totalAssets={totalAssets}
              netWorth={netWorth}
              availableIncome={availableIncome}
              debtToIncomeRatio={debtToIncomeRatio}
              savingsRate={savingsRate}
            />
          </Card>
        )}

        {activeTab === 'einnahmen' && (
          <Card>
            <CardHeader
              title="Einnahmequellen"
              subtitle={`${incomeSources.length} Einnahmequellen`}
              action={
                <Button size="sm" onClick={handleAddClick}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Hinzufügen
                </Button>
              }
            />
            {incomeSources.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Keine Einnahmequellen vorhanden. Füge deine erste Einnahme hinzu.
              </p>
            ) : (
              <div className="space-y-3">
                {incomeSources.map((source) => (
                  <div
                    key={source.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      source.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{source.name}</p>
                        {!source.isActive && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            Inaktiv
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {source.frequency === 'jaehrlich'
                          ? 'Jährlich'
                          : source.frequency === 'quartalsbonus'
                          ? `Quartalsbonus (${source.confirmedQuarters ? Object.values(source.confirmedQuarters).filter(Boolean).length : 0}/4 bestätigt)`
                          : 'Monatlich'}
                        {source.note && ` - ${source.note}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold text-emerald-600">
                        {formatCurrency(source.amount)}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(source)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteIncomeSource(source.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'fixkosten' && (
          <Card>
            <CardHeader
              title="Fixkosten"
              subtitle={`${fixedCosts.length} Fixkosten - ${formatCurrency(monthlyFixedCosts)}/Monat`}
              action={
                <Button size="sm" onClick={handleAddClick}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Hinzufügen
                </Button>
              }
            />
            {fixedCosts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Keine Fixkosten vorhanden. Füge deine erste Fixkosten hinzu.
              </p>
            ) : (
              <div className="space-y-3">
                {fixedCosts.map((cost) => (
                  <div
                    key={cost.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      cost.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{cost.name}</p>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {cost.category}
                        </span>
                        {!cost.isActive && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            Inaktiv
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {cost.frequency === 'jaehrlich'
                          ? 'Jährlich'
                          : cost.frequency === 'vierteljaehrlich'
                          ? 'Vierteljährlich'
                          : 'Monatlich'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(cost.amount)}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(cost)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFixedCost(cost.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'variable' && (
          <Card>
            <CardHeader
              title="Variable Kosten (Schätzungen)"
              subtitle={`${variableCosts.length} Kategorien - ${formatCurrency(monthlyVariableCosts)}/Monat`}
              action={
                <Button size="sm" onClick={handleAddClick}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Hinzufügen
                </Button>
              }
            />
            {variableCosts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Keine variablen Kosten vorhanden. Füge eine Schätzung hinzu.
              </p>
            ) : (
              <div className="space-y-3">
                {variableCosts.map((cost) => (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-white border-slate-200"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{cost.category}</p>
                      {cost.note && <p className="text-sm text-slate-500">{cost.note}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold text-orange-600">
                        ~{formatCurrency(cost.estimatedMonthly)}/Mo
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(cost)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteVariableCost(cost.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'schulden' && (
          <Card>
            <CardHeader
              title="Schulden & Kredite"
              subtitle={`${debts.length} Schulden - ${formatCurrency(totalDebt)} gesamt`}
              action={
                <Button size="sm" onClick={handleAddClick}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Hinzufügen
                </Button>
              }
            />
            {debts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Keine Schulden vorhanden.
              </p>
            ) : (
              <div className="space-y-3">
                {debts.map((debt) => {
                  const paidOff = debt.originalAmount - debt.currentBalance;
                  const progress = debt.originalAmount > 0 ? paidOff / debt.originalAmount : 0;
                  return (
                    <div
                      key={debt.id}
                      className="p-4 rounded-lg border bg-white border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{debt.name}</p>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">
                              {debt.type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {debt.interestRate}% Zinsen - {formatCurrency(debt.monthlyPayment)}/Monat
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditClick(debt)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteDebt(debt.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Restbetrag</span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(debt.currentBalance)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{formatCurrency(paidOff)} abbezahlt</span>
                          <span>{Math.round(progress * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'vermoegen' && (
          <Card>
            <CardHeader
              title="Vermögenswerte"
              subtitle={`Gesamt: ${formatCurrency(totalAssets)}`}
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingAssets(true);
                    setModalOpen(true);
                  }}
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-600 font-medium">Ersparnisse</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {formatCurrency(assets.savings)}
                </p>
                <p className="text-xs text-emerald-500 mt-1">Girokonto, Sparkonto</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Investments</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {formatCurrency(assets.investments)}
                </p>
                <p className="text-xs text-blue-500 mt-1">Aktien, ETFs, Fonds</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Sonstiges</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {formatCurrency(assets.other)}
                </p>
                <p className="text-xs text-purple-500 mt-1">Immobilien, Sachwerte</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">Nettovermögen</p>
                  <p className="text-xs text-slate-400">Vermögen - Schulden</p>
                </div>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={getModalTitle()}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}
