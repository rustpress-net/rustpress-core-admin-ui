/**
 * WorkflowNodeHelp - Comprehensive help panel for workflow nodes
 * Displays full documentation, examples, and setup guides
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  BookOpen,
  Code,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Play,
  Settings,
  Zap,
  Target,
  FileText,
  Info,
} from 'lucide-react';
import { getNodeDocumentation, type NodeDocumentation, type ConfigField, type NodeExample, type CommonIssue } from '../../types/workflowNodeDocs';

interface WorkflowNodeHelpProps {
  nodeType: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowNodeHelp({ nodeType, isOpen, onClose }: WorkflowNodeHelpProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'examples' | 'troubleshoot'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description']));
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const docs = getNodeDocumentation(nodeType);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!docs) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Node Help</h2>
                <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500">No documentation available for this node type.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'examples', label: 'Examples', icon: Code },
    { id: 'troubleshoot', label: 'Troubleshooting', icon: AlertCircle },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{docs.name}</h2>
                    <p className="text-sm text-neutral-500">{docs.category}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{docs.shortDescription}</p>
            </div>

            {/* Tabs */}
            <div className="flex px-4 gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'overview' && (
              <OverviewTab docs={docs} expandedSections={expandedSections} toggleSection={toggleSection} />
            )}
            {activeTab === 'config' && (
              <ConfigurationTab
                docs={docs}
                copyToClipboard={copyToClipboard}
                copiedText={copiedText}
              />
            )}
            {activeTab === 'examples' && (
              <ExamplesTab
                docs={docs}
                copyToClipboard={copyToClipboard}
                copiedText={copiedText}
              />
            )}
            {activeTab === 'troubleshoot' && (
              <TroubleshootingTab docs={docs} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Overview Tab Component
function OverviewTab({
  docs,
  expandedSections,
  toggleSection
}: {
  docs: NodeDocumentation;
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Full Description */}
      <CollapsibleSection
        title="Description"
        icon={FileText}
        isExpanded={expandedSections.has('description')}
        onToggle={() => toggleSection('description')}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {docs.fullDescription.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </CollapsibleSection>

      {/* Use Cases */}
      <CollapsibleSection
        title="Use Cases"
        icon={Target}
        isExpanded={expandedSections.has('usecases')}
        onToggle={() => toggleSection('usecases')}
      >
        <ul className="space-y-2">
          {docs.useCases.map((useCase, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-neutral-600 dark:text-neutral-400">{useCase}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Best Practices */}
      <CollapsibleSection
        title="Best Practices"
        icon={Lightbulb}
        isExpanded={expandedSections.has('bestpractices')}
        onToggle={() => toggleSection('bestpractices')}
      >
        <ul className="space-y-2">
          {docs.bestPractices.map((practice, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-neutral-600 dark:text-neutral-400">{practice}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Related Nodes */}
      {docs.relatedNodes.length > 0 && (
        <CollapsibleSection
          title="Related Nodes"
          icon={Zap}
          isExpanded={expandedSections.has('related')}
          onToggle={() => toggleSection('related')}
        >
          <div className="flex flex-wrap gap-2">
            {docs.relatedNodes.map((nodeId) => (
              <span
                key={nodeId}
                className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono text-neutral-600 dark:text-neutral-400"
              >
                {nodeId}
              </span>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// Configuration Tab Component
function ConfigurationTab({
  docs,
  copyToClipboard,
  copiedText
}: {
  docs: NodeDocumentation;
  copyToClipboard: (text: string, label: string) => void;
  copiedText: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Configure each field according to your needs. Required fields are marked with a red asterisk.
      </div>

      {docs.configuration.map((field, i) => (
        <ConfigFieldCard
          key={i}
          field={field}
          copyToClipboard={copyToClipboard}
          copiedText={copiedText}
        />
      ))}
    </div>
  );
}

// Config Field Card Component
function ConfigFieldCard({
  field,
  copyToClipboard,
  copiedText
}: {
  field: ConfigField;
  copyToClipboard: (text: string, label: string) => void;
  copiedText: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeColors: Record<string, string> = {
    string: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    number: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    boolean: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    select: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    json: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    code: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    cron: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    url: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    email: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    template: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-neutral-900 dark:text-white">
              {field.name}
            </span>
            {field.required && (
              <span className="text-red-500 text-sm">*</span>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[field.type] || typeColors.string}`}>
            {field.type}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="p-3 space-y-3 bg-neutral-50 dark:bg-neutral-800/50">
              {/* Description */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{field.description}</p>

              {/* Default Value */}
              {field.defaultValue !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Default:</span>
                  <code className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                    {String(field.defaultValue)}
                  </code>
                </div>
              )}

              {/* Placeholder/Example */}
              {field.placeholder && (
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500">Example:</span>
                  <div className="relative">
                    <pre className="p-2 bg-neutral-900 rounded text-xs text-neutral-300 overflow-x-auto">
                      {field.placeholder}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(field.placeholder!, field.name)}
                      className="absolute top-1 right-1 p-1 hover:bg-neutral-700 rounded"
                      title="Copy"
                    >
                      {copiedText === field.name ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Options for select type */}
              {field.options && field.options.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-neutral-500">Options:</span>
                  <div className="space-y-1">
                    {field.options.map((option, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
                        <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs font-medium">
                          {option.value}
                        </code>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{option.label}</span>
                          {option.description && (
                            <p className="text-xs text-neutral-500 mt-0.5">{option.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {field.tips && field.tips.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500">Tips:</span>
                  <ul className="space-y-1">
                    {field.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600 dark:text-neutral-400">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation */}
              {field.validation && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-amber-700 dark:text-amber-400">{field.validation}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Examples Tab Component
function ExamplesTab({
  docs,
  copyToClipboard,
  copiedText
}: {
  docs: NodeDocumentation;
  copyToClipboard: (text: string, label: string) => void;
  copiedText: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Ready-to-use configuration examples. Click to copy and adapt to your needs.
      </div>

      {docs.examples.map((example, i) => (
        <ExampleCard
          key={i}
          example={example}
          index={i}
          copyToClipboard={copyToClipboard}
          copiedText={copiedText}
        />
      ))}
    </div>
  );
}

// Example Card Component
function ExampleCard({
  example,
  index,
  copyToClipboard,
  copiedText
}: {
  example: NodeExample;
  index: number;
  copyToClipboard: (text: string, label: string) => void;
  copiedText: string | null;
}) {
  const configString = JSON.stringify(example.configuration, null, 2);
  const copyKey = `example-${index}`;

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent border-b border-neutral-200 dark:border-neutral-700">
        <h4 className="font-medium text-neutral-900 dark:text-white">{example.title}</h4>
        <p className="text-sm text-neutral-500 mt-1">{example.description}</p>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Configuration</span>
            <button
              onClick={() => copyToClipboard(configString, copyKey)}
              className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              {copiedText === copyKey ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-neutral-400" />
                  <span className="text-neutral-500">Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-neutral-900 rounded-lg text-xs text-neutral-300 overflow-x-auto">
            {configString}
          </pre>
        </div>

        {example.expectedOutput && (
          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-medium">Expected Output</span>
            <pre className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg text-xs text-green-400 overflow-x-auto">
              {example.expectedOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Troubleshooting Tab Component
function TroubleshootingTab({ docs }: { docs: NodeDocumentation }) {
  if (docs.commonIssues.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No Common Issues</h3>
        <p className="text-sm text-neutral-500">
          This node typically works without issues. If you encounter problems, check the configuration guide.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Common problems and their solutions. Check here first if something isn't working.
      </div>

      {docs.commonIssues.map((issue, i) => (
        <IssueCard key={i} issue={issue} />
      ))}
    </div>
  );
}

// Issue Card Component
function IssueCard({ issue }: { issue: CommonIssue }) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="font-medium text-red-700 dark:text-red-400">{issue.issue}</span>
        </div>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Cause</span>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{issue.cause}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Solution</span>
          <div className="flex items-start gap-2 mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-700 dark:text-green-400">{issue.solution}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary-500" />
          <span className="font-medium text-neutral-900 dark:text-white">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorkflowNodeHelp;
