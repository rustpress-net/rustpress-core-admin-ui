/**
 * Alerts Dashboard Component
 * Manage and monitor system alerts
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { SearchFilterBar } from '../shared/SearchFilter';
import { Modal } from '../shared/Modal';
import { formatDuration } from '../shared/AnimatedCounter';
import type { Alert, AlertSeverity, AlertRule } from '../../types';

export function AlertsDashboard() {
  const { alerts, alertRules, acknowledgeAlert, dismissAlert, addAlertRule } = useQueueManagerStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | ''>('');
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    if (!showAcknowledged) {
      result = result.filter(a => !a.acknowledged);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.message.toLowerCase().includes(search)
      );
    }

    if (severityFilter) {
      result = result.filter(a => a.severity === severityFilter);
    }

    // Sort by timestamp, newest first
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return result;
  }, [alerts, searchTerm, severityFilter, showAcknowledged]);

  // Stats
  const stats = useMemo(() => ({
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length,
    info: alerts.filter(a => a.severity === 'info' && !a.acknowledged).length,
    total: alerts.filter(a => !a.acknowledged).length,
  }), [alerts]);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Alerts
          </h2>
          <p className="text-sm text-neutral-500">
            {stats.total} active alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateRuleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Alert Rule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.critical}
                </p>
                <p className="text-xs text-neutral-500">Critical</p>
              </div>
            </div>
            {stats.critical > 0 && (
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {stats.warning}
              </p>
              <p className="text-xs text-neutral-500">Warning</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.info}
              </p>
              <p className="text-xs text-neutral-500">Info</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {alertRules?.length || 0}
              </p>
              <p className="text-xs text-neutral-500">Alert Rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <SearchFilterBar
          search={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              key: 'severity',
              label: 'Severity',
              value: severityFilter,
              options: [
                { value: 'critical', label: 'Critical' },
                { value: 'warning', label: 'Warning' },
                { value: 'info', label: 'Info' },
              ],
              onChange: (value) => setSeverityFilter(value as AlertSeverity | ''),
            },
          ]}
        />
        <button
          onClick={() => setShowAcknowledged(!showAcknowledged)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            showAcknowledged
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          )}
        >
          {showAcknowledged ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showAcknowledged ? 'Showing All' : 'Hiding Acknowledged'}
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAlerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  styles.bg,
                  styles.border,
                  alert.acknowledged && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2 rounded-lg', styles.badge)}>
                    {getSeverityIcon(alert.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', styles.badge)}>
                        {alert.severity}
                      </span>
                      {alert.acknowledged && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(Date.now() - new Date(alert.timestamp).getTime())} ago
                      </span>
                      {alert.source && (
                        <span>Source: {alert.source}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 text-green-600"
                        title="Acknowledge"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 text-neutral-500 hover:text-red-500"
                      title="Dismiss"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-neutral-600 dark:text-neutral-400">
              {showAcknowledged ? 'No alerts found' : 'No active alerts'}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              System is running smoothly
            </p>
          </div>
        )}
      </div>

      {/* Create Alert Rule Modal */}
      <CreateAlertRuleModal
        isOpen={isCreateRuleOpen}
        onClose={() => setIsCreateRuleOpen(false)}
        onSubmit={addAlertRule}
      />
    </div>
  );
}

// Create Alert Rule Modal
interface CreateAlertRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rule: AlertRule) => void;
}

function CreateAlertRuleModal({ isOpen, onClose, onSubmit }: CreateAlertRuleModalProps) {
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('queue.messages.total');
  const [operator, setOperator] = useState<'gt' | 'lt' | 'eq'>('gt');
  const [threshold, setThreshold] = useState(1000);
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      name,
      enabled: true,
      condition: {
        metric,
        operator,
        threshold,
        duration,
      },
      severity,
      actions: [],
      createdAt: new Date().toISOString(),
    };
    onSubmit(rule);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setMetric('queue.messages.total');
    setOperator('gt');
    setThreshold(1000);
    setSeverity('warning');
    setDuration(60);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Alert Rule"
      description="Define conditions that trigger alerts"
      icon={<Bell className="w-5 h-5 text-primary-600" />}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Create Rule
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Rule Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., High message count alert"
            className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Metric
          </label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          >
            <option value="queue.messages.total">Queue Messages Total</option>
            <option value="queue.messages.ready">Queue Messages Ready</option>
            <option value="queue.messages.unacked">Queue Messages Unacked</option>
            <option value="queue.consumers">Queue Consumers</option>
            <option value="queue.memory">Queue Memory Usage</option>
            <option value="connection.count">Connection Count</option>
            <option value="channel.count">Channel Count</option>
            <option value="publish.rate">Publish Rate</option>
            <option value="deliver.rate">Deliver Rate</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Operator
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as typeof operator)}
              className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            >
              <option value="gt">Greater than</option>
              <option value="lt">Less than</option>
              <option value="eq">Equals</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Threshold
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
              className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Duration (s)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Severity
          </label>
          <div className="flex items-center gap-3">
            {(['critical', 'warning', 'info'] as AlertSeverity[]).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverity(sev)}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors',
                  severity === sev
                    ? sev === 'critical'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700'
                      : sev === 'warning'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AlertsDashboard;
