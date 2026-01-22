'use client';

import { useState } from 'react';
import { Investment, INVESTMENT_TYPES, InvestmentType } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';

interface InvestmentFormProps {
  onSave: (investment: Omit<Investment, 'id'>) => void;
  onCancel: () => void;
  initialData?: Investment | null;
}

export default function InvestmentForm({
  onSave,
  onCancel,
  initialData,
}: InvestmentFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<InvestmentType>(initialData?.type || 'etf');
  const [symbol, setSymbol] = useState(initialData?.symbol || '');
  const [isin, setIsin] = useState(initialData?.isin || '');
  const [quantity, setQuantity] = useState(initialData?.quantity.toString() || '0');
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice.toString() || '');
  const [currentPrice, setCurrentPrice] = useState(initialData?.currentPrice.toString() || '');
  const [purchaseDateISO, setPurchaseDateISO] = useState(
    initialData?.purchaseDateISO || format(new Date(), 'yyyy-MM-dd')
  );
  const [broker, setBroker] = useState(initialData?.broker || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [note, setNote] = useState(initialData?.note || '');

  // Calculate performance
  const qty = parseFloat(quantity) || 0;
  const purchaseP = parseFloat(purchasePrice) || 0;
  const currentP = parseFloat(currentPrice) || purchaseP;
  const totalCost = qty * purchaseP;
  const totalValue = qty * currentP;
  const gainLoss = totalValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      type,
      symbol: symbol || undefined,
      isin: isin || undefined,
      quantity: parseFloat(quantity) || 0,
      purchasePrice: parseFloat(purchasePrice) || 0,
      currentPrice: parseFloat(currentPrice) || parseFloat(purchasePrice) || 0,
      purchaseDateISO: purchaseDateISO || undefined,
      broker: broker || undefined,
      isActive,
      note: note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="z.B. MSCI World ETF, Apple Aktie"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Select
        label="Typ"
        value={type}
        onChange={(e) => setType(e.target.value as InvestmentType)}
        options={INVESTMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Symbol (optional)"
          placeholder="z.B. AAPL, BTC"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />

        <Input
          label="ISIN (optional)"
          placeholder="z.B. IE00B4L5Y983"
          value={isin}
          onChange={(e) => setIsin(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Anzahl/Stück"
          type="number"
          step="0.00000001"
          min="0"
          placeholder="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <Input
          label="Kaufpreis pro Einheit"
          type="number"
          step="0.0001"
          min="0"
          placeholder="0.00"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          required
        />
      </div>

      <Input
        label="Aktueller Preis pro Einheit"
        type="number"
        step="0.0001"
        min="0"
        placeholder="0.00"
        value={currentPrice}
        onChange={(e) => setCurrentPrice(e.target.value)}
      />

      {/* Performance Preview */}
      {qty > 0 && purchaseP > 0 && (
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Aktueller Stand</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Investiert</p>
              <p className="text-lg font-semibold text-slate-900">{totalCost.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Aktueller Wert</p>
              <p className="text-lg font-semibold text-slate-900">{totalValue.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Gewinn/Verlust</p>
              <p className={`text-lg font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Performance</p>
              <p className={`text-lg font-semibold ${gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      <Input
        label="Kaufdatum"
        type="date"
        value={purchaseDateISO}
        onChange={(e) => setPurchaseDateISO(e.target.value)}
      />

      <Input
        label="Broker (optional)"
        placeholder="z.B. Trade Republic, Scalable"
        value={broker}
        onChange={(e) => setBroker(e.target.value)}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
          Aktiv (im Portfolio)
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
