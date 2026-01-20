'use client';

import { useState } from 'react';
import { CreditCard } from '@/lib/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface CreditCardFormProps {
  onSave: (card: Omit<CreditCard, 'id'>) => void;
  onCancel: () => void;
  initialData?: CreditCard | null;
}

export default function CreditCardForm({
  onSave,
  onCancel,
  initialData,
}: CreditCardFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [bank, setBank] = useState(initialData?.bank || '');
  const [creditLimit, setCreditLimit] = useState(
    initialData?.creditLimit?.toString() || ''
  );
  const [currentBalance, setCurrentBalance] = useState(
    initialData?.currentBalance?.toString() || '0'
  );
  const [interestRate, setInterestRate] = useState(
    initialData?.interestRate?.toString() || ''
  );
  const [monthlyFee, setMonthlyFee] = useState(
    initialData?.monthlyFee?.toString() || '0'
  );
  const [annualFee, setAnnualFee] = useState(
    initialData?.annualFee?.toString() || '0'
  );
  const [billingDay, setBillingDay] = useState(
    initialData?.billingDay?.toString() || ''
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      bank: bank || undefined,
      creditLimit: parseFloat(creditLimit) || 0,
      currentBalance: parseFloat(currentBalance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      monthlyFee: parseFloat(monthlyFee) || 0,
      annualFee: parseFloat(annualFee) || 0,
      billingDay: billingDay ? parseInt(billingDay) : undefined,
      isActive,
      note: note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Kartenname"
        placeholder="z.B. Visa Gold, Mastercard Premium"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        label="Bank (optional)"
        placeholder="z.B. Deutsche Bank, Sparkasse"
        value={bank}
        onChange={(e) => setBank(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Kreditlimit"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          required
        />

        <Input
          label="Aktueller Stand"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(e.target.value)}
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
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Monatliche Gebühr"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
        />

        <Input
          label="Jahresgebühr"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={annualFee}
          onChange={(e) => setAnnualFee(e.target.value)}
        />
      </div>

      <Input
        label="Abrechnungstag (1-31, optional)"
        type="number"
        step="1"
        min="1"
        max="31"
        placeholder="z.B. 15"
        value={billingDay}
        onChange={(e) => setBillingDay(e.target.value)}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-slate-700">
          Karte ist aktiv
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
