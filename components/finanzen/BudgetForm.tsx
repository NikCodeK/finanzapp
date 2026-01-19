'use client';

import { useState } from 'react';
import { Budget, EXPENSE_CATEGORIES } from '@/lib/types';
import { getCurrentMonthISO, getPreviousMonthsISO } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface BudgetFormProps {
  onSave: (budget: Omit<Budget, 'id'>) => void;
  onCancel: () => void;
  initialData?: Budget | null;
  existingCategories?: string[];
}

export default function BudgetForm({
  onSave,
  onCancel,
  initialData,
  existingCategories = [],
}: BudgetFormProps) {
  const [category, setCategory] = useState(initialData?.category || '');
  const [budgetAmount, setBudgetAmount] = useState(
    initialData?.budgetAmount.toString() || ''
  );
  const [monthISO, setMonthISO] = useState(
    initialData?.monthISO || getCurrentMonthISO()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !budgetAmount) return;

    onSave({
      category,
      budgetAmount: parseFloat(budgetAmount),
      monthISO,
    });
  };

  // Filter out categories that already have a budget for this month (unless editing)
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) =>
      !existingCategories.includes(cat) || cat === initialData?.category
  );

  const categoryOptions = [
    { value: '', label: 'Kategorie auswählen...' },
    ...availableCategories.map((cat) => ({
      value: cat,
      label: cat,
    })),
  ];

  const monthOptions = getPreviousMonthsISO(12).map((month) => {
    const date = new Date(month + '-01');
    return {
      value: month,
      label: date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
      }),
    };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Kategorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categoryOptions}
        required
      />

      <Input
        label="Budget-Betrag"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={budgetAmount}
        onChange={(e) => setBudgetAmount(e.target.value)}
        required
      />

      <Select
        label="Monat"
        value={monthISO}
        onChange={(e) => setMonthISO(e.target.value)}
        options={monthOptions}
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
