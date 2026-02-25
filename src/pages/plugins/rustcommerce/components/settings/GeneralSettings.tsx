import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Store, Globe } from 'lucide-react';
import { PageHeader, Card, CardBody, CardHeader, Button, Input } from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { StoreSettings } from '../../types';

const defaultSettings: StoreSettings = {
  store_name: 'My Awesome Store',
  store_email: 'store@example.com',
  store_phone: '+1 512-555-0100',
  store_address: '123 Commerce Street, Austin, TX 78701',
  currency: 'USD',
  currency_symbol: '$',
  currency_position: 'before',
  thousand_separator: ',',
  decimal_separator: '.',
  decimals: 2,
  weight_unit: 'kg',
  dimension_unit: 'cm',
};

function SettingsNav() {
  const navigate = useNavigate();
  const items = [
    { label: 'General', href: '/store/settings/general', active: true },
    { label: 'Payments', href: '/store/settings/payments' },
    { label: 'Shipping', href: '/store/settings/shipping' },
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

export default function GeneralSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof StoreSettings, value: any) => {
    setSettings((s) => ({ ...s, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Store Settings"
        description="Configure your store preferences"
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
          {/* Store Info */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Store Information</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Store Name"
                  value={settings.store_name}
                  onChange={(e) => update('store_name', e.target.value)}
                  placeholder="Your store name"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Store Email"
                    type="email"
                    value={settings.store_email}
                    onChange={(e) => update('store_email', e.target.value)}
                    placeholder="store@example.com"
                  />
                  <Input
                    label="Store Phone"
                    value={settings.store_phone}
                    onChange={(e) => update('store_phone', e.target.value)}
                    placeholder="+1 555-000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Store Address
                  </label>
                  <textarea
                    value={settings.store_address}
                    onChange={(e) => update('store_address', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none"
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Currency */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Currency & Format</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => update('currency', e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                  <Input
                    label="Currency Symbol"
                    value={settings.currency_symbol}
                    onChange={(e) => update('currency_symbol', e.target.value)}
                    placeholder="$"
                  />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Symbol Position</label>
                    <select
                      value={settings.currency_position}
                      onChange={(e) => update('currency_position', e.target.value as 'before' | 'after')}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="before">Before ($100)</option>
                      <option value="after">After (100$)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Thousand Separator"
                    value={settings.thousand_separator}
                    onChange={(e) => update('thousand_separator', e.target.value)}
                    placeholder=","
                  />
                  <Input
                    label="Decimal Separator"
                    value={settings.decimal_separator}
                    onChange={(e) => update('decimal_separator', e.target.value)}
                    placeholder="."
                  />
                  <Input
                    label="Decimal Places"
                    type="number"
                    value={settings.decimals}
                    onChange={(e) => update('decimals', parseInt(e.target.value) || 0)}
                    placeholder="2"
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Units */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Measurement Units</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Weight Unit</label>
                    <select
                      value={settings.weight_unit}
                      onChange={(e) => update('weight_unit', e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="g">Grams (g)</option>
                      <option value="oz">Ounces (oz)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Dimension Unit</label>
                    <select
                      value={settings.dimension_unit}
                      onChange={(e) => update('dimension_unit', e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="in">Inches (in)</option>
                      <option value="m">Meters (m)</option>
                      <option value="mm">Millimeters (mm)</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
