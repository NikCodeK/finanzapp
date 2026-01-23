'use client';

import { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Subscription } from '@/lib/types';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm';
import SubscriptionList from '@/components/subscriptions/SubscriptionList';
import { formatCurrency } from '@/lib/utils';
import {
  PlusIcon,
  CreditCardIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';

export default function SubscriptionsPage() {
  const {
    subscriptions,
    isLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    monthlySubscriptionCost,
    yearlySubscriptionCost,
    subscriptionsByCategory,
    activeCount,
  } = useSubscriptions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const handleSave = async (data: Omit<Subscription, 'id'>) => {
    if (editingSubscription) {
      await updateSubscription({ ...data, id: editingSubscription.id });
    } else {
      await addSubscription(data);
    }
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteSubscription(id);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === 'active') return sub.isActive;
    if (filter === 'inactive') return !sub.isActive;
    return true;
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Abos verwalten</h1>
          <p className="text-slate-500 mt-1">Behalte den Überblick über alle deine Abonnements</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Neues Abo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Monatliche Kosten</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(monthlySubscriptionCost)}
              </p>
              <p className="text-xs text-slate-400">
                {formatCurrency(yearlySubscriptionCost)}/Jahr
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartPieIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aktive Abos</p>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
              <p className="text-xs text-slate-400">
                {subscriptions.length - activeCount} inaktiv
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <ChartPieIcon className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Kategorien</p>
              <p className="text-2xl font-bold text-slate-900">
                {Object.keys(subscriptionsByCategory).length}
              </p>
              <p className="text-xs text-slate-400">
                verschiedene Bereiche
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Overview */}
      {Object.keys(subscriptionsByCategory).length > 0 && (
        <Card>
          <CardHeader title="Nach Kategorie" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(subscriptionsByCategory)
              .sort((a, b) => b[1].totalMonthly - a[1].totalMonthly)
              .map(([category, data]) => (
                <div key={category} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">{category}</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCurrency(data.totalMonthly)}/M
                  </p>
                  <p className="text-xs text-slate-400">
                    {data.subscriptions.length} Abo{data.subscriptions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Subscription List */}
      <Card>
        <CardHeader
          title="Alle Abos"
          action={
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Alle
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Aktiv
              </Button>
              <Button
                variant={filter === 'inactive' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('inactive')}
              >
                Inaktiv
              </Button>
            </div>
          }
        />
        <SubscriptionList
          subscriptions={filteredSubscriptions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingSubscription ? 'Abo bearbeiten' : 'Neues Abo hinzufügen'}
      >
        <SubscriptionForm
          onSave={handleSave}
          onCancel={handleClose}
          initialData={editingSubscription}
        />
      </Modal>
    </div>
  );
}
