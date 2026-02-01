/**
 * WorkflowSidebar - Node palette and workflow navigation
 * Drag nodes from here onto the canvas
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  Webhook,
  Radio,
  Globe,
  Database,
  Mail,
  FilePlus,
  Code,
  Puzzle,
  GitBranch,
  Split,
  Repeat,
  Layers,
  Merge,
  Shuffle,
  Filter,
  FileCode,
  Timer,
  RefreshCw,
  ShieldAlert,
  Variable,
  FileText,
  Server,
  Terminal,
  GitFork,
  Zap,
  Sparkles,
  Star,
  Box,
  // AI Icons
  Brain,
  Wand2,
  Image,
  Binary,
  ScanText,
  MessageSquare,
  Eye,
  Mic,
  Volume2,
} from 'lucide-react';
import { nodeRegistry } from '../../store/workflowStore';
import type { NodeCategory, NodeDefinition } from '../../types/workflow';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Play,
  Clock,
  Webhook,
  Radio,
  Globe,
  Database,
  Mail,
  FilePlus,
  Code,
  Puzzle,
  GitBranch,
  Split,
  Repeat,
  Layers,
  Merge,
  Shuffle,
  Filter,
  FileCode,
  Timer,
  RefreshCw,
  ShieldAlert,
  Variable,
  FileText,
  Server,
  Terminal,
  GitFork,
  // AI Icons
  Brain,
  Sparkles,
  Wand2,
  Image,
  Binary,
  ScanText,
  MessageSquare,
  Eye,
  Mic,
  Volume2,
};

interface WorkflowSidebarProps {
  onClose?: () => void;
}

const categoryConfig: Record<NodeCategory, { label: string; icon: React.ReactNode; color: string }> = {
  trigger: { label: 'Triggers', icon: <Zap className="w-4 h-4" />, color: 'text-green-500' },
  action: { label: 'Actions', icon: <Play className="w-4 h-4" />, color: 'text-blue-500' },
  logic: { label: 'Logic', icon: <GitBranch className="w-4 h-4" />, color: 'text-amber-500' },
  transform: { label: 'Transform', icon: <Shuffle className="w-4 h-4" />, color: 'text-purple-500' },
  utility: { label: 'Utilities', icon: <Box className="w-4 h-4" />, color: 'text-slate-500' },
  integration: { label: 'Integrations', icon: <Puzzle className="w-4 h-4" />, color: 'text-indigo-500' },
  ai: { label: 'AI & Machine Learning', icon: <Brain className="w-4 h-4" />, color: 'text-emerald-500' },
  custom: { label: 'Custom', icon: <Terminal className="w-4 h-4" />, color: 'text-gray-500' },
};

export function WorkflowSidebar({ onClose }: WorkflowSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<NodeCategory[]>([
    'trigger',
    'action',
    'logic',
  ]);

  // Group nodes by category
  const nodesByCategory = useMemo(() => {
    const grouped: Record<NodeCategory, NodeDefinition[]> = {
      trigger: [],
      action: [],
      logic: [],
      transform: [],
      utility: [],
      integration: [],
      ai: [],
      custom: [],
    };

    nodeRegistry.forEach((node) => {
      if (grouped[node.category]) {
        grouped[node.category].push(node);
      }
    });

    return grouped;
  }, []);

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodesByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: Record<NodeCategory, NodeDefinition[]> = {
      trigger: [],
      action: [],
      logic: [],
      transform: [],
      utility: [],
      integration: [],
      ai: [],
      custom: [],
    };

    Object.entries(nodesByCategory).forEach(([category, nodes]) => {
      filtered[category as NodeCategory] = nodes.filter(
        (node) =>
          node.name.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query)
      );
    });

    return filtered;
  }, [searchQuery, nodesByCategory]);

  // Toggle category expansion
  const toggleCategory = (category: NodeCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-72 h-full bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
          Node Palette
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(categoryConfig).map(([category, config]) => {
          const nodes = filteredNodes[category as NodeCategory];
          if (nodes.length === 0) return null;

          const isExpanded = expandedCategories.includes(category as NodeCategory);

          return (
            <div key={category} className="border-b border-neutral-100 dark:border-neutral-700/50">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category as NodeCategory)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <span className={config.color}>{config.icon}</span>
                <span className="flex-1 font-medium text-sm text-neutral-900 dark:text-white">
                  {config.label}
                </span>
                <span className="text-xs text-neutral-400 mr-2">{nodes.length}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {/* Nodes */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-2 space-y-1">
                      {nodes.map((node) => (
                        <NodePaletteItem
                          key={node.type}
                          node={node}
                          onDragStart={handleDragStart}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            <strong>Tip:</strong> Drag nodes onto the canvas to add them to your workflow. Double-click to configure.
          </p>
        </div>
      </div>
    </div>
  );
}

// Individual node item in palette
function NodePaletteItem({
  node,
  onDragStart,
}: {
  node: NodeDefinition;
  onDragStart: (e: React.DragEvent, nodeType: string) => void;
}) {
  const Icon = iconMap[node.icon] || Box;

  return (
    <motion.div
      draggable
      onDragStart={(e) => onDragStart(e as any, node.type)}
      className="flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg bg-gradient-to-br ${node.color} text-white flex-shrink-0`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
          {node.name}
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {node.description}
        </p>
      </div>

      {/* Drag indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="6" r="2" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
          <circle cx="8" cy="18" r="2" />
          <circle cx="16" cy="18" r="2" />
        </svg>
      </div>
    </motion.div>
  );
}

export default WorkflowSidebar;
