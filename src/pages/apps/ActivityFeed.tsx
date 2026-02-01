/**
 * Activity Feed Page - Enterprise Edition
 * Real-time activity stream with filtering, search, and analytics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  AppWindow,
  Settings,
  Shield,
  Database,
  Code,
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Eye,
  MessageSquare,
  GitBranch,
  Upload,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Key,
  Globe,
  Server,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

// Activity types with icons and colors
const activityTypes = {
  app_launch: { icon: AppWindow, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  app_install: { icon: Download, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  app_uninstall: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  app_update: { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  user_login: { icon: LogIn, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  user_logout: { icon: LogOut, color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800' },
  settings_change: { icon: Settings, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  security_alert: { icon: Shield, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  api_call: { icon: Code, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  database_query: { icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  file_upload: { icon: Upload, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  permission_change: { icon: Key, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  deployment: { icon: Globe, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
};

type ActivityType = keyof typeof activityTypes;

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  app?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Generate mock activities
const generateActivities = (): ActivityItem[] => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'app_launch',
      title: 'Application Launched',
      description: 'Task Manager app was opened',
      user: { name: 'John Doe', role: 'Admin' },
      app: 'Task Manager',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      severity: 'low',
    },
    {
      id: '2',
      type: 'security_alert',
      title: 'Failed Login Attempt',
      description: '3 failed login attempts from IP 192.168.1.45',
      user: { name: 'System', role: 'Security' },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      severity: 'high',
      metadata: { ip: '192.168.1.45', attempts: 3 },
    },
    {
      id: '3',
      type: 'app_install',
      title: 'New App Installed',
      description: 'Calendar Pro was installed from the App Store',
      user: { name: 'Sarah Wilson', role: 'Developer' },
      app: 'Calendar Pro',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      severity: 'low',
    },
    {
      id: '4',
      type: 'database_query',
      title: 'Heavy Database Query',
      description: 'Query took 2.3s to execute on users table',
      user: { name: 'API Service', role: 'System' },
      timestamp: new Date(Date.now() - 1000 * 60 * 22),
      severity: 'medium',
      metadata: { duration: '2.3s', table: 'users', rows: 15000 },
    },
    {
      id: '5',
      type: 'deployment',
      title: 'Production Deployment',
      description: 'Version 2.4.1 deployed to production servers',
      user: { name: 'Mike Chen', role: 'DevOps' },
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      severity: 'medium',
      metadata: { version: '2.4.1', environment: 'production' },
    },
    {
      id: '6',
      type: 'user_login',
      title: 'User Login',
      description: 'Successfully authenticated via SSO',
      user: { name: 'Emily Brown', role: 'Manager' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      severity: 'low',
    },
    {
      id: '7',
      type: 'permission_change',
      title: 'Permission Updated',
      description: 'Admin role granted to user account',
      user: { name: 'John Doe', role: 'Admin' },
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      severity: 'high',
      metadata: { targetUser: 'alex.smith', newRole: 'Admin' },
    },
    {
      id: '8',
      type: 'error',
      title: 'Application Error',
      description: 'Unhandled exception in Notes app',
      user: { name: 'System', role: 'Monitor' },
      app: 'Notes',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      severity: 'critical',
      metadata: { errorCode: 'ERR_500', stack: 'TypeError: Cannot read property...' },
    },
    {
      id: '9',
      type: 'api_call',
      title: 'API Rate Limit Warning',
      description: 'External API approaching rate limit (85%)',
      user: { name: 'Integration Service', role: 'System' },
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      severity: 'medium',
      metadata: { api: 'Stripe', usage: '85%', limit: 10000 },
    },
    {
      id: '10',
      type: 'app_update',
      title: 'App Auto-Updated',
      description: 'File Manager updated to version 3.2.0',
      user: { name: 'Auto Update', role: 'System' },
      app: 'File Manager',
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      severity: 'low',
    },
    {
      id: '11',
      type: 'settings_change',
      title: 'System Settings Modified',
      description: 'Email notification preferences updated',
      user: { name: 'Admin User', role: 'Admin' },
      timestamp: new Date(Date.now() - 1000 * 60 * 300),
      severity: 'low',
    },
    {
      id: '12',
      type: 'file_upload',
      title: 'Large File Upload',
      description: 'Database backup (2.4GB) uploaded to storage',
      user: { name: 'Backup Service', role: 'System' },
      timestamp: new Date(Date.now() - 1000 * 60 * 360),
      severity: 'low',
      metadata: { size: '2.4GB', type: 'backup' },
    },
  ];
  return activities;
};

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const severityColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Initialize activities
  useEffect(() => {
    setActivities(generateActivities());
  }, []);

  // Filter activities
  useEffect(() => {
    let filtered = [...activities];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.user.name.toLowerCase().includes(query) ||
          a.app?.toLowerCase().includes(query)
      );
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(a => selectedTypes.includes(a.type));
    }

    if (selectedSeverity.length > 0) {
      filtered = filtered.filter(a => a.severity && selectedSeverity.includes(a.severity));
    }

    setFilteredActivities(filtered);
  }, [activities, searchQuery, selectedTypes, selectedSeverity]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: (['app_launch', 'api_call', 'user_login', 'info'] as ActivityType[])[
          Math.floor(Math.random() * 4)
        ],
        title: 'New Activity',
        description: 'Real-time activity detected',
        user: { name: 'System', role: 'Monitor' },
        timestamp: new Date(),
        severity: 'low',
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 100));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const stats = {
    total: activities.length,
    critical: activities.filter(a => a.severity === 'critical').length,
    high: activities.filter(a => a.severity === 'high').length,
    apps: new Set(activities.filter(a => a.app).map(a => a.app)).size,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Feed"
        description="Real-time monitoring of all system and application activities"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant={isLive ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Activity className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.total, icon: Activity, color: 'text-blue-500' },
          { label: 'Critical', value: stats.critical, icon: AlertCircle, color: 'text-red-500' },
          { label: 'High Priority', value: stats.high, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Active Apps', value: stats.apps, icon: AppWindow, color: 'text-purple-500' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
              {(selectedTypes.length > 0 || selectedSeverity.length > 0) && (
                <Badge variant="primary" size="xs" className="ml-2">
                  {selectedTypes.length + selectedSeverity.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Activity Types */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Activity Types
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(activityTypes).slice(0, 8).map(([type, config]) => {
                          const Icon = config.icon;
                          const isSelected = selectedTypes.includes(type as ActivityType);
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                setSelectedTypes(
                                  isSelected
                                    ? selectedTypes.filter((t) => t !== type)
                                    : [...selectedTypes, type as ActivityType]
                                );
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                isSelected
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {type.replace('_', ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Severity */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Severity Level
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['low', 'medium', 'high', 'critical'] as const).map((severity) => {
                          const isSelected = selectedSeverity.includes(severity);
                          return (
                            <button
                              key={severity}
                              onClick={() => {
                                setSelectedSeverity(
                                  isSelected
                                    ? selectedSeverity.filter((s) => s !== severity)
                                    : [...selectedSeverity, severity]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                                isSelected
                                  ? 'bg-primary-500 text-white'
                                  : severityColors[severity]
                              }`}
                            >
                              {severity}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardBody>
      </Card>

      {/* Activity List */}
      <Card>
        <CardBody className="p-0">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity, index) => {
                const typeConfig = activityTypes[activity.type];
                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2.5 rounded-xl ${typeConfig.bg}`}>
                        <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {activity.severity && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                  severityColors[activity.severity]
                                }`}
                              >
                                {activity.severity}
                              </span>
                            )}
                            <span className="text-xs text-neutral-400 whitespace-nowrap">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {activity.user.name}
                          </span>
                          {activity.app && (
                            <span className="flex items-center gap-1">
                              <AppWindow className="w-3.5 h-3.5" />
                              {activity.app}
                            </span>
                          )}
                          {activity.metadata && (
                            <span className="text-neutral-400">
                              {Object.entries(activity.metadata)
                                .slice(0, 2)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' • ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredActivities.length === 0 && (
              <div className="p-12 text-center text-neutral-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No activities found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
