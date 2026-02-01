/**
 * Licenses Page - Enterprise Edition
 * License management for applications
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Eye,
  EyeOff,
  Clock,
  Users,
  Building,
  CreditCard,
  Zap,
  Crown,
  Star,
  ExternalLink,
  Mail,
  AlertCircle,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

interface License {
  id: string;
  appName: string;
  appIcon: string;
  licenseKey: string;
  type: 'perpetual' | 'subscription' | 'trial' | 'enterprise';
  status: 'active' | 'expired' | 'expiring' | 'suspended';
  seats: { used: number; total: number };
  purchaseDate: string;
  expiryDate: string;
  features: string[];
  cost: { amount: number; period: string };
  vendor: string;
}

const mockLicenses: License[] = [
  {
    id: '1',
    appName: 'Analytics Pro',
    appIcon: '📊',
    licenseKey: 'APR-XXXX-XXXX-XXXX-1234',
    type: 'enterprise',
    status: 'active',
    seats: { used: 45, total: 100 },
    purchaseDate: '2024-01-15',
    expiryDate: '2025-01-15',
    features: ['Advanced Analytics', 'Custom Dashboards', 'API Access', 'Priority Support'],
    cost: { amount: 999, period: 'year' },
    vendor: 'Analytics Corp',
  },
  {
    id: '2',
    appName: 'Security Suite',
    appIcon: '🛡️',
    licenseKey: 'SEC-XXXX-XXXX-XXXX-5678',
    type: 'subscription',
    status: 'expiring',
    seats: { used: 100, total: 100 },
    purchaseDate: '2024-06-01',
    expiryDate: '2025-02-01',
    features: ['Threat Detection', 'Vulnerability Scanning', 'Compliance Reports'],
    cost: { amount: 199, period: 'month' },
    vendor: 'SecureNet Inc',
  },
  {
    id: '3',
    appName: 'Task Manager Plus',
    appIcon: '📋',
    licenseKey: 'TMP-XXXX-XXXX-XXXX-9012',
    type: 'perpetual',
    status: 'active',
    seats: { used: 25, total: 50 },
    purchaseDate: '2023-08-20',
    expiryDate: 'Never',
    features: ['Unlimited Projects', 'Team Collaboration', 'Gantt Charts'],
    cost: { amount: 499, period: 'one-time' },
    vendor: 'ProductivityApps',
  },
  {
    id: '4',
    appName: 'Cloud Storage Pro',
    appIcon: '☁️',
    licenseKey: 'CSP-XXXX-XXXX-XXXX-3456',
    type: 'subscription',
    status: 'active',
    seats: { used: 78, total: 100 },
    purchaseDate: '2024-03-10',
    expiryDate: '2025-03-10',
    features: ['1TB Storage', 'Version History', 'End-to-end Encryption'],
    cost: { amount: 49, period: 'month' },
    vendor: 'CloudSpace Ltd',
  },
  {
    id: '5',
    appName: 'Email Marketing',
    appIcon: '📧',
    licenseKey: 'EML-XXXX-XXXX-XXXX-7890',
    type: 'trial',
    status: 'expiring',
    seats: { used: 5, total: 10 },
    purchaseDate: '2025-01-01',
    expiryDate: '2025-01-31',
    features: ['Basic Campaigns', 'A/B Testing', 'Basic Analytics'],
    cost: { amount: 0, period: 'trial' },
    vendor: 'MailPro Solutions',
  },
  {
    id: '6',
    appName: 'Video Editor',
    appIcon: '🎬',
    licenseKey: 'VED-XXXX-XXXX-XXXX-1122',
    type: 'subscription',
    status: 'expired',
    seats: { used: 0, total: 5 },
    purchaseDate: '2024-01-01',
    expiryDate: '2024-12-31',
    features: ['4K Export', 'Premium Effects', 'Cloud Rendering'],
    cost: { amount: 29, period: 'month' },
    vendor: 'MediaTools Inc',
  },
];

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  expired: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  expiring: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
  suspended: { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', icon: Clock },
};

const typeConfig = {
  perpetual: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Crown },
  subscription: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: RefreshCw },
  trial: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  enterprise: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Building },
};

export default function Licenses() {
  const [licenses, setLicenses] = useState<License[]>(mockLicenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         license.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    expiring: licenses.filter(l => l.status === 'expiring').length,
    totalSeats: licenses.reduce((sum, l) => sum + l.seats.total, 0),
    usedSeats: licenses.reduce((sum, l) => sum + l.seats.used, 0),
    monthlyCost: licenses
      .filter(l => l.cost.period === 'month' && l.status !== 'expired')
      .reduce((sum, l) => sum + l.cost.amount, 0),
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renewLicense = (id: string) => {
    setLicenses(licenses.map(l =>
      l.id === id ? { ...l, status: 'active', expiryDate: '2026-01-15' } : l
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="License Management"
        description="Manage your application licenses and subscriptions"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add License
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Licenses', value: stats.total, icon: Key, color: 'text-blue-500' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Expiring Soon', value: stats.expiring, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Total Seats', value: stats.totalSeats, icon: Users, color: 'text-purple-500' },
          { label: 'Used Seats', value: stats.usedSeats, icon: Users, color: 'text-indigo-500' },
          { label: 'Monthly Cost', value: `$${stats.monthlyCost}`, icon: CreditCard, color: 'text-emerald-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardBody className="p-4">
                <div className={`p-2 w-fit rounded-lg bg-neutral-100 dark:bg-neutral-700 ${stat.color} mb-2`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Expiring Soon Alert */}
      {stats.expiring > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                {stats.expiring} License{stats.expiring > 1 ? 's' : ''} Expiring Soon
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                Review and renew licenses to ensure uninterrupted service.
              </p>
            </div>
            <Button variant="warning" size="sm">Review Now</Button>
          </div>
        </motion.div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search licenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'expiring', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Licenses List */}
      <div className="space-y-4">
        {filteredLicenses.map((license, index) => {
          const StatusIcon = statusConfig[license.status].icon;
          const TypeIcon = typeConfig[license.type].icon;
          const seatPercentage = (license.seats.used / license.seats.total) * 100;

          return (
            <motion.div
              key={license.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <div className={`h-1 ${
                  license.status === 'active' ? 'bg-green-500' :
                  license.status === 'expiring' ? 'bg-amber-500' :
                  license.status === 'expired' ? 'bg-red-500' : 'bg-neutral-400'
                }`} />
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{license.appIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">{license.appName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[license.status].color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${typeConfig[license.type].color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {license.type.charAt(0).toUpperCase() + license.type.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">License Key</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                              {showKeyId === license.id ? license.licenseKey : license.licenseKey.replace(/[A-Z0-9]/g, '•')}
                            </code>
                            <button
                              onClick={() => setShowKeyId(showKeyId === license.id ? null : license.id)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                            >
                              {showKeyId === license.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(license.licenseKey)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Vendor</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{license.vendor}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Expires</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{license.expiryDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Cost</p>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            ${license.cost.amount}/{license.cost.period}
                          </p>
                        </div>
                      </div>

                      {/* Seats Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-neutral-500">Seats Used</span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {license.seats.used} / {license.seats.total}
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${seatPercentage}%` }}
                            className={`h-full rounded-full ${
                              seatPercentage >= 90 ? 'bg-red-500' :
                              seatPercentage >= 70 ? 'bg-amber-500' : 'bg-primary-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {license.features.map((feature, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs text-neutral-600 dark:text-neutral-400"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {(license.status === 'expiring' || license.status === 'expired') && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<RefreshCw className="w-4 h-4" />}
                          onClick={() => renewLicense(license.id)}
                        >
                          Renew
                        </Button>
                      )}
                      <Button variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
                        Contact
                      </Button>
                      <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredLicenses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Key className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No licenses found</h3>
          <p className="text-neutral-500 mb-6">Add your first license to get started</p>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add License
          </Button>
        </motion.div>
      )}
    </div>
  );
}
