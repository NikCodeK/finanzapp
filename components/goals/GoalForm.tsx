'use client';

import { useState, useEffect } from 'react';
import { Goal, GoalType, GoalStatus, GOAL_TYPES, Debt } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { toDateISO } from '@/lib/utils';

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

  const isIncomeGoal = type === 'einkommen';

  // Auto-fill startAmount with current income when creating new income goal
  useEffect(() => {
    if (isIncomeGoal && !initialData && monthlyIncome > 0) {
      setStartAmount(monthlyIncome.toString());
      setCurrentAmount(monthlyIncome.toString());
    }
  }, [isIncomeGoal, initialData, monthlyIncome]);

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
              label="Ziel-Einkommen"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
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
