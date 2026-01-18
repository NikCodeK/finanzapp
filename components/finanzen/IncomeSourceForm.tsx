'use client';

import { useState } from 'react';
import { IncomeSource } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface IncomeSourceFormProps {
  onSave: (source: Omit<IncomeSource, 'id'>) => void;
  onCancel: () => void;
  initialData?: IncomeSource | null;
}

export default function IncomeSourceForm({
  onSave,
  onCancel,
  initialData,
}: IncomeSourceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [frequency, setFrequency] = useState<'monatlich' | 'jaehrlich'>(
    initialData?.frequency || 'monatlich'
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      amount: parseFloat(amount) || 0,
      frequency,
      isActive,
      note: note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="z.B. Gehalt, Nebenjob"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
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
          onChange={(e) => setFrequency(e.target.value as 'monatlich' | 'jaehrlich')}
          options={[
            { value: 'monatlich', label: 'Monatlich' },
            { value: 'jaehrlich', label: 'Jährlich' },
          ]}
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
