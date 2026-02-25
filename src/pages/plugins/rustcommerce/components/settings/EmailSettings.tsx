import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Mail, Send, ShoppingBag, Truck, Bell, Star, ShoppingCart } from 'lucide-react';
import {
  PageHeader, Card, CardBody, CardHeader, Button, Input, Switch,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { EmailSettings as EmailSettingsType } from '../../types';

const defaultSettings: EmailSettingsType = {
  order_confirmation: true,
  shipping_notification: true,
  status_updates: true,
  review_request: true,
  abandoned_cart: false,
  sender_name: 'My Store',
  sender_email: 'noreply@mystore.com',
};

const emailTemplates = [
  {
    id: 'order_confirmation',
    label: 'Order Confirmation',
    description: 'Sent when a customer completes an order',
    icon: <ShoppingBag className="w-5 h-5" />,
    field: 'order_confirmation' as const,
  },
  {
    id: 'shipping_notification',
    label: 'Shipping Notification',
    description: 'Sent when an order is shipped with tracking info',
    icon: <Truck className="w-5 h-5" />,
    field: 'shipping_notification' as const,
  },
  {
    id: 'status_updates',
    label: 'Order Status Updates',
    description: 'Sent when order status changes (processing, delivered)',
    icon: <Bell className="w-5 h-5" />,
    field: 'status_updates' as const,
  },
  {
    id: 'review_request',
    label: 'Review Request',
    description: 'Sent after delivery asking for a product review',
    icon: <Star className="w-5 h-5" />,
    field: 'review_request' as const,
  },
  {
    id: 'abandoned_cart',
    label: 'Abandoned Cart Recovery',
    description: 'Reminder email for customers who left items in their cart',
    icon: <ShoppingCart className="w-5 h-5" />,
    field: 'abandoned_cart' as const,
  },
];

function SettingsNav() {
  const navigate = useNavigate();
  const items = [
    { label: 'General', href: '/store/settings/general' },
    { label: 'Payments', href: '/store/settings/payments' },
    { label: 'Shipping', href: '/store/settings/shipping' },
    { label: 'Tax', href: '/store/settings/tax' },
    { label: 'Email', href: '/store/settings/email', active: true },
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

export default function EmailSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof EmailSettingsType, value: any) => {
    setSettings((s) => ({ ...s, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Email settings saved');
    setSaving(false);
  };

  const sendTest = (templateId: string) => {
    toast.success(`Test email sent for: ${templateId}`);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Email Settings"
        description="Configure email notifications and templates"
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
          {/* Sender Info */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Sender Information</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Sender Name"
                    value={settings.sender_name}
                    onChange={(e) => update('sender_name', e.target.value)}
                    placeholder="Your Store Name"
                  />
                  <Input
                    label="Sender Email"
                    type="email"
                    value={settings.sender_email}
                    onChange={(e) => update('sender_email', e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Email Templates */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Email Notifications</h3>
              </CardHeader>
              <CardBody padding="none">
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="flex items-center gap-4 px-6 py-4">
                      <div className={`p-2 rounded-lg ${
                        settings[template.field]
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                      }`}>
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{template.label}</p>
                        <p className="text-xs text-neutral-500">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => sendTest(template.id)}
                        >
                          Test
                        </Button>
                        <Switch
                          checked={settings[template.field]}
                          onChange={(checked) => update(template.field, checked)}
                          label=""
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
