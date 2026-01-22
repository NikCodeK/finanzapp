'use client';

import { useState } from 'react';
import { usePlanning } from '@/hooks/usePlanning';
import { useSharedFinancialProfile } from '@/contexts/FinancialProfileContext';
import { PlannedPurchase, EventBudget, LifeScenario } from '@/lib/types';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PlannedPurchaseForm from '@/components/planning/PlannedPurchaseForm';
import EventBudgetForm from '@/components/planning/EventBudgetForm';
import ScenarioSimulator from '@/components/planning/ScenarioSimulator';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PlusIcon,
  ShoppingCartIcon,
  CalendarIcon,
  SparklesIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';

type TabType = 'purchases' | 'events' | 'scenarios';
type ModalType = 'purchase' | 'event' | 'scenario' | null;

export default function PlanningPage() {
  const {
    plannedPurchases,
    purchasesWithProjection,
    addPlannedPurchase,
    updatePlannedPurchase,
    deletePlannedPurchase,
    totalPlannedAmount,
    totalSavedAmount,
    monthlyContributionsNeeded,
    eventBudgets,
    activeEventBudgets,
    addEventBudget,
    updateEventBudget,
    deleteEventBudget,
    totalEventBudgetTarget,
    totalEventBudgetSaved,
    lifeScenarios,
    addLifeScenario,
    updateLifeScenario,
    deleteLifeScenario,
    isLoading,
  } = usePlanning();

  const { monthlyIncome, monthlyFixedCosts, monthlyVariableCosts } = useSharedFinancialProfile();

  const [activeTab, setActiveTab] = useState<TabType>('purchases');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingPurchase, setEditingPurchase] = useState<PlannedPurchase | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventBudget | null>(null);
  const [editingScenario, setEditingScenario] = useState<LifeScenario | null>(null);

  const handleSavePurchase = async (data: Omit<PlannedPurchase, 'id'>) => {
    if (editingPurchase) {
      await updatePlannedPurchase({ ...data, id: editingPurchase.id });
    } else {
      await addPlannedPurchase(data);
    }
    closeModal();
  };

  const handleSaveEvent = async (data: Omit<EventBudget, 'id'>) => {
    if (editingEvent) {
      await updateEventBudget({ ...data, id: editingEvent.id });
    } else {
      await addEventBudget(data);
    }
    closeModal();
  };

  const handleSaveScenario = async (data: Omit<LifeScenario, 'id'>) => {
    if (editingScenario) {
      await updateLifeScenario({ ...data, id: editingScenario.id });
    } else {
      await addLifeScenario(data);
    }
    closeModal();
  };

  const closeModal = () => {
    setModalType(null);
    setEditingPurchase(null);
    setEditingEvent(null);
    setEditingScenario(null);
  };

  const currentExpenses = monthlyFixedCosts + monthlyVariableCosts;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planung</h1>
          <p className="text-slate-500 mt-1">Anschaffungen, Events und Szenarien planen</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'purchases'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingCartIcon className="h-4 w-4 inline mr-2" />
          Anschaffungen
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarIcon className="h-4 w-4 inline mr-2" />
          Event-Budgets
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'scenarios'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <SparklesIcon className="h-4 w-4 inline mr-2" />
          Szenarien
        </button>
      </div>

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-slate-500">Gesamtziel</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPlannedAmount)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Bereits gespart</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavedAmount)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Monatl. Sparrate</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(monthlyContributionsNeeded)}</p>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Geplante Anschaffungen"
              action={
                <Button onClick={() => setModalType('purchase')}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Neue Anschaffung
                </Button>
              }
            />

            {purchasesWithProjection.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                Keine Anschaffungen geplant. Füge deine erste Anschaffung hinzu!
              </p>
            ) : (
              <div className="space-y-4">
                {purchasesWithProjection.map((purchase) => (
                  <div key={purchase.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{purchase.name}</h3>
                          {purchase.status === 'erreicht' && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          )}
                          {purchase.status === 'pausiert' && (
                            <PauseCircleIcon className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                        {purchase.category && (
                          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded mt-1 inline-block">
                            {purchase.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(purchase.targetAmount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(purchase.monthlyContribution)}/Monat
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">
                          {formatCurrency(purchase.currentAmount)} gespart
                        </span>
                        <span className="text-slate-500">{purchase.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            purchase.status === 'erreicht'
                              ? 'bg-green-500'
                              : purchase.isOnTrack === false
                              ? 'bg-orange-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(purchase.progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Projection Info */}
                    <div className="flex justify-between text-xs text-slate-500">
                      {purchase.monthsToGoal && (
                        <span>
                          {purchase.isOnTrack === false ? (
                            <span className="text-orange-600">Noch {purchase.monthsToGoal} Monate (verzögert)</span>
                          ) : (
                            <span>Noch ca. {purchase.monthsToGoal} Monate</span>
                          )}
                        </span>
                      )}
                      {purchase.targetDateISO && (
                        <span>Ziel: {formatDate(purchase.targetDateISO)}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPurchase(purchase);
                          setModalType('purchase');
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`"${purchase.name}" wirklich löschen?`)) {
                            deletePlannedPurchase(purchase.id);
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

      {/* Events Tab */}
      {activeTab === 'events' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-sm text-slate-500">Event-Budgets gesamt</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalEventBudgetTarget)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Bereits gespart</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEventBudgetSaved)}</p>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Event-Budgets"
              action={
                <Button onClick={() => setModalType('event')}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Neues Event
                </Button>
              }
            />

            {eventBudgets.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                Keine Event-Budgets vorhanden. Plane dein erstes Event!
              </p>
            ) : (
              <div className="space-y-4">
                {eventBudgets.map((event) => {
                  const progress = event.targetAmount > 0
                    ? (event.currentAmount / event.targetAmount) * 100
                    : 0;
                  return (
                    <div key={event.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900">{event.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {event.category && (
                              <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
                                {event.category}
                              </span>
                            )}
                            {event.eventDateISO && (
                              <span className="text-xs text-slate-500">
                                {formatDate(event.eventDateISO)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(event.targetAmount)}
                        </p>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{formatCurrency(event.currentAmount)}</span>
                          <span className="text-slate-500">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              event.status === 'abgeschlossen' ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEvent(event);
                            setModalType('event');
                          }}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`"${event.name}" wirklich löschen?`)) {
                              deleteEventBudget(event.id);
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
        </>
      )}

      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <Card>
          <CardHeader
            title="Lebens-Szenarien"
            subtitle="Was-wäre-wenn Simulationen"
            action={
              <Button onClick={() => setModalType('scenario')}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Neues Szenario
              </Button>
            }
          />

          {lifeScenarios.length === 0 ? (
            <p className="text-center py-8 text-slate-500">
              Keine Szenarien erstellt. Simuliere verschiedene Lebenssituationen!
            </p>
          ) : (
            <div className="space-y-4">
              {lifeScenarios.map((scenario) => {
                const totalExpenseChange = scenario.expenseChanges.reduce(
                  (sum, change) => sum + change.changeAmount,
                  0
                );
                const netChange = scenario.incomeChange - totalExpenseChange;

                return (
                  <div key={scenario.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-slate-900">{scenario.name}</h3>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mt-1 inline-block">
                          {scenario.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}/M
                        </p>
                        {scenario.oneTimeCosts > 0 && (
                          <p className="text-xs text-slate-500">
                            Einmalig: {formatCurrency(scenario.oneTimeCosts)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-slate-500">Einkommensänderung:</span>
                        <span className={`ml-2 font-medium ${scenario.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.incomeChange >= 0 ? '+' : ''}{formatCurrency(scenario.incomeChange)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Ausgabenänderung:</span>
                        <span className={`ml-2 font-medium ${totalExpenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {totalExpenseChange >= 0 ? '+' : ''}{formatCurrency(totalExpenseChange)}
                        </span>
                      </div>
                    </div>

                    {scenario.note && (
                      <p className="mt-2 text-sm text-slate-500 italic">{scenario.note}</p>
                    )}

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingScenario(scenario);
                          setModalType('scenario');
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`"${scenario.name}" wirklich löschen?`)) {
                            deleteLifeScenario(scenario.id);
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
        isOpen={modalType === 'purchase'}
        onClose={closeModal}
        title={editingPurchase ? 'Anschaffung bearbeiten' : 'Neue Anschaffung'}
      >
        <PlannedPurchaseForm
          onSave={handleSavePurchase}
          onCancel={closeModal}
          initialData={editingPurchase}
        />
      </Modal>

      <Modal
        isOpen={modalType === 'event'}
        onClose={closeModal}
        title={editingEvent ? 'Event bearbeiten' : 'Neues Event-Budget'}
      >
        <EventBudgetForm
          onSave={handleSaveEvent}
          onCancel={closeModal}
          initialData={editingEvent}
        />
      </Modal>

      <Modal
        isOpen={modalType === 'scenario'}
        onClose={closeModal}
        title={editingScenario ? 'Szenario bearbeiten' : 'Neues Szenario'}
      >
        <ScenarioSimulator
          onSave={handleSaveScenario}
          onCancel={closeModal}
          initialData={editingScenario}
          currentIncome={monthlyIncome}
          currentExpenses={currentExpenses}
        />
      </Modal>
    </div>
  );
}
