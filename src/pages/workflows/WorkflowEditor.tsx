/**
 * WorkflowEditor - Full-screen workflow editor
 * Combines canvas, sidebar, toolbar, and properties panel
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  PanelLeft,
  PanelRight,
  Settings,
  History,
  X,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  WorkflowCanvas,
  WorkflowSidebar,
  WorkflowToolbar,
  WorkflowPropertiesPanel,
} from '../../components/workflows';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button, Badge } from '../../design-system';
import type { WorkflowExecution } from '../../types/workflow';

export function WorkflowEditor() {
  const {
    currentWorkflow,
    setCurrentWorkflow,
    isSidebarOpen,
    isPropertiesPanelOpen,
    toggleSidebar,
    togglePropertiesPanel,
    executions,
    currentExecution,
  } = useWorkflowStore();

  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Get executions for current workflow
  const workflowExecutions = executions.filter(
    (e) => e.workflowId === currentWorkflow?.id
  ).slice(0, 20);

  if (!currentWorkflow) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 px-4 h-14 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        {/* Back Button */}
        <button
          onClick={() => setCurrentWorkflow(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Workflows</span>
        </button>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-2" />

        {/* Toggle Sidebar */}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            isSidebarOpen
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
          title="Toggle Node Palette"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Main Toolbar */}
        <div className="flex-1">
          <WorkflowToolbar
            onShowHistory={() => setShowHistory(true)}
            onShowSettings={() => setShowSettings(true)}
          />
        </div>

        {/* Toggle Properties Panel */}
        <button
          onClick={togglePropertiesPanel}
          className={`p-2 rounded-lg transition-colors ${
            isPropertiesPanelOpen
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
          title="Toggle Properties Panel"
        >
          <PanelRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <WorkflowSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <WorkflowCanvas className="w-full h-full" />
        </div>
      </div>

      {/* Execution Status Bar */}
      {currentExecution && (
        <ExecutionStatusBar execution={currentExecution} />
      )}

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <HistoryPanel
            executions={workflowExecutions}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      {/* Properties Panel (Modal) */}
      <AnimatePresence>
        {isPropertiesPanelOpen && (
          <WorkflowPropertiesPanel onClose={togglePropertiesPanel} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Execution Status Bar
function ExecutionStatusBar({ execution }: { execution: WorkflowExecution }) {
  const { stopExecution } = useWorkflowStore();

  const getStatusColor = () => {
    switch (execution.status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-amber-500';
      default:
        return 'bg-neutral-500';
    }
  };

  const getStatusIcon = () => {
    switch (execution.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 48 }}
      animate={{ y: 0 }}
      exit={{ y: 48 }}
      className={`${getStatusColor()} text-white px-4 py-2 flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className="font-medium">
          {execution.status === 'running' ? 'Executing workflow...' : `Execution ${execution.status}`}
        </span>
        {execution.duration && (
          <span className="text-white/80">({execution.duration}ms)</span>
        )}
      </div>

      {execution.status === 'running' && (
        <button
          onClick={() => stopExecution(execution.id)}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          Stop
        </button>
      )}
    </motion.div>
  );
}

// History Panel
function HistoryPanel({
  executions,
  onClose,
}: {
  executions: WorkflowExecution[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Execution History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {executions.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <p className="text-neutral-500">No executions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {executions.map((execution) => (
                <ExecutionHistoryItem key={execution.id} execution={execution} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExecutionHistoryItem({ execution }: { execution: WorkflowExecution }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = () => {
    const config: Record<string, { variant: any; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      running: { variant: 'info', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      completed: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
      failed: { variant: 'danger', icon: <XCircle className="w-3 h-3" /> },
      cancelled: { variant: 'warning', icon: <AlertTriangle className="w-3 h-3" /> },
    };
    const c = config[execution.status] || config.pending;
    return (
      <Badge variant={c.variant} size="sm" className="flex items-center gap-1">
        {c.icon}
        {execution.status}
      </Badge>
    );
  };

  return (
    <div className="p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <div>
            <p className="text-sm text-neutral-500">
              {new Date(execution.startedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {execution.duration && (
            <span className="text-sm text-neutral-500">{execution.duration}ms</span>
          )}
          <ChevronRight
            className={`w-4 h-4 text-neutral-400 transition-transform ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pl-4 border-l-2 border-neutral-200 dark:border-neutral-700"
          >
            <div className="space-y-2">
              {execution.nodeExecutions.map((nodeExec) => (
                <div
                  key={nodeExec.nodeId}
                  className="flex items-center gap-2 text-sm"
                >
                  {nodeExec.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : nodeExec.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-neutral-400" />
                  )}
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {nodeExec.nodeName}
                  </span>
                  {nodeExec.duration && (
                    <span className="text-neutral-400">({nodeExec.duration}ms)</span>
                  )}
                </div>
              ))}
            </div>

            {execution.error && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                {execution.error.message}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Settings Panel
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { currentWorkflow, updateWorkflow } = useWorkflowStore();

  if (!currentWorkflow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Workflow Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              value={currentWorkflow.name}
              onChange={(e) => updateWorkflow(currentWorkflow.id, { name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              value={currentWorkflow.description}
              onChange={(e) => updateWorkflow(currentWorkflow.id, { description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 resize-none"
            />
          </div>

          {/* Execution Settings */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-3">
              Execution Settings
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Max Execution Time (ms)
                </label>
                <input
                  type="number"
                  value={currentWorkflow.settings.maxExecutionTime}
                  onChange={(e) =>
                    updateWorkflow(currentWorkflow.id, {
                      settings: {
                        ...currentWorkflow.settings,
                        maxExecutionTime: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Max Retries
                </label>
                <input
                  type="number"
                  value={currentWorkflow.settings.maxRetries}
                  onChange={(e) =>
                    updateWorkflow(currentWorkflow.id, {
                      settings: {
                        ...currentWorkflow.settings,
                        maxRetries: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Log Level
                </label>
                <select
                  value={currentWorkflow.settings.logLevel}
                  onChange={(e) =>
                    updateWorkflow(currentWorkflow.id, {
                      settings: {
                        ...currentWorkflow.settings,
                        logLevel: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                >
                  <option value="none">None</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-3">
              Notifications
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentWorkflow.settings.notifications.onSuccess}
                  onChange={(e) =>
                    updateWorkflow(currentWorkflow.id, {
                      settings: {
                        ...currentWorkflow.settings,
                        notifications: {
                          ...currentWorkflow.settings.notifications,
                          onSuccess: e.target.checked,
                        },
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Notify on success
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentWorkflow.settings.notifications.onFailure}
                  onChange={(e) =>
                    updateWorkflow(currentWorkflow.id, {
                      settings: {
                        ...currentWorkflow.settings,
                        notifications: {
                          ...currentWorkflow.settings.notifications,
                          onFailure: e.target.checked,
                        },
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Notify on failure
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default WorkflowEditor;
