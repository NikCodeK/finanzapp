'use client';

import { useState, useEffect } from 'react';
import { Goal, GoalType, GoalStatus, GOAL_TYPES, Debt, IncomeMilestone } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { toDateISO, formatCurrency } from '@/lib/utils';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface GoalFormProps {
  onSave: (goal: Omit<Goal, 'id' | 'createdAtISO'>) => void;
  onCancel: () => void;
  initialData?: Goal | null;
  year: number;
  debts?: Debt[];
  monthlyIncome?: number;
}

export default function GoalForm({
  onSave,
  onCancel,
  initialData,
  year,
  debts = [],
  monthlyIncome = 0,
}: GoalFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<GoalType>(initialData?.type || 'sparen');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount.toString() || '');
  const [startAmount, setStartAmount] = useState(initialData?.startAmount.toString() || '');
  const [deadline, setDeadline] = useState(
    initialData?.deadlineISO || `${year}-12-31`
  );
  const [status, setStatus] = useState<GoalStatus>(initialData?.status || 'aktiv');
  const [priority, setPriority] = useState<1 | 2 | 3>(initialData?.priority || 2);
  const [linkedDebtId, setLinkedDebtId] = useState(initialData?.linkedDebtId || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [milestones, setMilestones] = useState<IncomeMilestone[]>(
    initialData?.milestones || []
  );

  const isIncomeGoal = type === 'einkommen';

  // Auto-fill startAmount with current income when creating new income goal
  useEffect(() => {
    if (isIncomeGoal && !initialData && monthlyIncome > 0) {
      setStartAmount(monthlyIncome.toString());
      setCurrentAmount(monthlyIncome.toString());
    }
  }, [isIncomeGoal, initialData, monthlyIncome]);

  // Milestone Management
  const addMilestone = () => {
    const startVal = parseFloat(startAmount) || 0;
    const targetVal = parseFloat(targetAmount) || 0;
    const lastMilestone = milestones.length > 0
      ? milestones[milestones.length - 1].targetAmount
      : startVal;

    // Suggest a value between last milestone and target
    const suggestedAmount = lastMilestone + (targetVal - lastMilestone) / 2;

    const newMilestone: IncomeMilestone = {
      id: `milestone-${Date.now()}`,
      targetAmount: Math.round(suggestedAmount / 100) * 100, // Round to nearest 100
      name: `Meilenstein ${milestones.length + 1}`,
    };
    setMilestones([...milestones, newMilestone].sort((a, b) => a.targetAmount - b.targetAmount));
  };

  const updateMilestone = (id: string, field: 'targetAmount' | 'name', value: string) => {
    setMilestones(milestones.map(m => {
      if (m.id !== id) return m;
      if (field === 'targetAmount') {
        return { ...m, targetAmount: parseFloat(value) || 0 };
      }
      return { ...m, name: value };
    }).sort((a, b) => a.targetAmount - b.targetAmount));
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      year,
      name,
      type,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      startAmount: parseFloat(startAmount) || 0,
      deadlineISO: deadline,
      status,
      priority,
      linkedDebtId: linkedDebtId || undefined,
      milestones: isIncomeGoal && milestones.length > 0 ? milestones : undefined,
      note: note || undefined,
    });
  };

  const typeOptions = GOAL_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  const statusOptions = [
    { value: 'aktiv', label: 'Aktiv' },
    { value: 'pausiert', label: 'Pausiert' },
    { value: 'erreicht', label: 'Erreicht' },
  ];

  const priorityOptions = [
    { value: '1', label: 'Hoch' },
    { value: '2', label: 'Mittel' },
    { value: '3', label: 'Niedrig' },
  ];

  const debtOptions = [
    { value: '', label: 'Keine Verknüpfung' },
    ...debts.map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Zielname"
        placeholder="z.B. Notgroschen aufbauen"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Zieltyp"
          value={type}
          onChange={(e) => setType(e.target.value as GoalType)}
          options={typeOptions}
        />

        <Select
          label="Priorität"
          value={priority.toString()}
          onChange={(e) => setPriority(parseInt(e.target.value) as 1 | 2 | 3)}
          options={priorityOptions}
        />
      </div>

      {isIncomeGoal ? (
        <>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            Dein aktuelles Einkommen wird automatisch aus "Meine Finanzen" übernommen.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start-Einkommen"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={startAmount}
              onChange={(e) => setStartAmount(e.target.value)}
              required
              disabled={!initialData}
            />

            <Input
              label="Ziel-Einkommen (Endziel)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          {/* Milestones */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-900">Meilensteine (optional)</h4>
                <p className="text-xs text-slate-500">Zwischenziele für deine Einkommenserhöhung</p>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <PlusIcon className="h-4 w-4" />
                Hinzufügen
              </button>
            </div>

            {milestones.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-2">
                Keine Meilensteine - Füge Zwischenziele hinzu
              </p>
            ) : (
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-400 w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={milestone.name || ''}
                      onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                      placeholder="Name (optional)"
                      className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={milestone.targetAmount}
                      onChange={(e) => updateMilestone(milestone.id, 'targetAmount', e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-xs text-slate-500">€</span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(milestone.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {milestones.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Start: {formatCurrency(parseFloat(startAmount) || 0)}</span>
                  <span>→ {milestones.map(m => formatCurrency(m.targetAmount)).join(' → ')}</span>
                  <span>→ Ziel: {formatCurrency(parseFloat(targetAmount) || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Startbetrag"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={startAmount}
            onChange={(e) => setStartAmount(e.target.value)}
            required
          />

          <Input
            label="Aktueller Betrag"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            required
          />

          <Input
            label="Zielbetrag"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as GoalStatus)}
          options={statusOptions}
        />
      </div>

      {type === 'schuldenabbau' && debts.length > 0 && (
        <Select
          label="Verknüpfte Schulden"
          value={linkedDebtId}
          onChange={(e) => setLinkedDebtId(e.target.value)}
          options={debtOptions}
        />
      )}

      <Input
        label="Notiz (optional)"
        placeholder="Zusätzliche Details zum Ziel"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Speichern' : 'Ziel erstellen'}
        </Button>
      </div>
    </form>
  );
}
