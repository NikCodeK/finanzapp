'use client';

import { useState } from 'react';
import { SavingsPlan, SavingsPlanFrequency, Investment } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';

interface SavingsPlanFormProps {
  onSave: (plan: Omit<SavingsPlan, 'id'>) => void;
  onCancel: () => void;
  initialData?: SavingsPlan | null;
  investments: Investment[];
}

export default function SavingsPlanForm({
  onSave,
  onCancel,
  initialData,
  investments,
}: SavingsPlanFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [investmentId, setInvestmentId] = useState(initialData?.investmentId || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [frequency, setFrequency] = useState<SavingsPlanFrequency>(
    initialData?.frequency || 'monatlich'
  );
  const [executionDay, setExecutionDay] = useState(
    initialData?.executionDay?.toString() || '1'
  );
  const [startDateISO, setStartDateISO] = useState(
    initialData?.startDateISO || format(new Date(), 'yyyy-MM-dd')
  );
  const [endDateISO, setEndDateISO] = useState(initialData?.endDateISO || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      investmentId: investmentId || undefined,
      amount: parseFloat(amount) || 0,
      frequency,
      executionDay: parseInt(executionDay) || 1,
      startDateISO,
      endDateISO: endDateISO || undefined,
      isActive,
      note: note || undefined,
    });
  };

  const investmentOptions = [
    { value: '', label: 'Kein Investment verknüpft' },
    ...investments.map((inv) => ({ value: inv.id, label: inv.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="z.B. MSCI World Sparplan"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Select
        label="Verknüpftes Investment"
        value={investmentId}
        onChange={(e) => setInvestmentId(e.target.value)}
        options={investmentOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Betrag"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Select
          label="Häufigkeit"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as SavingsPlanFrequency)}
          options={[
            { value: 'monatlich', label: 'Monatlich' },
            { value: 'vierteljaehrlich', label: 'Vierteljährlich' },
            { value: 'halbjaehrlich', label: 'Halbjährlich' },
            { value: 'jaehrlich', label: 'Jährlich' },
          ]}
        />
      </div>

      <Input
        label="Ausführungstag"
        type="number"
        min="1"
        max="28"
        placeholder="1"
        value={executionDay}
        onChange={(e) => setExecutionDay(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Startdatum"
          type="date"
          value={startDateISO}
          onChange={(e) => setStartDateISO(e.target.value)}
          required
        />

        <Input
          label="Enddatum (optional)"
          type="date"
          value={endDateISO}
          onChange={(e) => setEndDateISO(e.target.value)}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
          Aktiv
        </label>
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
          {initialData ? 'Speichern' : 'Hinzufügen'}
        </Button>
      </div>
    </form>
  );
}
