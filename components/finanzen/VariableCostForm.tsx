'use client';

import { useState } from 'react';
import { VariableCostEstimate, EXPENSE_CATEGORIES } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface VariableCostFormProps {
  onSave: (cost: Omit<VariableCostEstimate, 'id'>) => void;
  onCancel: () => void;
  initialData?: VariableCostEstimate | null;
}

export default function VariableCostForm({
  onSave,
  onCancel,
  initialData,
}: VariableCostFormProps) {
  const [category, setCategory] = useState(initialData?.category || EXPENSE_CATEGORIES[0]);
  const [estimatedMonthly, setEstimatedMonthly] = useState(
    initialData?.estimatedMonthly.toString() || ''
  );
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      category,
      estimatedMonthly: parseFloat(estimatedMonthly) || 0,
      note: note || undefined,
    });
  };

  const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Kategorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categoryOptions}
      />

      <Input
        label="Geschätzte monatliche Ausgaben"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={estimatedMonthly}
        onChange={(e) => setEstimatedMonthly(e.target.value)}
        required
      />

      <Input
        label="Notiz (optional)"
        placeholder="z.B. Durchschnitt der letzten 3 Monate"
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
