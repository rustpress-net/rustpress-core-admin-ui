/**
 * WorkflowsPage - Main Workflows Management Page
 * Enterprise workflow builder with visual editor
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Play,
  Pause,
  Clock,
  Zap,
  Webhook,
  Radio,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Folder,
  FolderPlus,
  Tag,
  Calendar,
  BarChart3,
  Activity,
  ChevronRight,
  Sparkles,
  FileJson,
  History,
  Settings,
  ArrowRight,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Badge,
} from '../../design-system';
import { useWorkflowStore } from '../../store/workflowStore';
import { WorkflowEditor } from './WorkflowEditor';
import type { Workflow, WorkflowStatus } from '../../types/workflow';

type ViewMode = 'list' | 'grid';
type FilterStatus = 'all' | WorkflowStatus;

export default function WorkflowsPage() {
  const {
    workflows,
    currentWorkflow,
    createWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    setCurrentWorkflow,
    loadWorkflow,
  } = useWorkflowStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      const matchesSearch =
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchQuery, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = workflows.length;
    const active = workflows.filter((w) => w.status === 'active').length;
    const totalExecutions = workflows.reduce((sum, w) => sum + w.stats.totalExecutions, 0);
    const successRate = workflows.reduce(
      (sum, w) => sum + (w.stats.totalExecutions > 0
        ? (w.stats.successfulExecutions / w.stats.totalExecutions) * 100
        : 0),
      0
    ) / (workflows.filter((w) => w.stats.totalExecutions > 0).length || 1);

    return { total, active, totalExecutions, successRate: Math.round(successRate) };
  }, [workflows]);

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      const workflow = createWorkflow(newWorkflowName.trim());
      setNewWorkflowName('');
      setShowCreateModal(false);
      setCurrentWorkflow(workflow);
    }
  };

  const handleOpenWorkflow = (workflow: Workflow) => {
    loadWorkflow(workflow.id);
  };

  const handleDeleteWorkflow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(id);
    }
  };

  const handleDuplicateWorkflow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateWorkflow(id);
  };

  // If a workflow is being edited, show the editor
  if (currentWorkflow) {
    return <WorkflowEditor />;
  }

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'schedule':
        return <Clock className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      case 'event':
        return <Radio className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const config: Record<WorkflowStatus, { variant: any; icon: React.ReactNode }> = {
      draft: { variant: 'secondary', icon: <FileJson className="w-3 h-3" /> },
      active: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
      paused: { variant: 'warning', icon: <Pause className="w-3 h-3" /> },
      archived: { variant: 'secondary', icon: <History className="w-3 h-3" /> },
    };
    const c = config[status];
    return (
      <Badge variant={c.variant} size="sm" className="flex items-center gap-1">
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        description="Automate tasks with visual workflow builder"
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            New Workflow
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Workflows</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <Folder className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600">
                <Play className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Executions</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats.totalExecutions.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Success Rate</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.successRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workflows Grid/List */}
      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <Sparkles className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No workflows found
            </h3>
            <p className="text-neutral-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create your first workflow to automate tasks'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Workflow
              </Button>
            )}
          </CardBody>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <WorkflowCard
                  workflow={workflow}
                  onOpen={() => handleOpenWorkflow(workflow)}
                  onDelete={(e) => handleDeleteWorkflow(workflow.id, e)}
                  onDuplicate={(e) => handleDuplicateWorkflow(workflow.id, e)}
                  getTriggerIcon={getTriggerIcon}
                  getStatusBadge={getStatusBadge}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredWorkflows.map((workflow) => (
                <WorkflowListItem
                  key={workflow.id}
                  workflow={workflow}
                  onOpen={() => handleOpenWorkflow(workflow)}
                  onDelete={(e) => handleDeleteWorkflow(workflow.id, e)}
                  onDuplicate={(e) => handleDuplicateWorkflow(workflow.id, e)}
                  getTriggerIcon={getTriggerIcon}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Create Workflow Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Create New Workflow
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Workflow Name
                    </label>
                    <input
                      type="text"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkflow()}
                      placeholder="My Awesome Workflow"
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded-b-2xl">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateWorkflow}
                  disabled={!newWorkflowName.trim()}
                >
                  Create Workflow
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Workflow Card Component
function WorkflowCard({
  workflow,
  onOpen,
  onDelete,
  onDuplicate,
  getTriggerIcon,
  getStatusBadge,
}: {
  workflow: Workflow;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  getTriggerIcon: (type: string) => React.ReactNode;
  getStatusBadge: (status: WorkflowStatus) => React.ReactNode;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={onOpen}
    >
      <div className={`h-1.5 bg-gradient-to-r ${workflow.color}`} />
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${workflow.color} text-white`}>
              {getTriggerIcon(workflow.trigger.type)}
            </div>
            {getStatusBadge(workflow.status)}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                  <button
                    onClick={onOpen}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={onDuplicate}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                  <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate">
          {workflow.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
          {workflow.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            {workflow.stats.totalExecutions} runs
          </span>
          {workflow.stats.totalExecutions > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              {Math.round(
                (workflow.stats.successfulExecutions / workflow.stats.totalExecutions) * 100
              )}
              %
            </span>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {workflow.nodes.length} nodes
            </span>
            <span className="flex items-center text-xs text-primary-500 font-medium group-hover:gap-2 transition-all">
              Edit
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Workflow List Item Component
function WorkflowListItem({
  workflow,
  onOpen,
  onDelete,
  onDuplicate,
  getTriggerIcon,
  getStatusBadge,
}: {
  workflow: Workflow;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  getTriggerIcon: (type: string) => React.ReactNode;
  getStatusBadge: (status: WorkflowStatus) => React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${workflow.color} text-white flex-shrink-0`}>
        {getTriggerIcon(workflow.trigger.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-neutral-900 dark:text-white truncate">
            {workflow.name}
          </h3>
          {getStatusBadge(workflow.status)}
        </div>
        <p className="text-sm text-neutral-500 truncate">{workflow.description || 'No description'}</p>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm text-neutral-500">
        <div className="text-center">
          <p className="font-medium text-neutral-900 dark:text-white">
            {workflow.nodes.length}
          </p>
          <p className="text-xs">Nodes</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-neutral-900 dark:text-white">
            {workflow.stats.totalExecutions}
          </p>
          <p className="text-xs">Runs</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-green-600">
            {workflow.stats.totalExecutions > 0
              ? `${Math.round(
                  (workflow.stats.successfulExecutions / workflow.stats.totalExecutions) * 100
                )}%`
              : '-'}
          </p>
          <p className="text-xs">Success</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onOpen}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          <Copy className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
