import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, CreditCard, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { PageHeader, Card, CardBody, CardHeader, Button, Input, Switch, Badge } from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { PaymentSettings as PaymentSettingsType } from '../../types';

const defaultSettings: PaymentSettingsType = {
  stripe_enabled: true,
  stripe_publishable_key: 'pk_test_51Abc...xyz',
  stripe_secret_key: 'sk_test_51Abc...xyz',
  stripe_webhook_secret: 'whsec_abc...xyz',
  test_mode: true,
  payment_methods: ['card', 'apple_pay', 'google_pay'],
};

function SettingsNav() {
  const navigate = useNavigate();
  const items = [
    { label: 'General', href: '/store/settings/general' },
    { label: 'Payments', href: '/store/settings/payments', active: true },
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

export default function PaymentSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const update = (field: keyof PaymentSettingsType, value: any) => {
    setSettings((s) => ({ ...s, [field]: value }));
  };

  const togglePaymentMethod = (method: string) => {
    setSettings((s) => ({
      ...s,
      payment_methods: s.payment_methods.includes(method)
        ? s.payment_methods.filter((m) => m !== method)
        : [...s.payment_methods, method],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Payment settings saved');
    setSaving(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Payment Settings"
        description="Configure payment processors and methods"
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
          {/* Test Mode Warning */}
          {settings.test_mode && (
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning-800 dark:text-warning-300">Test Mode Enabled</p>
                  <p className="text-xs text-warning-600 dark:text-warning-400">Payments will use Stripe test API. No real charges will be made.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stripe */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-neutral-500" />
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Stripe</h3>
                  </div>
                  <Switch
                    checked={settings.stripe_enabled}
                    onChange={(checked) => update('stripe_enabled', checked)}
                    label=""
                  />
                </div>
              </CardHeader>
              {settings.stripe_enabled && (
                <CardBody className="space-y-4">
                  <Switch
                    checked={settings.test_mode}
                    onChange={(checked) => update('test_mode', checked)}
                    label="Test Mode"
                    description="Use Stripe test keys for development"
                    color="warning"
                  />
                  <Input
                    label="Publishable Key"
                    value={settings.stripe_publishable_key}
                    onChange={(e) => update('stripe_publishable_key', e.target.value)}
                    placeholder="pk_test_..."
                  />
                  <div className="relative">
                    <Input
                      label="Secret Key"
                      type={showSecretKey ? 'text' : 'password'}
                      value={settings.stripe_secret_key}
                      onChange={(e) => update('stripe_secret_key', e.target.value)}
                      placeholder="sk_test_..."
                      rightIcon={
                        <button onClick={() => setShowSecretKey(!showSecretKey)} className="focus:outline-none">
                          {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                  <div className="relative">
                    <Input
                      label="Webhook Secret"
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={settings.stripe_webhook_secret}
                      onChange={(e) => update('stripe_webhook_secret', e.target.value)}
                      placeholder="whsec_..."
                      rightIcon={
                        <button onClick={() => setShowWebhookSecret(!showWebhookSecret)} className="focus:outline-none">
                          {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                </CardBody>
              )}
            </Card>
          </motion.div>

          {/* Payment Methods */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Payment Methods</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {[
                  { id: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, Amex' },
                  { id: 'apple_pay', label: 'Apple Pay', description: 'Pay with Apple Pay on supported devices' },
                  { id: 'google_pay', label: 'Google Pay', description: 'Pay with Google Pay on supported devices' },
                  { id: 'paypal', label: 'PayPal', description: 'Pay with PayPal account' },
                ].map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{method.label}</p>
                      <p className="text-xs text-neutral-500">{method.description}</p>
                    </div>
                    <Switch
                      checked={settings.payment_methods.includes(method.id)}
                      onChange={() => togglePaymentMethod(method.id)}
                      label=""
                    />
                  </div>
                ))}
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
