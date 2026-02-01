/**
 * App Alerts Page - Enterprise Edition
 * Comprehensive notification and alert management system
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  BellRing,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Settings,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Mail,
  Smartphone,
  Monitor,
  Globe,
  Shield,
  Zap,
  Database,
  Users,
  Activity,
  TrendingUp,
  Download,
  Archive,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Star,
  Bookmark,
  Send,
  MessageSquare,
  Slack,
  Webhook,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
type AlertStatus = 'unread' | 'read' | 'archived' | 'snoozed';
type AlertCategory = 'security' | 'performance' | 'system' | 'app' | 'user' | 'billing';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  source: string;
  timestamp: Date;
  isStarred: boolean;
  actionUrl?: string;
  metadata?: Record<string, string>;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: AlertSeverity;
  channels: string[];
  isEnabled: boolean;
  triggeredCount: number;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'push' | 'sms';
  name: string;
  isEnabled: boolean;
  config: Record<string, string>;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Critical Security Alert',
    message: 'Multiple failed login attempts detected from IP 192.168.1.105. Consider blocking this IP address.',
    severity: 'critical',
    status: 'unread',
    category: 'security',
    source: 'Security Monitor',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isStarred: true,
    actionUrl: '/security/logs',
    metadata: { ip: '192.168.1.105', attempts: '15' },
  },
  {
    id: '2',
    title: 'Database Performance Warning',
    message: 'Query response time exceeded 2 seconds on average in the last 15 minutes.',
    severity: 'warning',
    status: 'unread',
    category: 'performance',
    source: 'Performance Monitor',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isStarred: false,
    actionUrl: '/database/performance',
    metadata: { avgTime: '2.3s', queries: '450' },
  },
  {
    id: '3',
    title: 'New App Update Available',
    message: 'Task Manager v3.2.0 is now available with bug fixes and performance improvements.',
    severity: 'info',
    status: 'read',
    category: 'app',
    source: 'Update Service',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isStarred: false,
    actionUrl: '/apps/updates',
  },
  {
    id: '4',
    title: 'Backup Completed Successfully',
    message: 'Daily automated backup completed. All 247 files backed up to cloud storage.',
    severity: 'success',
    status: 'read',
    category: 'system',
    source: 'Backup Service',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isStarred: false,
    metadata: { files: '247', size: '1.2GB' },
  },
  {
    id: '5',
    title: 'User License Expiring',
    message: 'Enterprise license for 5 users will expire in 7 days. Renew to avoid service interruption.',
    severity: 'warning',
    status: 'unread',
    category: 'billing',
    source: 'License Manager',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isStarred: true,
    actionUrl: '/licenses',
    metadata: { daysLeft: '7', users: '5' },
  },
  {
    id: '6',
    title: 'New Team Member Added',
    message: 'John Doe has been added to the Development team with Developer role.',
    severity: 'info',
    status: 'read',
    category: 'user',
    source: 'User Management',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isStarred: false,
    metadata: { user: 'John Doe', team: 'Development' },
  },
  {
    id: '7',
    title: 'SSL Certificate Expiring',
    message: 'SSL certificate for api.example.com will expire in 14 days.',
    severity: 'warning',
    status: 'snoozed',
    category: 'security',
    source: 'Certificate Monitor',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isStarred: false,
    metadata: { domain: 'api.example.com', daysLeft: '14' },
  },
];

const mockRules: AlertRule[] = [
  { id: 'r1', name: 'High CPU Usage', condition: 'CPU > 90% for 5 min', severity: 'critical', channels: ['email', 'slack'], isEnabled: true, triggeredCount: 12 },
  { id: 'r2', name: 'Failed Login Attempts', condition: '> 5 failed logins in 10 min', severity: 'warning', channels: ['email'], isEnabled: true, triggeredCount: 45 },
  { id: 'r3', name: 'Disk Space Low', condition: 'Disk usage > 85%', severity: 'warning', channels: ['email', 'webhook'], isEnabled: true, triggeredCount: 3 },
  { id: 'r4', name: 'New User Registration', condition: 'User created', severity: 'info', channels: ['slack'], isEnabled: false, triggeredCount: 156 },
  { id: 'r5', name: 'Payment Failed', condition: 'Payment declined', severity: 'critical', channels: ['email', 'sms'], isEnabled: true, triggeredCount: 8 },
];

const mockChannels: NotificationChannel[] = [
  { id: 'c1', type: 'email', name: 'Admin Email', isEnabled: true, config: { email: 'admin@example.com' } },
  { id: 'c2', type: 'slack', name: 'Dev Channel', isEnabled: true, config: { webhook: 'https://hooks.slack.com/...' } },
  { id: 'c3', type: 'webhook', name: 'PagerDuty', isEnabled: true, config: { url: 'https://events.pagerduty.com/...' } },
  { id: 'c4', type: 'push', name: 'Browser Push', isEnabled: false, config: {} },
  { id: 'c5', type: 'sms', name: 'Admin Phone', isEnabled: true, config: { phone: '+1-555-0123' } },
];

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', badge: 'danger' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'warning' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', badge: 'info' },
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', badge: 'success' },
};

const categoryConfig = {
  security: { icon: Shield, label: 'Security' },
  performance: { icon: Activity, label: 'Performance' },
  system: { icon: Monitor, label: 'System' },
  app: { icon: Zap, label: 'Application' },
  user: { icon: Users, label: 'User' },
  billing: { icon: TrendingUp, label: 'Billing' },
};

const channelIcons = {
  email: Mail,
  slack: MessageSquare,
  webhook: Webhook,
  push: Bell,
  sms: Smartphone,
};

export default function AppAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [rules, setRules] = useState<AlertRule[]>(mockRules);
  const [channels, setChannels] = useState<NotificationChannel[]>(mockChannels);
  const [activeTab, setActiveTab] = useState<'inbox' | 'rules' | 'channels'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | 'all'>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const unreadCount = alerts.filter(a => a.status === 'unread').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'unread').length;

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'read' as AlertStatus } : a));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, status: 'read' as AlertStatus })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const archiveAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'archived' as AlertStatus } : a));
  };

  const toggleStar = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isStarred: !a.isStarred } : a));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  const toggleChannel = (id: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, isEnabled: !c.isEnabled } : c));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const toggleSelectAlert = (id: string) => {
    setSelectedAlerts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selectAllAlerts = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(a => a.id));
    }
  };

  const bulkMarkAsRead = () => {
    setAlerts(alerts.map(a => selectedAlerts.includes(a.id) ? { ...a, status: 'read' as AlertStatus } : a));
    setSelectedAlerts([]);
  };

  const bulkArchive = () => {
    setAlerts(alerts.map(a => selectedAlerts.includes(a.id) ? { ...a, status: 'archived' as AlertStatus } : a));
    setSelectedAlerts([]);
  };

  const bulkDelete = () => {
    setAlerts(alerts.filter(a => !selectedAlerts.includes(a.id)));
    setSelectedAlerts([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="App Alerts"
        description="Monitor and manage notifications across all applications"
        actions={
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <Badge variant="danger" className="animate-pulse">
                {criticalCount} Critical
              </Badge>
            )}
            <Button
              variant={isMuted ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Critical</p>
                <p className="text-2xl font-bold text-red-500">{alerts.filter(a => a.severity === 'critical').length}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Warnings</p>
                <p className="text-2xl font-bold text-amber-500">{alerts.filter(a => a.severity === 'warning').length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Unread</p>
                <p className="text-2xl font-bold text-blue-500">{unreadCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Bell className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Rules</p>
                <p className="text-2xl font-bold text-green-500">{rules.filter(r => r.isEnabled).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700">
        {[
          { id: 'inbox', label: 'Inbox', icon: Bell, count: unreadCount },
          { id: 'rules', label: 'Alert Rules', icon: Zap, count: rules.length },
          { id: 'channels', label: 'Channels', icon: Send, count: channels.filter(c => c.isEnabled).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
            {tab.count > 0 && (
              <Badge variant={activeTab === tab.id ? 'primary' : 'secondary'} size="xs">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Inbox Tab */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardBody className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value as AlertSeverity | 'all')}
                    className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                  >
                    <option value="all">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                  </select>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as AlertCategory | 'all')}
                    className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="security">Security</option>
                    <option value="performance">Performance</option>
                    <option value="system">System</option>
                    <option value="app">Application</option>
                    <option value="user">User</option>
                    <option value="billing">Billing</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as AlertStatus | 'all')}
                    className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
                    <option value="snoozed">Snoozed</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<CheckCheck className="w-4 h-4" />}
                    onClick={markAllAsRead}
                  >
                    Mark All Read
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedAlerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-500">
                      {selectedAlerts.length} selected
                    </span>
                    <Button variant="ghost" size="sm" onClick={bulkMarkAsRead}>
                      <Check className="w-4 h-4 mr-1" /> Mark Read
                    </Button>
                    <Button variant="ghost" size="sm" onClick={bulkArchive}>
                      <Archive className="w-4 h-4 mr-1" /> Archive
                    </Button>
                    <Button variant="ghost" size="sm" onClick={bulkDelete} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardBody>
          </Card>

          {/* Alert List */}
          <Card>
            <CardBody className="p-0">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {/* Select All Header */}
                <div className="flex items-center gap-4 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                    onChange={selectAllAlerts}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-500">
                    {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <AnimatePresence>
                  {filteredAlerts.map((alert, index) => {
                    const severity = severityConfig[alert.severity];
                    const category = categoryConfig[alert.category];
                    const SeverityIcon = severity.icon;
                    const CategoryIcon = category.icon;
                    const isExpanded = expandedAlert === alert.id;

                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group ${alert.status === 'unread' ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                      >
                        <div className="flex items-start gap-4 p-4">
                          <input
                            type="checkbox"
                            checked={selectedAlerts.includes(alert.id)}
                            onChange={() => toggleSelectAlert(alert.id)}
                            className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                          />

                          <div className={`p-2 rounded-lg ${severity.bg}`}>
                            <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-medium ${alert.status === 'unread' ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                    {alert.title}
                                  </h4>
                                  {alert.isStarred && (
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  )}
                                </div>
                                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{alert.message}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-neutral-400">{formatTimestamp(alert.timestamp)}</span>
                                <button
                                  onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                >
                                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant="secondary" size="xs">
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {category.label}
                              </Badge>
                              <span className="text-xs text-neutral-400">{alert.source}</span>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                                >
                                  {alert.metadata && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                      {Object.entries(alert.metadata).map(([key, value]) => (
                                        <div key={key} className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                                          <p className="text-xs text-neutral-500 uppercase">{key}</p>
                                          <p className="font-medium text-neutral-900 dark:text-white">{value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    {alert.actionUrl && (
                                      <Button variant="primary" size="sm">
                                        View Details
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => archiveAlert(alert.id)}>
                                      <Archive className="w-4 h-4 mr-1" /> Archive
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => toggleStar(alert.id)}>
                                      <Star className={`w-4 h-4 mr-1 ${alert.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                                      {alert.isStarred ? 'Unstar' : 'Star'}
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {alert.status === 'unread' && (
                              <button
                                onClick={() => markAsRead(alert.id)}
                                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400"
                                title="Mark as read"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => toggleStar(alert.id)}
                              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400"
                              title={alert.isStarred ? 'Unstar' : 'Star'}
                            >
                              <Star className={`w-4 h-4 ${alert.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredAlerts.length === 0 && (
                  <div className="text-center py-16">
                    <BellOff className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No alerts found</h3>
                    <p className="text-neutral-500">Your inbox is empty or no alerts match your filters</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-neutral-500">Configure automatic alert rules based on conditions</p>
            <Button variant="primary" size="sm" leftIcon={<Zap className="w-4 h-4" />}>
              Create Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {rules.map((rule, index) => {
              const severity = severityConfig[rule.severity];

              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`${!rule.isEnabled ? 'opacity-60' : ''}`}>
                    <CardBody className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${severity.bg}`}>
                          <Zap className={`w-6 h-6 ${severity.color}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-neutral-900 dark:text-white">{rule.name}</h4>
                            <Badge variant={severity.badge as any} size="xs">{rule.severity}</Badge>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">{rule.condition}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {rule.channels.map(channel => {
                              const Icon = channelIcons[channel as keyof typeof channelIcons] || Bell;
                              return (
                                <div key={channel} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                                  <Icon className="w-4 h-4 text-neutral-500" />
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{rule.triggeredCount}</p>
                            <p className="text-xs text-neutral-500">triggered</p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rule.isEnabled}
                              onChange={() => toggleRule(rule.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-500"></div>
                          </label>

                          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-neutral-500">Manage notification delivery channels</p>
            <Button variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
              Add Channel
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel, index) => {
              const Icon = channelIcons[channel.type];

              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`${!channel.isEnabled ? 'opacity-60' : ''}`}>
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-primary-500/10">
                          <Icon className="w-6 h-6 text-primary-500" />
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={channel.isEnabled}
                            onChange={() => toggleChannel(channel.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-500"></div>
                        </label>
                      </div>

                      <h4 className="font-medium text-neutral-900 dark:text-white">{channel.name}</h4>
                      <p className="text-sm text-neutral-500 capitalize">{channel.type}</p>

                      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <Button variant="ghost" size="sm" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
