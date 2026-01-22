'use client';

import { useState } from 'react';
import { PlannedPurchase, PURCHASE_CATEGORIES, PurchaseStatus } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { format, addMonths } from 'date-fns';

interface PlannedPurchaseFormProps {
  onSave: (purchase: Omit<PlannedPurchase, 'id'>) => void;
  onCancel: () => void;
  initialData?: PlannedPurchase | null;
}

export default function PlannedPurchaseForm({
  onSave,
  onCancel,
  initialData,
}: PlannedPurchaseFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount.toString() || '0');
  const [monthlyContribution, setMonthlyContribution] = useState(
    initialData?.monthlyContribution.toString() || ''
  );
  const [priority, setPriority] = useState<1 | 2 | 3>(initialData?.priority || 2);
  const [targetDateISO, setTargetDateISO] = useState(initialData?.targetDateISO || '');
  const [category, setCategory] = useState(initialData?.category || PURCHASE_CATEGORIES[0]);
  const [status, setStatus] = useState<PurchaseStatus>(initialData?.status || 'aktiv');
  const [note, setNote] = useState(initialData?.note || '');

  // Calculate suggested monthly contribution and target date
  const suggestedMonthly = targetAmount && targetDateISO && parseFloat(targetAmount) > parseFloat(currentAmount || '0')
    ? (() => {
        const remaining = parseFloat(targetAmount) - parseFloat(currentAmount || '0');
        const targetDate = new Date(targetDateISO);
        const today = new Date();
        const monthsDiff = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        return remaining / monthsDiff;
      })()
    : null;

  const estimatedTargetDate = targetAmount && monthlyContribution && parseFloat(monthlyContribution) > 0
    ? (() => {
        const remaining = parseFloat(targetAmount) - parseFloat(currentAmount || '0');
        const monthsNeeded = Math.ceil(remaining / parseFloat(monthlyContribution));
        return addMonths(new Date(), monthsNeeded);
      })()
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      priority,
      targetDateISO: targetDateISO || undefined,
      category,
      status,
      note: note || undefined,
    });
  };

  const categoryOptions = PURCHASE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name der Anschaffung"
        placeholder="z.B. Neues Auto, Laptop, Urlaub"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Select
        label="Kategorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categoryOptions}
      />

      <div className="grid grid-cols-2 gap-4">
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

        <Input
          label="Bereits gespart"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
        />
      </div>

      <Input
        label="Monatliche Sparrate"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={monthlyContribution}
        onChange={(e) => setMonthlyContribution(e.target.value)}
      />

      {suggestedMonthly && !monthlyContribution && (
        <p className="text-sm text-slate-500">
          Vorgeschlagene Sparrate: <span className="font-medium">{suggestedMonthly.toFixed(2)}€/Monat</span>
        </p>
      )}

      {estimatedTargetDate && (
        <p className="text-sm text-green-600">
          Geschätztes Erreichen: <span className="font-medium">{format(estimatedTargetDate, 'MMMM yyyy')}</span>
        </p>
      )}

      <Input
        label="Zieldatum (optional)"
        type="date"
        value={targetDateISO}
        onChange={(e) => setTargetDateISO(e.target.value)}
      />

      <Select
        label="Priorität"
        value={priority.toString()}
        onChange={(e) => setPriority(parseInt(e.target.value) as 1 | 2 | 3)}
        options={[
          { value: '1', label: 'Hoch' },
          { value: '2', label: 'Mittel' },
          { value: '3', label: 'Niedrig' },
        ]}
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as PurchaseStatus)}
        options={[
          { value: 'aktiv', label: 'Aktiv' },
          { value: 'pausiert', label: 'Pausiert' },
          { value: 'erreicht', label: 'Erreicht' },
        ]}
      />

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
