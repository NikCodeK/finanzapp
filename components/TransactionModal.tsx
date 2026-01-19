'use client';

import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { Transaction, TransactionTemplate, EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNTS } from '@/lib/types';
import { toDateISO, formatCurrency } from '@/lib/utils';
import { useTransactionTemplates } from '@/hooks/useTransactionTemplates';
import { BookmarkIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const { templates, addTemplate, deleteTemplate, getTemplatesByType } = useTransactionTemplates();

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
    setSaveAsTemplate(false);
    setTemplateName('');
  };

  const applyTemplate = (template: TransactionTemplate) => {
    setType(template.type);
    setAmount(template.amount.toString());
    setCategory(template.category);
    setAccount(template.account);
    setNote(template.note || '');
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) return;

    // Save as template if requested
    if (saveAsTemplate && templateName.trim()) {
      addTemplate({
        name: templateName.trim(),
        type,
        amount: parseFloat(amount),
        category,
        account,
        note: note || undefined,
      });
    }

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

  const currentTemplates = getTemplatesByType(type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template Selection */}
        {!editTransaction && currentTemplates.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-700 mb-2">Aus Vorlage ausfüllen:</p>
            <div className="flex flex-wrap gap-2">
              {currentTemplates.map((template) => (
                <div key={template.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <span className="font-medium">{template.name}</span>
                    <span className="text-slate-500 ml-1">({formatCurrency(template.amount)})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTemplate(template.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Vorlage löschen"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Save as Template Option */}
        {!editTransaction && (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 flex items-center gap-1">
                <BookmarkIcon className="h-4 w-4" />
                Als Vorlage speichern
              </span>
            </label>
            {saveAsTemplate && (
              <Input
                placeholder="Vorlagenname (z.B. Miete, Gehalt)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required={saveAsTemplate}
              />
            )}
          </div>
        )}

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
