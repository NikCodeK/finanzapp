'use client';

import { useState } from 'react';
import { IncomeSource, IncomeFrequency, QuarterlyBonusStatus } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface IncomeSourceFormProps {
  onSave: (source: Omit<IncomeSource, 'id'>) => void;
  onCancel: () => void;
  initialData?: IncomeSource | null;
}

const DEFAULT_QUARTERS: QuarterlyBonusStatus = {
  Q1: false,
  Q2: false,
  Q3: false,
  Q4: false,
};

export default function IncomeSourceForm({
  onSave,
  onCancel,
  initialData,
}: IncomeSourceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [frequency, setFrequency] = useState<IncomeFrequency>(
    initialData?.frequency || 'monatlich'
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [confirmedQuarters, setConfirmedQuarters] = useState<QuarterlyBonusStatus>(
    initialData?.confirmedQuarters || DEFAULT_QUARTERS
  );
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      amount: parseFloat(amount) || 0,
      frequency,
      isActive,
      confirmedQuarters: frequency === 'quartalsbonus' ? confirmedQuarters : undefined,
      note: note || undefined,
    });
  };

  const handleQuarterChange = (quarter: keyof QuarterlyBonusStatus) => {
    setConfirmedQuarters((prev) => ({
      ...prev,
      [quarter]: !prev[quarter],
    }));
  };

  const getQuarterLabel = (quarter: keyof QuarterlyBonusStatus) => {
    const labels: Record<keyof QuarterlyBonusStatus, string> = {
      Q1: 'Q1 (Jan-März)',
      Q2: 'Q2 (Apr-Juni)',
      Q3: 'Q3 (Juli-Sept)',
      Q4: 'Q4 (Okt-Dez)',
    };
    return labels[quarter];
  };

  const confirmedCount = Object.values(confirmedQuarters).filter(Boolean).length;
  const yearlyBonusTotal = frequency === 'quartalsbonus'
    ? (parseFloat(amount) || 0) * confirmedCount
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="z.B. Gehalt, Nebenjob, Quartalsbonus"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={frequency === 'quartalsbonus' ? 'Betrag pro Quartal' : 'Betrag'}
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
          onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
          options={[
            { value: 'monatlich', label: 'Monatlich' },
            { value: 'jaehrlich', label: 'Jährlich' },
            { value: 'quartalsbonus', label: 'Quartalsbonus' },
          ]}
        />
      </div>

      {/* Quarterly Bonus Checkboxes */}
      {frequency === 'quartalsbonus' && (
        <div className="border border-slate-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bestätigte Quartale
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Setze einen Haken für jedes Quartal, in dem du den Bonus erhalten hast.
              Nur bestätigte Quartale werden in die Jahresberechnung einbezogen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((quarter) => (
              <div
                key={quarter}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  confirmedQuarters[quarter]
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleQuarterChange(quarter)}
              >
                <input
                  type="checkbox"
                  id={`quarter-${quarter}`}
                  checked={confirmedQuarters[quarter]}
                  onChange={() => handleQuarterChange(quarter)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded"
                />
                <label
                  htmlFor={`quarter-${quarter}`}
                  className="ml-2 block text-sm text-slate-700 cursor-pointer"
                >
                  {getQuarterLabel(quarter)}
                </label>
                {confirmedQuarters[quarter] && (
                  <span className="ml-auto text-green-600 text-xs font-medium">
                    Erhalten
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Bestätigte Quartale:</span>
              <span className="font-medium">{confirmedCount} von 4</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-600">Jahresbonus (bestätigt):</span>
              <span className="font-medium text-green-600">
                {yearlyBonusTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-600">Monatlicher Durchschnitt:</span>
              <span className="font-medium">
                {(yearlyBonusTotal / 12).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>
        </div>
      )}

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
