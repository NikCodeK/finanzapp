'use client';

import { useState, useCallback } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNTS } from '@/lib/types';
import { toDateISO, formatCurrency } from '@/lib/utils';
import { useTransactionTemplates } from '@/hooks/useTransactionTemplates';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, BookmarkIcon } from '@heroicons/react/24/outline';

interface QuickTransactionAddProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | null>;
}

export default function QuickTransactionAdd({ onAdd }: QuickTransactionAddProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState<string>(ACCOUNTS[0]);
  const [dateISO, setDateISO] = useState(toDateISO(new Date()));
  const [note, setNote] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ amount: number; category: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const { templates, getTemplatesByType } = useTransactionTemplates();
  const currentTemplates = getTemplatesByType(type);
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setType(template.type);
      setAmount(template.amount.toString());
      setCategory(template.category);
      setAccount(template.account);
      setNote(template.note || '');
    }
  };

  const resetForm = useCallback(() => {
    setAmount('');
    setCategory('');
    setNote('');
    setDateISO(toDateISO(new Date()));
    setSelectedTemplate('');
    // Keep type and account as they were
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!amount || !category || isSubmitting) return;

    setIsSubmitting(true);

    const result = await onAdd({
      type,
      amount: parseFloat(amount),
      category,
      account,
      dateISO,
      recurring: false,
      note,
    });

    setIsSubmitting(false);

    if (result) {
      setLastAdded({ amount: parseFloat(amount), category });
      setShowSuccess(true);
      resetForm();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setLastAdded(null);
      }, 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const categoryOptions = [
    { value: '', label: 'Kategorie...' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Type Toggle - full width on mobile */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
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
              className={`flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                type === 'income'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Einnahme
            </button>
          </div>

          {/* Toggle More Options */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors sm:hidden"
            title={showMore ? 'Weniger Optionen' : 'Mehr Optionen'}
          >
            {showMore ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Main inputs row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 items-end">
          {/* Amount */}
          <div className="col-span-1 sm:w-28">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
              className="text-right"
              required
            />
          </div>

          {/* Category */}
          <div className="col-span-1 sm:flex-1 sm:min-w-[140px]">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
              required
            />
          </div>

          {/* Template Dropdown - hidden on mobile by default */}
          {templates.length > 0 && (
            <div className="hidden sm:block sm:min-w-[120px]">
              <Select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                options={[
                  { value: '', label: 'Vorlage...' },
                  ...templates.map((t) => ({
                    value: t.id,
                    label: `${t.name} (${t.type === 'expense' ? '-' : '+'}${formatCurrency(t.amount)})`,
                  })),
                ]}
              />
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={!amount || !category || isSubmitting} className="col-span-2 sm:col-span-1">
            <PlusIcon className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Speichern...' : 'Hinzufügen'}
          </Button>

          {/* Toggle More Options - desktop only */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="hidden sm:block p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title={showMore ? 'Weniger Optionen' : 'Mehr Optionen'}
          >
            {showMore ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Expanded Options */}
        {showMore && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <Select
              label="Konto"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              options={ACCOUNTS.map((acc) => ({ value: acc, label: acc }))}
            />
            <Input
              label="Datum"
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
            />
            <Input
              label="Notiz"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Optional..."
            />
          </div>
        )}

        {/* Success Message */}
        {showSuccess && lastAdded && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm">
            <CheckCircleIcon className="h-5 w-5" />
            <span>
              {type === 'expense' ? 'Ausgabe' : 'Einnahme'} von{' '}
              <strong>{formatCurrency(lastAdded.amount)}</strong> für{' '}
              <strong>{lastAdded.category}</strong> hinzugefügt
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
