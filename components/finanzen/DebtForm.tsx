'use client';

import { useState } from 'react';
import { Debt, DebtType, DEBT_TYPES } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { toDateISO } from '@/lib/utils';

interface DebtFormProps {
  onSave: (debt: Omit<Debt, 'id'>) => void;
  onCancel: () => void;
  initialData?: Debt | null;
}

export default function DebtForm({
  onSave,
  onCancel,
  initialData,
}: DebtFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<DebtType>(initialData?.type || 'kredit');
  const [originalAmount, setOriginalAmount] = useState(
    initialData?.originalAmount.toString() || ''
  );
  const [currentBalance, setCurrentBalance] = useState(
    initialData?.currentBalance.toString() || ''
  );
  const [interestRate, setInterestRate] = useState(
    initialData?.interestRate.toString() || ''
  );
  const [monthlyPayment, setMonthlyPayment] = useState(
    initialData?.monthlyPayment.toString() || ''
  );
  const [isVariablePayment, setIsVariablePayment] = useState(
    initialData?.isVariablePayment || false
  );
  const [minPayment, setMinPayment] = useState(
    initialData?.minPayment?.toString() || ''
  );
  const [maxPayment, setMaxPayment] = useState(
    initialData?.maxPayment?.toString() || ''
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDateISO || toDateISO(new Date())
  );
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      type,
      originalAmount: parseFloat(originalAmount) || 0,
      currentBalance: parseFloat(currentBalance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0,
      isVariablePayment,
      minPayment: isVariablePayment && minPayment ? parseFloat(minPayment) : undefined,
      maxPayment: isVariablePayment && maxPayment ? parseFloat(maxPayment) : undefined,
      startDateISO: startDate,
      note: note || undefined,
    });
  };

  const typeOptions = DEBT_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="z.B. Autokredit, Baufinanzierung"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Select
        label="Art"
        value={type}
        onChange={(e) => setType(e.target.value as DebtType)}
        options={typeOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ursprungsbetrag"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={originalAmount}
          onChange={(e) => setOriginalAmount(e.target.value)}
          required
        />

        <Input
          label="Aktueller Restbetrag"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(e.target.value)}
          required
        />
      </div>

      <Input
        label="Zinssatz (%)"
        type="number"
        step="0.01"
        min="0"
        max="100"
        placeholder="0.00"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
        required
      />

      {/* Variable Payment Toggle */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVariablePayment"
            checked={isVariablePayment}
            onChange={(e) => setIsVariablePayment(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
          />
          <label htmlFor="isVariablePayment" className="ml-2 block text-sm font-medium text-slate-700">
            Variable Ratenzahlung
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Aktiviere dies, wenn die monatliche Rate variabel ist (z.B. bei Kreditkarten oder flexiblen Krediten)
        </p>

        {isVariablePayment ? (
          <>
            <Input
              label="Basis-Rate (typischer Betrag)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={minPayment}
                onChange={(e) => setMinPayment(e.target.value)}
              />
              <Input
                label="Maximum"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={maxPayment}
                onChange={(e) => setMaxPayment(e.target.value)}
              />
            </div>
          </>
        ) : (
          <Input
            label="Monatliche Rate (fest)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            required
          />
        )}
      </div>

      <Input
        label="Startdatum"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
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
