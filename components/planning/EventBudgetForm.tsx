'use client';

import { useState } from 'react';
import { EventBudget, EVENT_CATEGORIES, EventBudgetStatus } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface EventBudgetFormProps {
  onSave: (budget: Omit<EventBudget, 'id'>) => void;
  onCancel: () => void;
  initialData?: EventBudget | null;
}

export default function EventBudgetForm({
  onSave,
  onCancel,
  initialData,
}: EventBudgetFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount.toString() || '0');
  const [eventDateISO, setEventDateISO] = useState(initialData?.eventDateISO || '');
  const [category, setCategory] = useState(initialData?.category || EVENT_CATEGORIES[0]);
  const [status, setStatus] = useState<EventBudgetStatus>(initialData?.status || 'aktiv');
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      eventDateISO: eventDateISO || undefined,
      category,
      status,
      note: note || undefined,
    });
  };

  const categoryOptions = EVENT_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Event-Name"
        placeholder="z.B. Sommerurlaub 2026, Weihnachten"
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
          label="Budget"
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
        label="Event-Datum"
        type="date"
        value={eventDateISO}
        onChange={(e) => setEventDateISO(e.target.value)}
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as EventBudgetStatus)}
        options={[
          { value: 'aktiv', label: 'Aktiv' },
          { value: 'abgeschlossen', label: 'Abgeschlossen' },
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
