'use client';

import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNTS } from '@/lib/types';
import { toDateISO } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction?: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editTransaction,
}: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState<string>(ACCOUNTS[0]);
  const [dateISO, setDateISO] = useState(toDateISO(new Date()));
  const [recurring, setRecurring] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategory(editTransaction.category);
      setAccount(editTransaction.account);
      setDateISO(editTransaction.dateISO);
      setRecurring(editTransaction.recurring);
      setNote(editTransaction.note);
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategory('');
    setAccount(ACCOUNTS[0]);
    setDateISO(toDateISO(new Date()));
    setRecurring(false);
    setNote('');
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) return;

    onSave({
      type,
      amount: parseFloat(amount),
      category,
      account,
      dateISO,
      recurring,
      note,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('');
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              type === 'expense'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ausgabe
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('');
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              type === 'income'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Einnahme
          </button>
        </div>

        {/* Amount */}
        <Input
          label="Betrag"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        {/* Category */}
        <Select
          label="Kategorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: '', label: 'Kategorie auswählen...' },
            ...categories.map((cat) => ({ value: cat, label: cat })),
          ]}
          required
        />

        {/* Account */}
        <Select
          label="Konto"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          options={ACCOUNTS.map((acc) => ({ value: acc, label: acc }))}
        />

        {/* Date */}
        <Input
          label="Datum"
          type="date"
          value={dateISO}
          onChange={(e) => setDateISO(e.target.value)}
          required
        />

        {/* Recurring */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">Wiederkehrend</span>
        </label>

        {/* Note */}
        <Input
          label="Notiz"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optionale Beschreibung..."
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit">
            {editTransaction ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
