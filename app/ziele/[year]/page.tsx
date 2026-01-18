'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useGoals } from '@/hooks/useGoals';
import { useDebts } from '@/hooks/useDebts';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';
import GoalsSummary from '@/components/goals/GoalsSummary';
import { Goal, GoalType, GOAL_TYPES } from '@/lib/types';

export default function ZielePage() {
  const params = useParams();
  const router = useRouter();
  const year = parseInt(params.year as string) || new Date().getFullYear();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterType, setFilterType] = useState<GoalType | 'alle'>('alle');

  const {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    getGoalProgress,
  } = useGoals(year);

  const { debts } = useDebts();
  const { monthlyIncome } = useFinancialProfile();

  const filteredGoals = filterType === 'alle'
    ? goals
    : goals.filter((g) => g.type === filterType);

  const handleYearChange = (newYear: number) => {
    router.push(`/ziele/${newYear}`);
  };

  const handleAddClick = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGoal(null);
  };

  const handleSave = (goalData: Omit<Goal, 'id' | 'createdAtISO'>) => {
    if (editingGoal) {
      updateGoal({
        ...goalData,
        id: editingGoal.id,
        createdAtISO: editingGoal.createdAtISO,
      });
    } else {
      addGoal(goalData);
    }
    handleCloseModal();
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
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Ziele {year}</h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleYearChange(year - 1)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleYearChange(year + 1)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-slate-500 mt-1">Verfolge deine finanziellen Ziele für {year}</p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusIcon className="h-5 w-5 mr-1" />
          Neues Ziel
        </Button>
      </div>

      {/* Summary */}
      <GoalsSummary goals={goals} getGoalProgress={getGoalProgress} monthlyIncome={monthlyIncome} />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('alle')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filterType === 'alle'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle ({goals.length})
        </button>
        {GOAL_TYPES.map((type) => {
          const count = goals.filter((g) => g.type === type.value).length;
          if (count === 0) return null;
          return (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                filterType === type.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">
              {goals.length === 0
                ? `Keine Ziele für ${year} vorhanden.`
                : 'Keine Ziele mit diesem Filter gefunden.'}
            </p>
            {goals.length === 0 && (
              <Button onClick={handleAddClick}>
                <PlusIcon className="h-5 w-5 mr-1" />
                Erstes Ziel erstellen
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditClick}
              onDelete={deleteGoal}
              onUpdateProgress={updateGoalProgress}
              currentIncome={monthlyIncome}
            />
          ))}
        </div>
      )}

      {/* Year Quick Navigation */}
      <Card padding="sm">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-slate-500">Schnellnavigation:</span>
          {[year - 1, year, year + 1].map((y) => (
            <button
              key={y}
              onClick={() => handleYearChange(y)}
              className={`px-3 py-1 text-sm rounded ${
                y === year
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingGoal ? 'Ziel bearbeiten' : 'Neues Ziel'}
      >
        <GoalForm
          onSave={handleSave}
          onCancel={handleCloseModal}
          initialData={editingGoal}
          year={year}
          debts={debts}
          monthlyIncome={monthlyIncome}
        />
      </Modal>
    </div>
  );
}
