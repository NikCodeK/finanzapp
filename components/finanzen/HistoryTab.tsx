'use client';

import { useState } from 'react';
import { FinancialSnapshot, YearlyIncomeRecord } from '@/lib/types';
import { useFinancialSnapshots } from '@/hooks/useFinancialSnapshots';
import { useYearlyIncome } from '@/hooks/useYearlyIncome';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SnapshotList from './SnapshotList';
import SnapshotDetailView from './SnapshotDetailView';
import SnapshotCreateModal from './SnapshotCreateModal';
import YearlyIncomeList from './YearlyIncomeList';
import YearlyIncomeForm from './YearlyIncomeForm';
import { PlusIcon, CameraIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface HistoryTabProps {
  currentSnapshot: Omit<FinancialSnapshot, 'id' | 'createdAtISO' | 'name' | 'note'>;
}

type HistorySection = 'snapshots' | 'yearly';

export default function HistoryTab({ currentSnapshot }: HistoryTabProps) {
  const [activeSection, setActiveSection] = useState<HistorySection>('snapshots');
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<FinancialSnapshot | null>(null);
  const [yearlyModalOpen, setYearlyModalOpen] = useState(false);
  const [editingYearlyRecord, setEditingYearlyRecord] = useState<YearlyIncomeRecord | null>(null);

  const {
    snapshots,
    isLoading: snapshotsLoading,
    addSnapshot,
    deleteSnapshot,
  } = useFinancialSnapshots();

  const {
    records: yearlyRecords,
    isLoading: yearlyLoading,
    addRecord: addYearlyRecord,
    updateRecord: updateYearlyRecord,
    deleteRecord: deleteYearlyRecord,
  } = useYearlyIncome();

  const handleCreateSnapshot = async (name?: string, note?: string) => {
    await addSnapshot({
      ...currentSnapshot,
      name,
      note,
    });
    setSnapshotModalOpen(false);
  };

  const handleSaveYearlyRecord = async (record: Omit<YearlyIncomeRecord, 'id'>) => {
    if (editingYearlyRecord) {
      await updateYearlyRecord({ ...record, id: editingYearlyRecord.id });
    } else {
      await addYearlyRecord(record);
    }
    setYearlyModalOpen(false);
    setEditingYearlyRecord(null);
  };

  const handleEditYearlyRecord = (record: YearlyIncomeRecord) => {
    setEditingYearlyRecord(record);
    setYearlyModalOpen(true);
  };

  const handleCloseYearlyModal = () => {
    setYearlyModalOpen(false);
    setEditingYearlyRecord(null);
  };

  const isLoading = snapshotsLoading || yearlyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setActiveSection('snapshots')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'snapshots'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CameraIcon className="h-5 w-5" />
          Snapshots
        </button>
        <button
          onClick={() => setActiveSection('yearly')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'yearly'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarIcon className="h-5 w-5" />
          Jahresübersichten
        </button>
      </div>

      {/* Snapshots Section */}
      {activeSection === 'snapshots' && (
        <Card>
          <CardHeader
            title="Finanz-Snapshots"
            subtitle={`${snapshots.length} Snapshot${snapshots.length !== 1 ? 's' : ''} gespeichert`}
            action={
              <Button size="sm" onClick={() => setSnapshotModalOpen(true)}>
                <CameraIcon className="h-4 w-4 mr-1" />
                Snapshot erstellen
              </Button>
            }
          />
          <SnapshotList
            snapshots={snapshots}
            onView={setViewingSnapshot}
            onDelete={deleteSnapshot}
          />
        </Card>
      )}

      {/* Yearly Income Section */}
      {activeSection === 'yearly' && (
        <Card>
          <CardHeader
            title="Jahresübersichten"
            subtitle={`${yearlyRecords.length} Jahr${yearlyRecords.length !== 1 ? 'e' : ''} dokumentiert`}
            action={
              <Button size="sm" onClick={() => setYearlyModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Jahr hinzufügen
              </Button>
            }
          />
          <YearlyIncomeList
            records={yearlyRecords}
            onEdit={handleEditYearlyRecord}
            onDelete={deleteYearlyRecord}
          />
        </Card>
      )}

      {/* Create Snapshot Modal */}
      <Modal
        isOpen={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        title="Snapshot erstellen"
      >
        <SnapshotCreateModal
          onSave={handleCreateSnapshot}
          onCancel={() => setSnapshotModalOpen(false)}
        />
      </Modal>

      {/* View Snapshot Modal */}
      <Modal
        isOpen={!!viewingSnapshot}
        onClose={() => setViewingSnapshot(null)}
        title=""
      >
        {viewingSnapshot && (
          <SnapshotDetailView
            snapshot={viewingSnapshot}
            onClose={() => setViewingSnapshot(null)}
          />
        )}
      </Modal>

      {/* Yearly Income Modal */}
      <Modal
        isOpen={yearlyModalOpen}
        onClose={handleCloseYearlyModal}
        title={editingYearlyRecord ? `${editingYearlyRecord.year} bearbeiten` : 'Neues Jahr hinzufügen'}
      >
        <YearlyIncomeForm
          onSave={handleSaveYearlyRecord}
          onCancel={handleCloseYearlyModal}
          initialData={editingYearlyRecord}
          existingYears={yearlyRecords.map(r => r.year)}
        />
      </Modal>
    </div>
  );
}
