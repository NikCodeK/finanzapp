'use client';

import { useState } from 'react';
import { YearlyIncomeRecord } from '@/lib/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface YearlyIncomeFormProps {
  onSave: (record: Omit<YearlyIncomeRecord, 'id'>) => void;
  onCancel: () => void;
  initialData?: YearlyIncomeRecord | null;
  existingYears?: number[];
}

export default function YearlyIncomeForm({
  onSave,
  onCancel,
  initialData,
  existingYears = [],
}: YearlyIncomeFormProps) {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(initialData?.year?.toString() || currentYear.toString());
  const [baseSalary, setBaseSalary] = useState(initialData?.baseSalary?.toString() || '0');
  const [bonusQ1, setBonusQ1] = useState(initialData?.bonusQ1?.toString() || '0');
  const [bonusQ2, setBonusQ2] = useState(initialData?.bonusQ2?.toString() || '0');
  const [bonusQ3, setBonusQ3] = useState(initialData?.bonusQ3?.toString() || '0');
  const [bonusQ4, setBonusQ4] = useState(initialData?.bonusQ4?.toString() || '0');
  const [gifts, setGifts] = useState(initialData?.gifts?.toString() || '0');
  const [otherIncome, setOtherIncome] = useState(initialData?.otherIncome?.toString() || '0');
  const [note, setNote] = useState(initialData?.note || '');

  const isEditing = !!initialData;
  const yearNumber = parseInt(year) || currentYear;
  const yearExists = existingYears.includes(yearNumber) && (!isEditing || initialData?.year !== yearNumber);

  const total = (
    (parseFloat(baseSalary) || 0) +
    (parseFloat(bonusQ1) || 0) +
    (parseFloat(bonusQ2) || 0) +
    (parseFloat(bonusQ3) || 0) +
    (parseFloat(bonusQ4) || 0) +
    (parseFloat(gifts) || 0) +
    (parseFloat(otherIncome) || 0)
  );

  const totalBonus = (
    (parseFloat(bonusQ1) || 0) +
    (parseFloat(bonusQ2) || 0) +
    (parseFloat(bonusQ3) || 0) +
    (parseFloat(bonusQ4) || 0)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (yearExists) return;

    onSave({
      year: yearNumber,
      baseSalary: parseFloat(baseSalary) || 0,
      bonusQ1: parseFloat(bonusQ1) || 0,
      bonusQ2: parseFloat(bonusQ2) || 0,
      bonusQ3: parseFloat(bonusQ3) || 0,
      bonusQ4: parseFloat(bonusQ4) || 0,
      gifts: parseFloat(gifts) || 0,
      otherIncome: parseFloat(otherIncome) || 0,
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Jahr"
        type="number"
        min="2000"
        max="2100"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        error={yearExists ? 'Dieses Jahr existiert bereits' : undefined}
      />

      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <h4 className="text-sm font-medium text-emerald-800 mb-3">Grundgehalt</h4>
        <Input
          label="Jahresgehalt (Brutto)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={baseSalary}
          onChange={(e) => setBaseSalary(e.target.value)}
        />
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-3">Quartals-Boni</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Q1 (Jan-März)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={bonusQ1}
            onChange={(e) => setBonusQ1(e.target.value)}
          />
          <Input
            label="Q2 (Apr-Juni)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={bonusQ2}
            onChange={(e) => setBonusQ2(e.target.value)}
          />
          <Input
            label="Q3 (Juli-Sept)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={bonusQ3}
            onChange={(e) => setBonusQ3(e.target.value)}
          />
          <Input
            label="Q4 (Okt-Dez)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={bonusQ4}
            onChange={(e) => setBonusQ4(e.target.value)}
          />
        </div>
        <p className="text-sm text-blue-600 mt-2">
          Gesamt-Bonus: {totalBonus.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </p>
      </div>

      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-medium text-purple-800 mb-3">Sonstiges</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Geschenke"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={gifts}
            onChange={(e) => setGifts(e.target.value)}
          />
          <Input
            label="Sonstige Einnahmen"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={otherIncome}
            onChange={(e) => setOtherIncome(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notiz (optional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          rows={2}
          placeholder="z.B. Gehaltserhöhung im Juli..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="p-4 bg-slate-100 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-700">Gesamteinnahmen {yearNumber}</span>
          <span className="text-xl font-bold text-emerald-600">
            {total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1" disabled={yearExists}>
          {isEditing ? 'Speichern' : 'Hinzufügen'}
        </Button>
      </div>
    </form>
  );
}
