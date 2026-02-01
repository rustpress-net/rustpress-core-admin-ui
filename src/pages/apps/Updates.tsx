/**
 * App Updates Page - Enterprise Edition
 * Manage and install application updates
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpCircle,
  Settings,
  Shield,
  Zap,
  Bug,
  Sparkles,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  MoreHorizontal,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

interface AppUpdate {
  id: string;
  name: string;
  icon: string;
  currentVersion: string;
  newVersion: string;
  size: string;
  releaseDate: string;
  changelog: ChangelogEntry[];
  isAutoUpdate: boolean;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'available' | 'downloading' | 'installing' | 'installed' | 'failed';
  progress?: number;
}

interface ChangelogEntry {
  type: 'feature' | 'fix' | 'security' | 'performance';
  description: string;
}

const mockUpdates: AppUpdate[] = [
  {
    id: '1',
    name: 'Task Manager',
    icon: '📋',
    currentVersion: '2.4.0',
    newVersion: '2.5.0',
    size: '12.4 MB',
    releaseDate: '2 hours ago',
    priority: 'high',
    status: 'available',
    isAutoUpdate: false,
    changelog: [
      { type: 'feature', description: 'New Gantt chart view for project timeline' },
      { type: 'feature', description: 'Task dependencies and blockers' },
      { type: 'fix', description: 'Fixed notification sync issues' },
      { type: 'performance', description: 'Improved loading speed by 40%' },
    ],
  },
  {
    id: '2',
    name: 'Security Scanner',
    icon: '🛡️',
    currentVersion: '1.2.3',
    newVersion: '1.3.0',
    size: '8.2 MB',
    releaseDate: '1 day ago',
    priority: 'critical',
    status: 'available',
    isAutoUpdate: true,
    changelog: [
      { type: 'security', description: 'Critical vulnerability patch (CVE-2025-1234)' },
      { type: 'security', description: 'Enhanced encryption for data at rest' },
      { type: 'feature', description: 'New threat detection algorithms' },
    ],
  },
  {
    id: '3',
    name: 'Analytics Dashboard',
    icon: '📊',
    currentVersion: '3.1.0',
    newVersion: '3.2.0',
    size: '15.8 MB',
    releaseDate: '3 days ago',
    priority: 'normal',
    status: 'downloading',
    progress: 45,
    isAutoUpdate: false,
    changelog: [
      { type: 'feature', description: 'Custom dashboard widgets' },
      { type: 'feature', description: 'Export to PDF and Excel' },
      { type: 'performance', description: 'Real-time data streaming' },
      { type: 'fix', description: 'Fixed chart rendering on mobile' },
    ],
  },
  {
    id: '4',
    name: 'File Manager',
    icon: '📁',
    currentVersion: '4.0.2',
    newVersion: '4.1.0',
    size: '6.5 MB',
    releaseDate: '1 week ago',
    priority: 'low',
    status: 'available',
    isAutoUpdate: true,
    changelog: [
      { type: 'feature', description: 'Drag and drop file organization' },
      { type: 'fix', description: 'Fixed upload progress indicator' },
    ],
  },
  {
    id: '5',
    name: 'Code Editor',
    icon: '👨‍💻',
    currentVersion: '5.2.1',
    newVersion: '5.3.0',
    size: '45.2 MB',
    releaseDate: '2 days ago',
    priority: 'normal',
    status: 'installed',
    isAutoUpdate: false,
    changelog: [
      { type: 'feature', description: 'AI code completion powered by GPT-4' },
      { type: 'feature', description: 'Multi-cursor editing' },
      { type: 'performance', description: 'Faster syntax highlighting' },
    ],
  },
];

const priorityConfig = {
  critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' },
  normal: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Normal' },
  low: { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', label: 'Low' },
};

const changelogIcons = {
  feature: { icon: Sparkles, color: 'text-purple-500' },
  fix: { icon: Bug, color: 'text-amber-500' },
  security: { icon: Shield, color: 'text-red-500' },
  performance: { icon: Zap, color: 'text-green-500' },
};

export default function Updates() {
  const [updates, setUpdates] = useState<AppUpdate[]>(mockUpdates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  const availableUpdates = updates.filter(u => u.status === 'available' || u.status === 'downloading');
  const installedUpdates = updates.filter(u => u.status === 'installed');
  const criticalUpdates = updates.filter(u => u.priority === 'critical' && u.status === 'available');

  const checkForUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => setIsCheckingUpdates(false), 2000);
  };

  const installUpdate = (id: string) => {
    setUpdates(updates.map(u =>
      u.id === id ? { ...u, status: 'downloading', progress: 0 } : u
    ));

    // Simulate download progress
    const interval = setInterval(() => {
      setUpdates(prev => prev.map(u => {
        if (u.id === id && u.status === 'downloading') {
          const newProgress = (u.progress || 0) + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...u, status: 'installing', progress: 100 };
          }
          return { ...u, progress: newProgress };
        }
        return u;
      }));
    }, 300);

    // Simulate installation
    setTimeout(() => {
      setUpdates(prev => prev.map(u =>
        u.id === id ? { ...u, status: 'installed' } : u
      ));
    }, 4000);
  };

  const installAll = () => {
    availableUpdates.forEach(u => {
      if (u.status === 'available') {
        installUpdate(u.id);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="App Updates"
        description="Keep your applications up to date"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Auto-update</span>
              <button
                onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  autoUpdateEnabled ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                  animate={{ x: autoUpdateEnabled ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-4 h-4 ${isCheckingUpdates ? 'animate-spin' : ''}`} />}
              onClick={checkForUpdates}
              disabled={isCheckingUpdates}
            >
              Check for Updates
            </Button>
            {availableUpdates.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={installAll}
              >
                Update All ({availableUpdates.length})
              </Button>
            )}
          </div>
        }
      />

      {/* Critical Updates Alert */}
      {criticalUpdates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 dark:text-red-400">
                {criticalUpdates.length} Critical Update{criticalUpdates.length > 1 ? 's' : ''} Available
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Security updates require immediate attention. Install them now to protect your system.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => criticalUpdates.forEach(u => installUpdate(u.id))}>
              Install Critical Updates
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Available', value: availableUpdates.length, icon: Download, color: 'text-blue-500' },
          { label: 'Critical', value: criticalUpdates.length, icon: AlertCircle, color: 'text-red-500' },
          { label: 'Installed Today', value: installedUpdates.length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Auto-update Apps', value: updates.filter(u => u.isAutoUpdate).length, icon: RefreshCw, color: 'text-purple-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Updates List */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Available Updates</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {updates.map((update, index) => {
              const isExpanded = expandedId === update.id;

              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{update.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral-900 dark:text-white">{update.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[update.priority].color}`}>
                          {priorityConfig[update.priority].label}
                        </span>
                        {update.isAutoUpdate && (
                          <Badge variant="secondary" size="xs">Auto</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <span>{update.currentVersion} → <span className="text-primary-500 font-medium">{update.newVersion}</span></span>
                        <span>•</span>
                        <span>{update.size}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {update.releaseDate}
                        </span>
                      </div>
                    </div>

                    {/* Status / Actions */}
                    <div className="flex items-center gap-3">
                      {update.status === 'available' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Download className="w-4 h-4" />}
                          onClick={() => installUpdate(update.id)}
                        >
                          Install
                        </Button>
                      )}
                      {update.status === 'downloading' && (
                        <div className="flex items-center gap-3">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                              <span>Downloading</span>
                              <span>{update.progress}%</span>
                            </div>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${update.progress}%` }}
                              />
                            </div>
                          </div>
                          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500">
                            <Pause className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {update.status === 'installing' && (
                        <div className="flex items-center gap-2 text-primary-500">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">Installing...</span>
                        </div>
                      )}
                      {update.status === 'installed' && (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Installed</span>
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : update.id)}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Changelog (Expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                          <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            What's New in {update.newVersion}
                          </h5>
                          <div className="space-y-2">
                            {update.changelog.map((entry, i) => {
                              const Icon = changelogIcons[entry.type].icon;
                              return (
                                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                  <Icon className={`w-4 h-4 mt-0.5 ${changelogIcons[entry.type].color}`} />
                                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{entry.description}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {updates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">All apps are up to date</h3>
          <p className="text-neutral-500">You're running the latest versions</p>
        </motion.div>
      )}
    </div>
  );
}
