/**
 * WorkflowNode - Individual workflow node component
 * Displays node with ports, handles drag/drop, and connection interactions
 */

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  MoreHorizontal,
  Trash2,
  Copy,
  Settings,
  Bug,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { WorkflowNode, Position, ExecutionStatus } from '../../types/workflow';

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

// Get important config keys to display based on node type
const getImportantConfigKeys = (nodeType: string): string[] => {
  const configMap: Record<string, string[]> = {
    // Triggers
    schedule: ['scheduleType', 'cron'],
    webhook: ['path', 'method'],
    event: ['eventSource', 'eventType'],
    // Actions
    http_request: ['url', 'method'],
    database_query: ['operation', 'table'],
    send_email: ['to', 'subject'],
    create_content: ['contentType'],
    // AI
    ai_text_gen: ['temperature', 'maxTokens'],
    ai_image_gen: ['size', 'quality'],
    ai_embeddings: ['dimensions'],
    ai_analyze: ['analysisType'],
    ai_chat: ['temperature', 'maxTokens'],
    ai_vision: ['detail'],
    ai_transcribe: ['language', 'timestamps'],
    ai_tts: ['voice', 'speed'],
    ai_moderation: ['threshold'],
    // Logic
    if_else: ['condition'],
    switch: ['expression'],
    loop: ['maxIterations', 'parallel'],
    delay: ['duration'],
    // Utility
    retry: ['maxAttempts', 'backoffType'],
    log: ['level'],
    // Default
    default: [],
  };
  return configMap[nodeType] || configMap.default;
};

interface WorkflowNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  isHovered: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  canvasZoom: number;
  executionOrder?: number; // Optional execution order in the workflow
}

export function WorkflowNodeComponent({
  node,
  isSelected,
  isHovered,
  isConnecting,
  onSelect,
  canvasZoom,
  executionOrder,
}: WorkflowNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    moveNode,
    deleteNode,
    duplicateNodes,
    setSelectedNodeForConfig,
    startConnecting,
    stopConnecting,
    addConnection,
    setHoveredPort,
    canvas,
    breakpoints,
    toggleBreakpoint,
    debugMode,
  } = useWorkflowStore();

  const Icon = iconMap[node.icon] || Play;
  const nodeWidth = node.size?.width || 200;
  const nodeHeight = node.size?.height || 80;
  const hasBreakpoint = breakpoints.includes(node.id);

  // Handle mouse down to start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect();

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  }, [onSelect]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const canvas = nodeRef.current?.parentElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragOffset.x * canvasZoom) / canvasZoom;
    const y = (e.clientY - rect.top - dragOffset.y * canvasZoom) / canvasZoom;

    // Snap to grid (20px)
    const snappedX = Math.round(x / 20) * 20;
    const snappedY = Math.round(y / 20) * 20;

    moveNode(node.id, { x: snappedX, y: snappedY });
  }, [isDragging, dragOffset, canvasZoom, moveNode, node.id]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle port mouse down to start drag connection
  const handlePortMouseDown = useCallback((portId: string, portType: 'input' | 'output', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Start connection drag
    startConnecting(node.id, portId, portType);
  }, [node.id, startConnecting]);

  // Handle port mouse up to complete connection (when dragging onto a port)
  const handlePortMouseUp = useCallback((portId: string, portType: 'input' | 'output', e: React.MouseEvent) => {
    e.stopPropagation();

    if (canvas.connectingFrom) {
      // Complete connection if valid (different port types and different nodes)
      if (canvas.connectingFrom.portType !== portType && canvas.connectingFrom.nodeId !== node.id) {
        if (portType === 'input') {
          // Dragged from output to input
          addConnection(
            canvas.connectingFrom.nodeId,
            canvas.connectingFrom.portId,
            node.id,
            portId
          );
        } else {
          // Dragged from input to output
          addConnection(
            node.id,
            portId,
            canvas.connectingFrom.nodeId,
            canvas.connectingFrom.portId
          );
        }
      }
      stopConnecting();
    }
  }, [canvas.connectingFrom, node.id, addConnection, stopConnecting]);

  // Handle port hover for drag-and-drop connection (track hovered port)
  const handlePortMouseEnter = useCallback((portId: string, portType: 'input' | 'output') => {
    // Only track hovered port when actively connecting
    if (canvas.connectingFrom) {
      setHoveredPort({ nodeId: node.id, portId, portType });
    }
  }, [canvas.connectingFrom, node.id, setHoveredPort]);

  const handlePortMouseLeave = useCallback(() => {
    if (canvas.connectingFrom) {
      setHoveredPort(null);
    }
  }, [canvas.connectingFrom, setHoveredPort]);

  // Get execution status indicator
  const getStatusIndicator = () => {
    if (!node.executionStatus) return null;

    const statusConfig: Record<ExecutionStatus, { icon: React.ReactNode; color: string }> = {
      pending: { icon: <Clock className="w-3 h-3" />, color: 'text-neutral-400' },
      running: { icon: <Loader2 className="w-3 h-3 animate-spin" />, color: 'text-blue-500' },
      completed: { icon: <CheckCircle className="w-3 h-3" />, color: 'text-green-500' },
      failed: { icon: <XCircle className="w-3 h-3" />, color: 'text-red-500' },
      cancelled: { icon: <AlertCircle className="w-3 h-3" />, color: 'text-amber-500' },
      paused: { icon: <Clock className="w-3 h-3" />, color: 'text-purple-500' },
    };

    const config = statusConfig[node.executionStatus];
    return (
      <div className={`absolute -top-1 -right-1 ${config.color}`}>
        {config.icon}
      </div>
    );
  };

  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`absolute cursor-move select-none ${isDragging ? 'z-50' : 'z-10'}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: nodeWidth,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Main Node Container */}
      <div
        className={`
          relative rounded-xl overflow-hidden transition-all duration-200
          ${isSelected
            ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-neutral-50 dark:ring-offset-neutral-900'
            : 'hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600'
          }
          ${node.config.disabled ? 'opacity-50' : ''}
          ${isDragging ? 'shadow-2xl' : 'shadow-lg'}
          bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700
        `}
      >
        {/* Color Bar */}
        <div className={`h-1.5 bg-gradient-to-r ${node.color}`} />

        {/* Execution Order Badge - Shows step number */}
        {executionOrder !== undefined && (
          <div className="absolute -top-3 -left-3 z-20 flex items-center justify-center">
            <div className="relative">
              {/* Badge background with arrow shape */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 flex items-center justify-center border-2 border-white dark:border-neutral-900">
                <span className="text-xs font-bold text-white">{executionOrder}</span>
              </div>
              {/* Arrow pointing right */}
              <svg className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-primary-500" viewBox="0 0 12 12">
                <path d="M0 6 L10 6 M7 3 L10 6 L7 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        {/* Breakpoint Indicator */}
        {hasBreakpoint && (
          <div className={`absolute top-3 ${executionOrder !== undefined ? 'left-6' : 'left-3'} w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-neutral-800`} />
        )}

        {/* Execution Status */}
        {getStatusIndicator()}

        {/* Node Content */}
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2 rounded-lg bg-gradient-to-br ${node.color} flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white stroke-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                {node.config.label || node.name}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {node.type.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Collapse Toggle Button */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              title={isExpanded ? 'Collapse node' : 'Expand node'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Menu Button */}
            <div className="relative">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setSelectedNodeForConfig(node.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                  <button
                    onClick={() => {
                      duplicateNodes([node.id]);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  {debugMode && (
                    <button
                      onClick={() => {
                        toggleBreakpoint(node.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <Bug className="w-4 h-4" />
                      {hasBreakpoint ? 'Remove Breakpoint' : 'Add Breakpoint'}
                    </button>
                  )}
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                  <button
                    onClick={() => {
                      deleteNode(node.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Execution Duration */}
          {node.executionDuration !== undefined && (
            <div className="mt-2 text-xs text-neutral-400">
              {node.executionDuration}ms
            </div>
          )}

          {/* Expandable Config Specs */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700 overflow-hidden"
              >
                {(() => {
                  const importantKeys = getImportantConfigKeys(node.type);
                  const configEntries = importantKeys
                    .filter(key => node.config[key] !== undefined && node.config[key] !== '')
                    .map(key => ({
                      key,
                      value: node.config[key],
                    }));

                  if (configEntries.length === 0) {
                    return (
                      <p className="text-xs text-neutral-400 italic">
                        Double-click to configure
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-1">
                      {configEntries.map(({ key, value }) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="text-neutral-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[100px]">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Ports - Left side with arrow indicator */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col gap-3">
          {node.inputs.map((port, index) => (
            <div key={port.id} className="relative group">
              {/* Input arrow indicator */}
              <svg
                className={`absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 transition-opacity ${
                  port.connected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                }`}
                viewBox="0 0 12 12"
              >
                <path
                  d="M0 6 L8 6 M5 3 L8 6 L5 9"
                  className={port.connected ? 'stroke-primary-500' : 'stroke-neutral-400'}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <button
                onMouseDown={(e) => handlePortMouseDown(port.id, 'input', e)}
                onMouseUp={(e) => handlePortMouseUp(port.id, 'input', e)}
                onMouseEnter={() => handlePortMouseEnter(port.id, 'input')}
                onMouseLeave={handlePortMouseLeave}
                className={`
                  w-5 h-5 rounded-full border-2 transition-all shadow-sm cursor-crosshair
                  ${port.connected
                    ? 'bg-primary-500 border-primary-400 shadow-primary-500/30'
                    : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-500'
                  }
                  ${isConnecting && canvas.connectingFrom?.portType === 'output'
                    ? 'ring-4 ring-primary-500/40 scale-125 bg-primary-100 dark:bg-primary-900 border-primary-500'
                    : 'hover:scale-125 hover:border-primary-500 hover:ring-2 hover:ring-primary-300'
                  }
                  ${canvas.hoveredPort?.nodeId === node.id && canvas.hoveredPort?.portId === port.id
                    ? 'scale-150 bg-green-500 border-green-400 ring-4 ring-green-500/50'
                    : ''
                  }
                `}
                title={`${port.label || 'Input'} (drag to connect)`}
              />

              {/* Port label on hover */}
              <span className="absolute left-6 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {port.label || `Input ${index + 1}`}
              </span>
            </div>
          ))}
        </div>

        {/* Output Ports - Right side with arrow indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col gap-3">
          {node.outputs.map((port, index) => (
            <div key={port.id} className="relative group">
              <button
                onMouseDown={(e) => handlePortMouseDown(port.id, 'output', e)}
                onMouseUp={(e) => handlePortMouseUp(port.id, 'output', e)}
                onMouseEnter={() => handlePortMouseEnter(port.id, 'output')}
                onMouseLeave={handlePortMouseLeave}
                className={`
                  w-5 h-5 rounded-full border-2 transition-all shadow-sm cursor-crosshair
                  ${port.connected
                    ? 'bg-primary-500 border-primary-400 shadow-primary-500/30'
                    : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-500'
                  }
                  ${isConnecting && canvas.connectingFrom?.portType === 'input'
                    ? 'ring-4 ring-primary-500/40 scale-125 bg-primary-100 dark:bg-primary-900 border-primary-500'
                    : 'hover:scale-125 hover:border-primary-500 hover:ring-2 hover:ring-primary-300'
                  }
                  ${canvas.hoveredPort?.nodeId === node.id && canvas.hoveredPort?.portId === port.id
                    ? 'scale-150 bg-green-500 border-green-400 ring-4 ring-green-500/50'
                    : ''
                  }
                `}
                title={`${port.label || 'Output'} (drag to connect)`}
              />

              {/* Output arrow indicator */}
              <svg
                className={`absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-3 transition-opacity ${
                  port.connected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                }`}
                viewBox="0 0 12 12"
              >
                <path
                  d="M0 6 L8 6 M5 3 L8 6 L5 9"
                  className={port.connected ? 'stroke-primary-500' : 'stroke-neutral-400'}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Port label on hover */}
              <span className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {port.label || `Output ${index + 1}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Close menu on outside click */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
}

export default WorkflowNodeComponent;
