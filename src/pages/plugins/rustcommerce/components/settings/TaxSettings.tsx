import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Edit, Percent } from 'lucide-react';
import {
  PageHeader, Card, CardBody, CardHeader, Button, Badge, Input, DataTable,
  Modal, ModalFooter, Switch,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { TaxRate } from '../../types';

const mockTaxRates: TaxRate[] = [
  { id: 't1', name: 'US Federal Sales Tax', rate: '0', country: 'US', state: null, tax_type: 'percentage', is_active: false, priority: 1 },
  { id: 't2', name: 'Texas Sales Tax', rate: '6.25', country: 'US', state: 'TX', tax_type: 'percentage', is_active: true, priority: 2 },
  { id: 't3', name: 'California Sales Tax', rate: '7.25', country: 'US', state: 'CA', tax_type: 'percentage', is_active: true, priority: 2 },
  { id: 't4', name: 'New York Sales Tax', rate: '8.00', country: 'US', state: 'NY', tax_type: 'percentage', is_active: true, priority: 2 },
  { id: 't5', name: 'Canada GST', rate: '5.00', country: 'CA', state: null, tax_type: 'percentage', is_active: true, priority: 1 },
  { id: 't6', name: 'UK VAT', rate: '20.00', country: 'GB', state: null, tax_type: 'percentage', is_active: true, priority: 1 },
];

const emptyRate: Partial<TaxRate> = {
  name: '', rate: '', country: '', state: null, tax_type: 'percentage', is_active: true, priority: 1,
};

function SettingsNav() {
  const navigate = useNavigate();
  const items = [
    { label: 'General', href: '/store/settings/general' },
    { label: 'Payments', href: '/store/settings/payments' },
    { label: 'Shipping', href: '/store/settings/shipping' },
    { label: 'Tax', href: '/store/settings/tax', active: true },
    { label: 'Email', href: '/store/settings/email' },
  ];
  return (
    <Card>
      <CardBody className="space-y-1">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.href)}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              item.active
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </CardBody>
    </Card>
  );
}

export default function TaxSettings() {
  const [rates, setRates] = useState(mockTaxRates);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editRate, setEditRate] = useState<Partial<TaxRate>>(emptyRate);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Tax settings saved');
    setSaving(false);
  };

  const openAdd = () => {
    setEditRate(emptyRate);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEdit = (rate: TaxRate) => {
    setEditRate({ ...rate });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveRate = () => {
    if (isEditing && editRate.id) {
      setRates((prev) => prev.map((r) => r.id === editRate.id ? { ...r, ...editRate } as TaxRate : r));
      toast.success('Tax rate updated');
    } else {
      setRates((prev) => [...prev, { ...editRate, id: `t-${Date.now()}` } as TaxRate]);
      toast.success('Tax rate added');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setRates((prev) => prev.filter((r) => r.id !== id));
    toast.success('Tax rate removed');
  };

  const toggleRate = (id: string) => {
    setRates((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };

  const columns = [
    {
      key: 'name',
      header: 'Tax Rate',
      sortable: true,
      render: (_: any, row: TaxRate) => (
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-neutral-500">
            {row.country}{row.state ? ` / ${row.state}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      render: (_: any, row: TaxRate) => (
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
          {row.tax_type === 'percentage' ? `${row.rate}%` : `$${row.rate}`}
        </span>
      ),
    },
    {
      key: 'tax_type',
      header: 'Type',
      render: (value: string) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">{value}</span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (value: number) => (
        <span className="text-sm text-neutral-500">{value}</span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value: boolean, row: TaxRate) => (
        <Switch checked={value} onChange={() => toggleRate(row.id)} label="" size="sm" />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 80,
      render: (_: any, row: TaxRate) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => openEdit(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => handleDelete(row.id)}>
            <Trash2 className="w-4 h-4 text-error-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Tax Settings"
        description="Configure tax rates by region"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>
              Add Rate
            </Button>
            <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div variants={fadeInUp}>
          <SettingsNav />
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-3">
          <DataTable
            data={rates}
            columns={columns}
            hoverable
          />
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit Tax Rate' : 'Add Tax Rate'} size="md">
        <div className="space-y-4 p-6">
          <Input
            label="Name"
            value={editRate.name || ''}
            onChange={(e) => setEditRate((r) => ({ ...r, name: e.target.value }))}
            placeholder="e.g., Texas Sales Tax"
            isRequired
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              value={editRate.country || ''}
              onChange={(e) => setEditRate((r) => ({ ...r, country: e.target.value }))}
              placeholder="e.g., US"
              isRequired
            />
            <Input
              label="State / Province"
              value={editRate.state || ''}
              onChange={(e) => setEditRate((r) => ({ ...r, state: e.target.value || null }))}
              placeholder="e.g., TX (optional)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Type</label>
              <select
                value={editRate.tax_type || 'percentage'}
                onChange={(e) => setEditRate((r) => ({ ...r, tax_type: e.target.value as any }))}
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <Input
              label="Rate"
              value={editRate.rate || ''}
              onChange={(e) => setEditRate((r) => ({ ...r, rate: e.target.value }))}
              placeholder={editRate.tax_type === 'percentage' ? 'e.g., 6.25' : 'e.g., 5.00'}
              rightAddon={editRate.tax_type === 'percentage' ? '%' : undefined}
              leftAddon={editRate.tax_type === 'fixed' ? '$' : undefined}
              isRequired
            />
          </div>
          <Input
            label="Priority"
            type="number"
            value={editRate.priority ?? 1}
            onChange={(e) => setEditRate((r) => ({ ...r, priority: parseInt(e.target.value) || 1 }))}
            helperText="Higher priority rates are applied first"
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveRate}>
            {isEditing ? 'Update' : 'Add'} Rate
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}
