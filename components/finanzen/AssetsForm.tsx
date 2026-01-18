'use client';

import { useState } from 'react';
import { Assets } from '@/lib/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface AssetsFormProps {
  onSave: (assets: Assets) => void;
  onCancel: () => void;
  initialData: Assets;
}

export default function AssetsForm({
  onSave,
  onCancel,
  initialData,
}: AssetsFormProps) {
  const [savings, setSavings] = useState(initialData.savings.toString());
  const [investments, setInvestments] = useState(initialData.investments.toString());
  const [other, setOther] = useState(initialData.other.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      savings: parseFloat(savings) || 0,
      investments: parseFloat(investments) || 0,
      other: parseFloat(other) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Ersparnisse (Girokonto, Sparkonto)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={savings}
        onChange={(e) => setSavings(e.target.value)}
      />

      <Input
        label="Investments (Aktien, ETFs, Fonds)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={investments}
        onChange={(e) => setInvestments(e.target.value)}
      />

      <Input
        label="Sonstiges (Immobilien, Sachwerte)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={other}
        onChange={(e) => setOther(e.target.value)}
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          Speichern
        </Button>
      </div>
    </form>
  );
}
