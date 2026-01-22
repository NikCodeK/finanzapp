'use client';

import { useState, useEffect } from 'react';
import { Subscription, SUBSCRIPTION_CATEGORIES, SubscriptionFrequency } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { addMonths, format } from 'date-fns';

interface SubscriptionFormProps {
  onSave: (subscription: Omit<Subscription, 'id'>) => void;
  onCancel: () => void;
  initialData?: Subscription | null;
}

export default function SubscriptionForm({
  onSave,
  onCancel,
  initialData,
}: SubscriptionFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [frequency, setFrequency] = useState<SubscriptionFrequency>(
    initialData?.frequency || 'monatlich'
  );
  const [category, setCategory] = useState(initialData?.category || SUBSCRIPTION_CATEGORIES[0]);
  const [startDateISO, setStartDateISO] = useState(
    initialData?.startDateISO || format(new Date(), 'yyyy-MM-dd')
  );
  const [cancellationPeriodDays, setCancellationPeriodDays] = useState(
    initialData?.cancellationPeriodDays?.toString() || '30'
  );
  const [nextBillingDateISO, setNextBillingDateISO] = useState(
    initialData?.nextBillingDateISO || ''
  );
  const [autoRenew, setAutoRenew] = useState(initialData?.autoRenew ?? true);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [note, setNote] = useState(initialData?.note || '');

  // Auto-calculate next billing date based on start date and frequency
  useEffect(() => {
    if (startDateISO && !initialData?.nextBillingDateISO) {
      const startDate = new Date(startDateISO);
      let nextDate: Date;

      switch (frequency) {
        case 'monatlich':
          nextDate = addMonths(startDate, 1);
          break;
        case 'vierteljaehrlich':
          nextDate = addMonths(startDate, 3);
          break;
        case 'halbjaehrlich':
          nextDate = addMonths(startDate, 6);
          break;
        case 'jaehrlich':
          nextDate = addMonths(startDate, 12);
          break;
        default:
          nextDate = addMonths(startDate, 1);
      }

      // If next date is in the past, calculate the next upcoming date
      const today = new Date();
      while (nextDate < today) {
        switch (frequency) {
          case 'monatlich':
            nextDate = addMonths(nextDate, 1);
            break;
          case 'vierteljaehrlich':
            nextDate = addMonths(nextDate, 3);
            break;
          case 'halbjaehrlich':
            nextDate = addMonths(nextDate, 6);
            break;
          case 'jaehrlich':
            nextDate = addMonths(nextDate, 12);
            break;
        }
      }

      setNextBillingDateISO(format(nextDate, 'yyyy-MM-dd'));
    }
  }, [startDateISO, frequency, initialData?.nextBillingDateISO]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      provider: provider || undefined,
      amount: parseFloat(amount) || 0,
      frequency,
      category,
      startDateISO,
      cancellationPeriodDays: parseInt(cancellationPeriodDays) || 30,
      nextBillingDateISO: nextBillingDateISO || undefined,
      autoRenew,
      isActive,
      note: note || undefined,
    });
  };

  const categoryOptions = SUBSCRIPTION_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="z.B. Netflix, Spotify, Adobe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        label="Anbieter (optional)"
        placeholder="z.B. Netflix Inc."
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
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
          onChange={(e) => setFrequency(e.target.value as SubscriptionFrequency)}
          options={[
            { value: 'monatlich', label: 'Monatlich' },
            { value: 'vierteljaehrlich', label: 'Vierteljährlich' },
            { value: 'halbjaehrlich', label: 'Halbjährlich' },
            { value: 'jaehrlich', label: 'Jährlich' },
          ]}
        />
      </div>

      <Select
        label="Kategorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categoryOptions}
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
          label="Nächste Abrechnung"
          type="date"
          value={nextBillingDateISO}
          onChange={(e) => setNextBillingDateISO(e.target.value)}
        />
      </div>

      <Input
        label="Kündigungsfrist (Tage)"
        type="number"
        min="0"
        placeholder="30"
        value={cancellationPeriodDays}
        onChange={(e) => setCancellationPeriodDays(e.target.value)}
      />

      <div className="flex items-center gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoRenew"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
          />
          <label htmlFor="autoRenew" className="ml-2 block text-sm text-slate-700">
            Automatische Verlängerung
          </label>
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
