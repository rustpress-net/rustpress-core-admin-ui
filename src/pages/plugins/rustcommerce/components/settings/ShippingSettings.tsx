import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Truck, Globe2, Edit } from 'lucide-react';
import {
  PageHeader, Card, CardBody, CardHeader, Button, Input, Badge, Switch,
  Modal, ModalFooter,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { ShippingZone, ShippingMethod } from '../../types';

const mockZones: ShippingZone[] = [
  {
    id: 'z1', name: 'Domestic (US)', countries: ['US'],
    methods: [
      { id: 'm1', name: 'Standard Shipping', description: '5-7 business days', shipping_type: 'flat_rate', price: '5.99', free_threshold: '75.00', min_weight: null, max_weight: null, is_active: true },
      { id: 'm2', name: 'Express Shipping', description: '2-3 business days', shipping_type: 'flat_rate', price: '14.99', free_threshold: null, min_weight: null, max_weight: null, is_active: true },
      { id: 'm3', name: 'Free Shipping', description: 'Orders over $75', shipping_type: 'free_shipping', price: '0', free_threshold: '75.00', min_weight: null, max_weight: null, is_active: true },
    ],
  },
  {
    id: 'z2', name: 'Canada', countries: ['CA'],
    methods: [
      { id: 'm4', name: 'Standard International', description: '7-14 business days', shipping_type: 'flat_rate', price: '12.99', free_threshold: null, min_weight: null, max_weight: null, is_active: true },
    ],
  },
  {
    id: 'z3', name: 'Europe', countries: ['GB', 'DE', 'FR', 'IT', 'ES'],
    methods: [
      { id: 'm5', name: 'International Shipping', description: '10-21 business days', shipping_type: 'flat_rate', price: '19.99', free_threshold: null, min_weight: null, max_weight: null, is_active: true },
      { id: 'm6', name: 'Weight-Based', description: 'Price varies by weight', shipping_type: 'weight_based', price: '1.50', free_threshold: null, min_weight: 0, max_weight: 30, is_active: false },
    ],
  },
];

const typeLabels: Record<string, string> = {
  flat_rate: 'Flat Rate',
  free_shipping: 'Free Shipping',
  weight_based: 'Weight Based',
};

function SettingsNav() {
  const navigate = useNavigate();
  const items = [
    { label: 'General', href: '/store/settings/general' },
    { label: 'Payments', href: '/store/settings/payments' },
    { label: 'Shipping', href: '/store/settings/shipping', active: true },
    { label: 'Tax', href: '/store/settings/tax' },
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

export default function ShippingSettings() {
  const [zones, setZones] = useState(mockZones);
  const [saving, setSaving] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editMethod, setEditMethod] = useState<Partial<ShippingMethod>>({
    name: '', description: '', shipping_type: 'flat_rate', price: '', free_threshold: null,
    min_weight: null, max_weight: null, is_active: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Shipping settings saved');
    setSaving(false);
  };

  const openAddMethod = (zoneId: string) => {
    setEditingZoneId(zoneId);
    setEditMethod({ name: '', description: '', shipping_type: 'flat_rate', price: '', free_threshold: null, min_weight: null, max_weight: null, is_active: true });
    setShowMethodModal(true);
  };

  const handleSaveMethod = () => {
    if (editingZoneId && editMethod.name) {
      setZones((prev) => prev.map((z) => {
        if (z.id === editingZoneId) {
          return {
            ...z,
            methods: [...z.methods, { ...editMethod, id: `m-${Date.now()}` } as ShippingMethod],
          };
        }
        return z;
      }));
      toast.success('Shipping method added');
      setShowMethodModal(false);
    }
  };

  const removeMethod = (zoneId: string, methodId: string) => {
    setZones((prev) => prev.map((z) => {
      if (z.id === zoneId) {
        return { ...z, methods: z.methods.filter((m) => m.id !== methodId) };
      }
      return z;
    }));
    toast.success('Shipping method removed');
  };

  const toggleMethod = (zoneId: string, methodId: string) => {
    setZones((prev) => prev.map((z) => {
      if (z.id === zoneId) {
        return { ...z, methods: z.methods.map((m) => m.id === methodId ? { ...m, is_active: !m.is_active } : m) };
      }
      return z;
    }));
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Shipping Settings"
        description="Configure shipping zones and methods"
        actions={
          <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div variants={fadeInUp}>
          <SettingsNav />
        </motion.div>

        <div className="lg:col-span-3 space-y-6">
          {zones.map((zone) => (
            <motion.div key={zone.id} variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-neutral-500" />
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{zone.name}</h3>
                      <span className="text-xs text-neutral-500">({zone.countries.join(', ')})</span>
                    </div>
                    <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openAddMethod(zone.id)}>
                      Add Method
                    </Button>
                  </div>
                </CardHeader>
                <CardBody padding="none">
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {zone.methods.map((method) => (
                      <div key={method.id} className="flex items-center gap-4 px-6 py-3">
                        <Truck className={`w-5 h-5 flex-shrink-0 ${method.is_active ? 'text-primary-500' : 'text-neutral-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{method.name}</p>
                            <Badge variant={method.is_active ? 'success' : 'default'} size="xs">
                              {method.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500">{method.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {method.shipping_type === 'free_shipping' ? 'Free' : `$${method.price}`}
                          </p>
                          <p className="text-xs text-neutral-500">{typeLabels[method.shipping_type]}</p>
                          {method.free_threshold && (
                            <p className="text-xs text-neutral-400">Free over ${method.free_threshold}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Switch
                            checked={method.is_active}
                            onChange={() => toggleMethod(zone.id, method.id)}
                            size="sm"
                            label=""
                          />
                          <Button variant="ghost" size="xs" onClick={() => removeMethod(zone.id, method.id)}>
                            <Trash2 className="w-4 h-4 text-error-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {zone.methods.length === 0 && (
                      <div className="px-6 py-8 text-center text-sm text-neutral-500">
                        No shipping methods configured for this zone.
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Method Modal */}
      <Modal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} title="Add Shipping Method" size="md">
        <div className="space-y-4 p-6">
          <Input
            label="Method Name"
            value={editMethod.name || ''}
            onChange={(e) => setEditMethod((m) => ({ ...m, name: e.target.value }))}
            placeholder="e.g., Standard Shipping"
            isRequired
          />
          <Input
            label="Description"
            value={editMethod.description || ''}
            onChange={(e) => setEditMethod((m) => ({ ...m, description: e.target.value }))}
            placeholder="e.g., 5-7 business days"
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Type</label>
            <select
              value={editMethod.shipping_type || 'flat_rate'}
              onChange={(e) => setEditMethod((m) => ({ ...m, shipping_type: e.target.value as any }))}
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="flat_rate">Flat Rate</option>
              <option value="free_shipping">Free Shipping</option>
              <option value="weight_based">Weight Based</option>
            </select>
          </div>
          {editMethod.shipping_type !== 'free_shipping' && (
            <Input
              label="Price"
              value={editMethod.price || ''}
              onChange={(e) => setEditMethod((m) => ({ ...m, price: e.target.value }))}
              placeholder="0.00"
              leftAddon="$"
            />
          )}
          <Input
            label="Free Shipping Threshold"
            value={editMethod.free_threshold || ''}
            onChange={(e) => setEditMethod((m) => ({ ...m, free_threshold: e.target.value || null }))}
            placeholder="Optional - e.g., 75.00"
            leftAddon="$"
            helperText="Free shipping when order exceeds this amount"
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowMethodModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveMethod}>Add Method</Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}
