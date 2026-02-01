/**
 * WorkflowToolbar - Top toolbar for workflow editor
 * Contains workflow actions, run controls, and settings
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Play,
  Pause,
  Square,
  Bug,
  History,
  Settings,
  Download,
  Upload,
  Copy,
  Trash2,
  ChevronDown,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  AlertTriangle,
  Loader2,
  MoreVertical,
  FileJson,
  Share2,
  Clock,
  Eye,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { WorkflowStatus } from '../../types/workflow';

interface WorkflowToolbarProps {
  onShowHistory?: () => void;
  onShowSettings?: () => void;
}

export function WorkflowToolbar({ onShowHistory, onShowSettings }: WorkflowToolbarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    currentWorkflow,
    currentExecution,
    undoStack,
    redoStack,
    debugMode,
    updateWorkflow,
    saveWorkflow,
    executeWorkflow,
    stopExecution,
    undo,
    redo,
    toggleDebugMode,
    duplicateWorkflow,
    deleteWorkflow,
    validateWorkflow,
    zoomIn,
    zoomOut,
    fitToScreen,
    canvas,
  } = useWorkflowStore();

  if (!currentWorkflow) return null;

  const validation = validateWorkflow();
  const isRunning = currentExecution?.status === 'running';

  const handleSave = async () => {
    setIsSaving(true);
    saveWorkflow();
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleRun = () => {
    if (isRunning) {
      stopExecution(currentExecution!.id);
    } else {
      executeWorkflow(currentWorkflow.id);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(currentWorkflow, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDuplicate = () => {
    duplicateWorkflow(currentWorkflow.id);
    setShowMoreMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(currentWorkflow.id);
    }
    setShowMoreMenu(false);
  };

  const statusConfig: Record<WorkflowStatus, { label: string; color: string; icon: React.ReactNode }> = {
    draft: { label: 'Draft', color: 'bg-neutral-500', icon: <FileJson className="w-3.5 h-3.5" /> },
    active: { label: 'Active', color: 'bg-green-500', icon: <Check className="w-3.5 h-3.5" /> },
    paused: { label: 'Paused', color: 'bg-amber-500', icon: <Pause className="w-3.5 h-3.5" /> },
    archived: { label: 'Archived', color: 'bg-neutral-400', icon: <History className="w-3.5 h-3.5" /> },
  };

  return (
    <div className="h-14 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4">
      {/* Left Section - Workflow Info */}
      <div className="flex items-center gap-4">
        {/* Workflow Name */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {currentWorkflow.name}
          </h1>

          {/* Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${statusConfig[currentWorkflow.status].color}`}
            >
              {statusConfig[currentWorkflow.status].icon}
              {statusConfig[currentWorkflow.status].label}
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showStatusMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-36 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50"
                >
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateWorkflow(currentWorkflow.id, { status: status as WorkflowStatus });
                        setShowStatusMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                        currentWorkflow.status === status
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${config.color}`} />
                      {config.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Validation Status */}
          {!validation.isValid && (
            <div className="flex items-center gap-1 text-amber-500" title={validation.errors.join('\n')}>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">{validation.errors.length} issues</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </button>
        </div>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        {/* Zoom Controls */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg">
          <button
            onClick={zoomOut}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-l-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </button>
          <span className="px-2 text-xs text-neutral-600 dark:text-neutral-300 min-w-[50px] text-center">
            {Math.round(canvas.zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </button>
          <button
            onClick={fitToScreen}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-r-lg"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </button>
        </div>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        {/* Debug Mode */}
        <button
          onClick={toggleDebugMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            debugMode
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
          title="Toggle Debug Mode"
        >
          <Bug className="w-4 h-4" />
          Debug
        </button>
      </div>

      {/* Right Section - Run & Save */}
      <div className="flex items-center gap-3">
        {/* History */}
        <button
          onClick={onShowHistory}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          title="Execution History"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button
          onClick={onShowSettings}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          title="Workflow Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50"
              >
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Workflow
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>

        {/* Run Button */}
        <motion.button
          onClick={handleRun}
          disabled={!validation.isValid && !isRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run
            </>
          )}
        </motion.button>
      </div>

      {/* Close menus on outside click */}
      {(showStatusMenu || showMoreMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStatusMenu(false);
            setShowMoreMenu(false);
          }}
        />
      )}
    </div>
  );
}

export default WorkflowToolbar;
