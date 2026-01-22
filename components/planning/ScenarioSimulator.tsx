'use client';

import { useState } from 'react';
import { LifeScenario, SCENARIO_TYPES, ScenarioType, ExpenseChange, EXPENSE_CATEGORIES } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ScenarioSimulatorProps {
  onSave: (scenario: Omit<LifeScenario, 'id'>) => void;
  onCancel: () => void;
  initialData?: LifeScenario | null;
  currentIncome?: number;
  currentExpenses?: number;
}

export default function ScenarioSimulator({
  onSave,
  onCancel,
  initialData,
  currentIncome = 0,
  currentExpenses = 0,
}: ScenarioSimulatorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<ScenarioType>(initialData?.type || 'gehaltsaenderung');
  const [incomeChange, setIncomeChange] = useState(initialData?.incomeChange.toString() || '0');
  const [expenseChanges, setExpenseChanges] = useState<ExpenseChange[]>(
    initialData?.expenseChanges || []
  );
  const [oneTimeCosts, setOneTimeCosts] = useState(initialData?.oneTimeCosts.toString() || '0');
  const [startDateISO, setStartDateISO] = useState(initialData?.startDateISO || '');
  const [durationMonths, setDurationMonths] = useState(initialData?.durationMonths?.toString() || '');
  const [note, setNote] = useState(initialData?.note || '');

  // Calculate projected values
  const projectedIncome = currentIncome + (parseFloat(incomeChange) || 0);
  const totalExpenseChange = expenseChanges.reduce((sum, change) => {
    if (change.changeType === 'absolut') {
      return sum + change.changeAmount;
    } else {
      return sum + (currentExpenses * change.changeAmount / 100);
    }
  }, 0);
  const projectedExpenses = currentExpenses + totalExpenseChange;
  const projectedNet = projectedIncome - projectedExpenses;
  const currentNet = currentIncome - currentExpenses;
  const netChange = projectedNet - currentNet;

  const addExpenseChange = () => {
    setExpenseChanges([
      ...expenseChanges,
      { category: EXPENSE_CATEGORIES[0], changeAmount: 0, changeType: 'absolut' },
    ]);
  };

  const updateExpenseChange = (index: number, field: keyof ExpenseChange, value: string | number) => {
    const updated = [...expenseChanges];
    if (field === 'changeAmount') {
      updated[index].changeAmount = parseFloat(value as string) || 0;
    } else if (field === 'changeType') {
      updated[index].changeType = value as 'absolut' | 'prozent';
    } else {
      updated[index].category = value as string;
    }
    setExpenseChanges(updated);
  };

  const removeExpenseChange = (index: number) => {
    setExpenseChanges(expenseChanges.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      type,
      incomeChange: parseFloat(incomeChange) || 0,
      expenseChanges,
      oneTimeCosts: parseFloat(oneTimeCosts) || 0,
      startDateISO: startDateISO || undefined,
      durationMonths: durationMonths ? parseInt(durationMonths) : undefined,
      note: note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Szenario-Name"
        placeholder="z.B. Gehaltserhöhung, Umzug nach München"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Select
        label="Typ"
        value={type}
        onChange={(e) => setType(e.target.value as ScenarioType)}
        options={SCENARIO_TYPES.map((t) => ({ value: t.value, label: t.label }))}
      />

      <div className="p-4 bg-slate-50 rounded-lg space-y-4">
        <h4 className="font-medium text-slate-900">Einkommensänderung</h4>
        <Input
          label="Änderung (monatlich)"
          type="number"
          step="0.01"
          placeholder="z.B. 500 für Erhöhung, -200 für Reduzierung"
          value={incomeChange}
          onChange={(e) => setIncomeChange(e.target.value)}
        />
        <p className="text-sm text-slate-500">
          Aktuell: {currentIncome.toFixed(2)}€ → Neu: {projectedIncome.toFixed(2)}€
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-slate-900">Ausgabenänderungen</h4>
          <Button type="button" variant="ghost" size="sm" onClick={addExpenseChange}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Hinzufügen
          </Button>
        </div>

        {expenseChanges.map((change, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Select
                label="Kategorie"
                value={change.category}
                onChange={(e) => updateExpenseChange(index, 'category', e.target.value)}
                options={EXPENSE_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
              />
            </div>
            <div className="w-24">
              <Input
                label="Änderung"
                type="number"
                step="0.01"
                value={change.changeAmount.toString()}
                onChange={(e) => updateExpenseChange(index, 'changeAmount', e.target.value)}
              />
            </div>
            <div className="w-28">
              <Select
                label="Typ"
                value={change.changeType}
                onChange={(e) => updateExpenseChange(index, 'changeType', e.target.value)}
                options={[
                  { value: 'absolut', label: '€' },
                  { value: 'prozent', label: '%' },
                ]}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeExpenseChange(index)}
              className="text-red-500 mb-1"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {expenseChanges.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-2">
            Keine Ausgabenänderungen hinzugefügt
          </p>
        )}
      </div>

      <Input
        label="Einmalige Kosten"
        type="number"
        step="0.01"
        min="0"
        placeholder="z.B. Umzugskosten"
        value={oneTimeCosts}
        onChange={(e) => setOneTimeCosts(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Startdatum"
          type="date"
          value={startDateISO}
          onChange={(e) => setStartDateISO(e.target.value)}
        />

        <Input
          label="Dauer (Monate)"
          type="number"
          min="0"
          placeholder="Unbegrenzt"
          value={durationMonths}
          onChange={(e) => setDurationMonths(e.target.value)}
        />
      </div>

      {/* Projection Summary */}
      <div className="p-4 bg-indigo-50 rounded-lg">
        <h4 className="font-medium text-indigo-900 mb-3">Auswirkung</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-indigo-600">Neues Netto</p>
            <p className="text-xl font-bold text-indigo-900">{projectedNet.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-indigo-600">Änderung</p>
            <p className={`text-xl font-bold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netChange >= 0 ? '+' : ''}{netChange.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      <Input
        label="Notiz (optional)"
        placeholder="Zusätzliche Informationen"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Speichern' : 'Szenario erstellen'}
        </Button>
      </div>
    </form>
  );
}
