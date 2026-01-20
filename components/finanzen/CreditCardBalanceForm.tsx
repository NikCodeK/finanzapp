'use client';

import { useState } from 'react';
import { CreditCard, CreditCardBalance } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { toDateISO } from '@/lib/utils';

interface CreditCardBalanceFormProps {
  creditCards: CreditCard[];
  onSave: (balance: Omit<CreditCardBalance, 'id'>) => void;
  onCancel: () => void;
  preselectedCardId?: string;
}

export default function CreditCardBalanceForm({
  creditCards,
  onSave,
  onCancel,
  preselectedCardId,
}: CreditCardBalanceFormProps) {
  const [creditCardId, setCreditCardId] = useState(preselectedCardId || creditCards[0]?.id || '');
  const [balance, setBalance] = useState('');
  const [recordedAt, setRecordedAt] = useState(toDateISO(new Date()));
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      creditCardId,
      balance: parseFloat(balance) || 0,
      recordedAtISO: recordedAt,
      note: note || undefined,
    });
  };

  const cardOptions = creditCards.map((card) => ({
    value: card.id,
    label: `${card.name}${card.bank ? ` (${card.bank})` : ''}`,
  }));

  const selectedCard = creditCards.find((c) => c.id === creditCardId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {creditCards.length > 1 && !preselectedCardId && (
        <Select
          label="Kreditkarte"
          value={creditCardId}
          onChange={(e) => setCreditCardId(e.target.value)}
          options={cardOptions}
        />
      )}

      {selectedCard && (
        <div className="p-3 bg-slate-50 rounded-lg text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Aktueller Stand:</span>
            <span className="font-medium text-slate-900">
              {selectedCard.currentBalance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-500">Limit:</span>
            <span className="font-medium text-slate-900">
              {selectedCard.creditLimit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>
      )}

      <Input
        label="Neuer Stand"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        required
      />

      <Input
        label="Datum"
        type="date"
        value={recordedAt}
        onChange={(e) => setRecordedAt(e.target.value)}
        required
      />

      <Input
        label="Notiz (optional)"
        placeholder="z.B. Nach Abbuchung, Monatsabschluss"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          Stand aktualisieren
        </Button>
      </div>
    </form>
  );
}
