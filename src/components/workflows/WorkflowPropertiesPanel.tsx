/**
 * WorkflowPropertiesPanel - Node configuration popup modal
 * Clean, organized modal UI for configuring workflow nodes
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Zap,
  ChevronDown,
  Variable,
  Play,
  RefreshCw,
  Timer,
  ShieldAlert,
  BookOpen,
  TestTube,
  Cog,
  Maximize2,
  Minimize2,
  Link,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useWorkflowStore, nodeRegistry } from '../../store/workflowStore';
import type { RetryPolicy, TimeoutPolicy } from '../../types/workflow';
import { WorkflowNodeHelp } from './WorkflowNodeHelp';
import { getNodeBuilder } from './NodeConfigBuilders';

interface WorkflowPropertiesPanelProps {
  onClose: () => void;
}

export function WorkflowPropertiesPanel({ onClose }: WorkflowPropertiesPanelProps) {
  const {
    currentWorkflow,
    selectedNodeForConfig,
    updateNode,
    addConnection,
    deleteConnection,
  } = useWorkflowStore();

  const node = currentWorkflow?.nodes.find((n) => n.id === selectedNodeForConfig);
  const nodeDefinition = node ? nodeRegistry.find((d) => d.type === node.type) : null;

  const [activeTab, setActiveTab] = useState<'config' | 'advanced' | 'test'>('config');
  const [expandedSections, setExpandedSections] = useState<string[]>(['retry', 'timeout', 'error']);
  const [showHelp, setShowHelp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get all available output connectors from other nodes
  const getAvailableOutputs = () => {
    if (!currentWorkflow || !node) return [];

    const outputs: Array<{
      nodeId: string;
      nodeName: string;
      nodeColor: string;
      portId: string;
      portLabel: string;
    }> = [];

    currentWorkflow.nodes.forEach((n) => {
      if (n.id !== node.id) {
        n.outputs.forEach((output) => {
          outputs.push({
            nodeId: n.id,
            nodeName: n.config?.label || n.name,
            nodeColor: n.color,
            portId: output.id,
            portLabel: output.label,
          });
        });
      }
    });

    return outputs;
  };

  const availableOutputs = getAvailableOutputs();

  // Get current connection for each input port
  const getInputConnection = (inputPortId: string) => {
    if (!currentWorkflow || !node) return null;
    return currentWorkflow.connections.find(
      (conn) => conn.targetNodeId === node.id && conn.targetPortId === inputPortId
    );
  };

  // Handle input mapping change - creates or updates connection
  const handleInputMappingChange = (inputPortId: string, selectedValue: string) => {
    if (!node) return;

    // Remove existing connection for this input if any
    const existingConnection = getInputConnection(inputPortId);
    if (existingConnection) {
      deleteConnection(existingConnection.id);
    }

    // If user selected a new output, create the connection
    if (selectedValue) {
      const [sourceNodeId, sourcePortId] = selectedValue.split('::');
      addConnection(sourceNodeId, sourcePortId, node.id, inputPortId);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // No node selected - don't render
  if (!node || !nodeDefinition) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const updateConfig = (key: string, value: any) => {
    updateNode(node.id, {
      config: { ...node.config, [key]: value },
    });
  };

  const updateRetryPolicy = (updates: Partial<RetryPolicy>) => {
    updateNode(node.id, {
      config: {
        ...node.config,
        retryPolicy: { ...node.config.retryPolicy, ...updates },
      },
    });
  };

  const updateTimeoutPolicy = (updates: Partial<TimeoutPolicy>) => {
    updateNode(node.id, {
      config: {
        ...node.config,
        timeout: { ...node.config.timeout, ...updates },
      },
    });
  };

  const modalWidth = isExpanded ? 'max-w-4xl' : 'max-w-xl';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal Container - Flex centering */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className={`w-full ${modalWidth} max-h-[85vh] flex flex-col pointer-events-auto`}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
            <div className="flex items-center gap-4">
              {/* Node Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Cog className="w-6 h-6 text-white" />
              </div>

              {/* Node Info */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={node.config.label || node.name}
                  onChange={(e) => updateConfig('label', e.target.value)}
                  className="w-full font-semibold text-lg text-neutral-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  placeholder={node.name}
                />
                <p className="text-sm text-neutral-400 capitalize">
                  {node.type.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHelp(true)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-500 transition-colors"
                  title="Documentation"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  title={isExpanded ? 'Compact view' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 hover:text-red-500 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <TabButton
                active={activeTab === 'config'}
                onClick={() => setActiveTab('config')}
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
              />
              <TabButton
                active={activeTab === 'advanced'}
                onClick={() => setActiveTab('advanced')}
                icon={<Zap className="w-4 h-4" />}
                label="Advanced"
              />
              <TabButton
                active={activeTab === 'test'}
                onClick={() => setActiveTab('test')}
                icon={<TestTube className="w-4 h-4" />}
                label="Test"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'config' && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-5"
                >
                  {/* Input Mappings - Connect inputs to outputs from other nodes */}
                  {node.inputs.length > 0 && (
                    <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Input Mappings
                        </span>
                      </div>
                      <div className="space-y-3">
                        {node.inputs.map((input) => {
                          const currentConnection = getInputConnection(input.id);
                          const connectedOutput = currentConnection
                            ? `${currentConnection.sourceNodeId}::${currentConnection.sourcePortId}`
                            : '';
                          const sourceNode = currentConnection
                            ? currentWorkflow?.nodes.find((n) => n.id === currentConnection.sourceNodeId)
                            : null;

                          return (
                            <div
                              key={input.id}
                              className="p-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full bg-primary-500" />
                                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                  {input.label}
                                </span>
                                <span className="text-xs text-neutral-400">({input.type})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                <select
                                  value={connectedOutput}
                                  onChange={(e) => handleInputMappingChange(input.id, e.target.value)}
                                  className="form-select text-sm flex-1"
                                >
                                  <option value="">-- Not connected --</option>
                                  {availableOutputs.map((output) => (
                                    <option
                                      key={`${output.nodeId}::${output.portId}`}
                                      value={`${output.nodeId}::${output.portId}`}
                                    >
                                      {output.nodeName} → {output.portLabel}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {sourceNode && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${sourceNode.color} flex items-center justify-center`}>
                                    <ArrowRight className="w-2 h-2 text-white" />
                                  </div>
                                  Connected to: {sourceNode.config?.label || sourceNode.name}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-primary-600 dark:text-primary-400">
                        Select which output from other nodes to connect to each input
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <FormField label="Description">
                    <textarea
                      value={node.config.description || ''}
                      onChange={(e) => updateConfig('description', e.target.value)}
                      placeholder="Describe what this node does..."
                      className="form-textarea"
                      rows={2}
                    />
                  </FormField>

                  {/* Dynamic Config Fields */}
                  <div className={isExpanded ? 'grid grid-cols-2 gap-5' : 'space-y-5'}>
                    {(() => {
                      const NodeBuilder = getNodeBuilder(node.type);
                      if (NodeBuilder) {
                        return <NodeBuilder config={node.config} onChange={updateConfig} />;
                      }

                      return nodeDefinition.configSchema.fields.map((field) => (
                        <FormField key={field.name} label={field.label} required={field.required}>
                          {field.type === 'string' && (
                            <input
                              type="text"
                              value={node.config[field.name] || field.defaultValue || ''}
                              onChange={(e) => updateConfig(field.name, e.target.value)}
                              placeholder={field.description}
                              className="form-input"
                            />
                          )}

                          {field.type === 'number' && (
                            <input
                              type="number"
                              value={node.config[field.name] ?? field.defaultValue ?? ''}
                              onChange={(e) => updateConfig(field.name, Number(e.target.value))}
                              className="form-input"
                            />
                          )}

                          {field.type === 'boolean' && (
                            <ToggleSwitch
                              checked={node.config[field.name] ?? field.defaultValue ?? false}
                              onChange={(checked) => updateConfig(field.name, checked)}
                              label={field.description || 'Enabled'}
                            />
                          )}

                          {field.type === 'select' && (
                            <select
                              value={node.config[field.name] || field.defaultValue || ''}
                              onChange={(e) => updateConfig(field.name, e.target.value)}
                              className="form-select"
                            >
                              <option value="">Select...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          )}

                          {field.type === 'expression' && (
                            <div className="relative">
                              <input
                                type="text"
                                value={node.config[field.name] || ''}
                                onChange={(e) => updateConfig(field.name, e.target.value)}
                                placeholder="Use {{ variable }} for dynamic values"
                                className="form-input pl-10 font-mono text-sm"
                              />
                              <Variable className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            </div>
                          )}

                          {field.type === 'code' && (
                            <textarea
                              value={node.config[field.name] || ''}
                              onChange={(e) => updateConfig(field.name, e.target.value)}
                              placeholder={field.description}
                              className="form-textarea font-mono text-sm"
                              rows={4}
                            />
                          )}

                          {field.type === 'json' && (
                            <textarea
                              value={
                                typeof node.config[field.name] === 'string'
                                  ? node.config[field.name]
                                  : JSON.stringify(node.config[field.name] || field.defaultValue || {}, null, 2)
                              }
                              onChange={(e) => {
                                try {
                                  updateConfig(field.name, JSON.parse(e.target.value));
                                } catch {
                                  updateConfig(field.name, e.target.value);
                                }
                              }}
                              placeholder="{}"
                              className="form-textarea font-mono text-sm"
                              rows={4}
                            />
                          )}

                          {field.description && field.type !== 'boolean' && (
                            <p className="text-xs text-neutral-400 mt-1.5">{field.description}</p>
                          )}
                        </FormField>
                      ));
                    })()}
                  </div>
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-4"
                >
                  {/* Retry Policy */}
                  <SettingsCard
                    title="Retry Policy"
                    icon={<RefreshCw className="w-4 h-4" />}
                    isExpanded={expandedSections.includes('retry')}
                    onToggle={() => toggleSection('retry')}
                  >
                    <ToggleSwitch
                      checked={node.config.retryPolicy?.enabled ?? false}
                      onChange={(checked) => updateRetryPolicy({ enabled: checked })}
                      label="Enable automatic retries"
                    />

                    {node.config.retryPolicy?.enabled && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 grid grid-cols-3 gap-4">
                        <FormField label="Max Attempts" compact>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={node.config.retryPolicy?.maxAttempts ?? 3}
                            onChange={(e) => updateRetryPolicy({ maxAttempts: Number(e.target.value) })}
                            className="form-input"
                          />
                        </FormField>
                        <FormField label="Initial Delay (ms)" compact>
                          <input
                            type="number"
                            min={100}
                            value={node.config.retryPolicy?.initialDelay ?? 1000}
                            onChange={(e) => updateRetryPolicy({ initialDelay: Number(e.target.value) })}
                            className="form-input"
                          />
                        </FormField>
                        <FormField label="Backoff Type" compact>
                          <select
                            value={node.config.retryPolicy?.backoffType ?? 'exponential'}
                            onChange={(e) => updateRetryPolicy({ backoffType: e.target.value as any })}
                            className="form-select"
                          >
                            <option value="fixed">Fixed</option>
                            <option value="exponential">Exponential</option>
                            <option value="linear">Linear</option>
                          </select>
                        </FormField>
                      </div>
                    )}
                  </SettingsCard>

                  {/* Timeout */}
                  <SettingsCard
                    title="Timeout"
                    icon={<Timer className="w-4 h-4" />}
                    isExpanded={expandedSections.includes('timeout')}
                    onToggle={() => toggleSection('timeout')}
                  >
                    <ToggleSwitch
                      checked={node.config.timeout?.enabled ?? false}
                      onChange={(checked) => updateTimeoutPolicy({ enabled: checked })}
                      label="Enable execution timeout"
                    />

                    {node.config.timeout?.enabled && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 grid grid-cols-2 gap-4">
                        <FormField label="Duration (ms)" compact>
                          <input
                            type="number"
                            min={1000}
                            value={node.config.timeout?.duration ?? 30000}
                            onChange={(e) => updateTimeoutPolicy({ duration: Number(e.target.value) })}
                            className="form-input"
                          />
                        </FormField>
                        <FormField label="On Timeout" compact>
                          <select
                            value={node.config.timeout?.action ?? 'fail'}
                            onChange={(e) => updateTimeoutPolicy({ action: e.target.value as any })}
                            className="form-select"
                          >
                            <option value="fail">Fail</option>
                            <option value="skip">Skip</option>
                            <option value="retry">Retry</option>
                          </select>
                        </FormField>
                      </div>
                    )}
                  </SettingsCard>

                  {/* Error Handling */}
                  <SettingsCard
                    title="Error Handling"
                    icon={<ShieldAlert className="w-4 h-4" />}
                    isExpanded={expandedSections.includes('error')}
                    onToggle={() => toggleSection('error')}
                  >
                    <FormField label="On Error" compact>
                      <select
                        value={node.config.errorHandling?.onError ?? 'stop'}
                        onChange={(e) =>
                          updateConfig('errorHandling', {
                            ...node.config.errorHandling,
                            onError: e.target.value,
                          })
                        }
                        className="form-select"
                      >
                        <option value="stop">Stop Workflow</option>
                        <option value="continue">Continue</option>
                        <option value="retry">Retry</option>
                        <option value="fallback">Use Fallback</option>
                      </select>
                    </FormField>

                    <div className="mt-4 flex flex-wrap gap-4">
                      <ToggleSwitch
                        checked={node.config.errorHandling?.logError ?? true}
                        onChange={(checked) =>
                          updateConfig('errorHandling', {
                            ...node.config.errorHandling,
                            logError: checked,
                          })
                        }
                        label="Log errors"
                      />
                      <ToggleSwitch
                        checked={node.config.errorHandling?.notifyOnError ?? false}
                        onChange={(checked) =>
                          updateConfig('errorHandling', {
                            ...node.config.errorHandling,
                            notifyOnError: checked,
                          })
                        }
                        label="Send notification"
                      />
                    </div>
                  </SettingsCard>

                  {/* Disable Node */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <ToggleSwitch
                      checked={node.config.disabled ?? false}
                      onChange={(checked) => updateConfig('disabled', checked)}
                      label="Disable this node"
                      variant="warning"
                    />
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 ml-10">
                      Node will be skipped during workflow execution
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'test' && (
                <motion.div
                  key="test"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-5"
                >
                  {/* Test Runner Card */}
                  <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700 p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                          Test Node Execution
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Run this node in isolation with sample data
                        </p>
                      </div>
                    </div>
                    <button className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Run Test
                    </button>
                  </div>

                  <div className={isExpanded ? 'grid grid-cols-2 gap-5' : 'space-y-5'}>
                    {/* Test Input */}
                    <FormField label="Test Input Data">
                      <textarea
                        placeholder='{"key": "value"}'
                        className="form-textarea font-mono text-sm"
                        rows={6}
                      />
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Enter JSON data to simulate input from previous nodes
                      </p>
                    </FormField>

                    {/* Output Preview */}
                    <FormField label="Output Preview">
                      <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-4 min-h-[160px] font-mono text-sm">
                        <p className="text-neutral-400 italic">
                          Run a test to see the output...
                        </p>
                      </div>
                    </FormField>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
          </div>
        </motion.div>
      </div>

      {/* Help Panel */}
      <WorkflowNodeHelp
        nodeType={node.type}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
}

// === Reusable Components ===

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
        active
          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
          : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FormField({
  label,
  required,
  compact,
  children,
}: {
  label: string;
  required?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 ${compact ? 'mb-1.5' : 'mb-2'}`}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  variant = 'default',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  variant?: 'default' | 'warning';
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked
            ? variant === 'warning'
              ? 'bg-amber-500'
              : 'bg-primary-500'
            : 'bg-neutral-200 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}

function SettingsCard({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <span className="text-neutral-400">{icon}</span>
        <span className="flex-1 text-left font-medium text-neutral-800 dark:text-neutral-200">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-neutral-900">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorkflowPropertiesPanel;
