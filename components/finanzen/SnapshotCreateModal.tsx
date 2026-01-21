'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SnapshotCreateModalProps {
  onSave: (name?: string, note?: string) => void;
  onCancel: () => void;
}

export default function SnapshotCreateModal({
  onSave,
  onCancel,
}: SnapshotCreateModalProps) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim() || undefined, note.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Ein Snapshot speichert den aktuellen Stand deiner Finanzen. Du kannst ihn
        später mit deinem aktuellen Stand vergleichen.
      </p>

      <Input
        label="Name (optional)"
        placeholder="z.B. Jahresende 2025"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notiz (optional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          rows={3}
          placeholder="Zusätzliche Informationen..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          Snapshot erstellen
        </Button>
      </div>
    </form>
  );
}
