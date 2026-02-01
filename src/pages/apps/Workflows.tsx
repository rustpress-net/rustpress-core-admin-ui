/**
 * Workflows Page - Enterprise Edition
 * Visual workflow automation builder and manager
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  GitBranch,
  ArrowRight,
  Settings,
  Copy,
  Trash2,
  Edit,
  Eye,
  Activity,
  Mail,
  Database,
  Globe,
  Bell,
  FileText,
  Users,
  Shield,
  Code,
  Calendar,
  RefreshCw,
  TrendingUp,
  Download,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  icon: React.ElementType;
  config: Record<string, any>;
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'error';
  triggers: number;
  actions: number;
  lastRun: string;
  totalRuns: number;
  successRate: number;
  steps: WorkflowStep[];
  createdBy: string;
  createdAt: string;
  category: string;
}

const mockWorkflows: WorkflowItem[] = [
  {
    id: '1',
    name: 'New User Onboarding',
    description: 'Automated welcome sequence for new users',
    status: 'active',
    triggers: 1,
    actions: 5,
    lastRun: '5 min ago',
    totalRuns: 1256,
    successRate: 98.5,
    steps: [
      { id: 's1', type: 'trigger', name: 'User Created', icon: Users, config: {} },
      { id: 's2', type: 'action', name: 'Send Welcome Email', icon: Mail, config: {} },
      { id: 's3', type: 'action', name: 'Create Profile', icon: Database, config: {} },
      { id: 's4', type: 'action', name: 'Send Notification', icon: Bell, config: {} },
    ],
    createdBy: 'John Doe',
    createdAt: '2024-06-15',
    category: 'User Management',
  },
  {
    id: '2',
    name: 'Daily Backup Process',
    description: 'Automated database backup every day at midnight',
    status: 'active',
    triggers: 1,
    actions: 3,
    lastRun: '2 hours ago',
    totalRuns: 365,
    successRate: 99.7,
    steps: [
      { id: 's1', type: 'trigger', name: 'Schedule (Daily)', icon: Calendar, config: {} },
      { id: 's2', type: 'action', name: 'Export Database', icon: Database, config: {} },
      { id: 's3', type: 'action', name: 'Upload to Cloud', icon: Globe, config: {} },
    ],
    createdBy: 'System',
    createdAt: '2024-01-01',
    category: 'Maintenance',
  },
  {
    id: '3',
    name: 'Security Alert Response',
    description: 'Automated response to security threats',
    status: 'active',
    triggers: 3,
    actions: 4,
    lastRun: '1 day ago',
    totalRuns: 45,
    successRate: 100,
    steps: [
      { id: 's1', type: 'trigger', name: 'Security Alert', icon: Shield, config: {} },
      { id: 's2', type: 'condition', name: 'Check Severity', icon: GitBranch, config: {} },
      { id: 's3', type: 'action', name: 'Block IP', icon: Shield, config: {} },
      { id: 's4', type: 'action', name: 'Notify Admin', icon: Bell, config: {} },
    ],
    createdBy: 'Security Team',
    createdAt: '2024-03-20',
    category: 'Security',
  },
  {
    id: '4',
    name: 'Weekly Report Generation',
    description: 'Generate and send weekly analytics reports',
    status: 'paused',
    triggers: 1,
    actions: 4,
    lastRun: '1 week ago',
    totalRuns: 52,
    successRate: 96.2,
    steps: [
      { id: 's1', type: 'trigger', name: 'Schedule (Weekly)', icon: Calendar, config: {} },
      { id: 's2', type: 'action', name: 'Fetch Analytics', icon: TrendingUp, config: {} },
      { id: 's3', type: 'action', name: 'Generate Report', icon: FileText, config: {} },
      { id: 's4', type: 'action', name: 'Send Email', icon: Mail, config: {} },
    ],
    createdBy: 'Analytics Team',
    createdAt: '2024-02-10',
    category: 'Reporting',
  },
  {
    id: '5',
    name: 'API Error Handler',
    description: 'Handle and log API errors automatically',
    status: 'error',
    triggers: 1,
    actions: 3,
    lastRun: '10 min ago',
    totalRuns: 234,
    successRate: 85.4,
    steps: [
      { id: 's1', type: 'trigger', name: 'API Error', icon: Code, config: {} },
      { id: 's2', type: 'action', name: 'Log Error', icon: Database, config: {} },
      { id: 's3', type: 'action', name: 'Alert DevOps', icon: Bell, config: {} },
    ],
    createdBy: 'DevOps',
    createdAt: '2024-04-05',
    category: 'Development',
  },
  {
    id: '6',
    name: 'Content Approval Flow',
    description: 'Multi-step content review and approval process',
    status: 'draft',
    triggers: 1,
    actions: 6,
    lastRun: 'Never',
    totalRuns: 0,
    successRate: 0,
    steps: [
      { id: 's1', type: 'trigger', name: 'Content Submitted', icon: FileText, config: {} },
      { id: 's2', type: 'action', name: 'Assign Reviewer', icon: Users, config: {} },
      { id: 's3', type: 'condition', name: 'Review Decision', icon: GitBranch, config: {} },
      { id: 's4', type: 'action', name: 'Publish Content', icon: Globe, config: {} },
    ],
    createdBy: 'Content Team',
    createdAt: '2025-01-10',
    category: 'Content',
  },
];

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  paused: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Pause },
  draft: { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', icon: Edit },
  error: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
};

const categoryColors: Record<string, string> = {
  'User Management': 'bg-blue-500',
  'Maintenance': 'bg-purple-500',
  'Security': 'bg-red-500',
  'Reporting': 'bg-green-500',
  'Development': 'bg-amber-500',
  'Content': 'bg-cyan-500',
};

export default function Workflows() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    totalRuns: workflows.reduce((sum, w) => sum + w.totalRuns, 0),
    avgSuccess: workflows.filter(w => w.totalRuns > 0).reduce((sum, w) => sum + w.successRate, 0) / workflows.filter(w => w.totalRuns > 0).length || 0,
  };

  const toggleStatus = (id: string) => {
    setWorkflows(workflows.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: w.status === 'active' ? 'paused' : w.status === 'paused' ? 'active' : w.status
        };
      }
      return w;
    }));
  };

  const runWorkflow = (id: string) => {
    setWorkflows(workflows.map(w =>
      w.id === id ? { ...w, totalRuns: w.totalRuns + 1, lastRun: 'Just now' } : w
    ));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(w => w.id !== id));
  };

  const duplicateWorkflow = (id: string) => {
    const original = workflows.find(w => w.id === id);
    if (original) {
      const copy: WorkflowItem = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (Copy)`,
        status: 'draft',
        totalRuns: 0,
        lastRun: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setWorkflows([...workflows, copy]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Automation"
        description="Build and manage automated workflows"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Workflow
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workflows', value: stats.total, icon: Workflow, color: 'text-blue-500' },
          { label: 'Active', value: stats.active, icon: Activity, color: 'text-green-500' },
          { label: 'Total Executions', value: stats.totalRuns.toLocaleString(), icon: Zap, color: 'text-purple-500' },
          { label: 'Avg Success Rate', value: `${stats.avgSuccess.toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-500' },
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

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'paused', 'draft', 'error'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.map((workflow, index) => {
          const StatusIcon = statusConfig[workflow.status].icon;
          const isSelected = selectedWorkflow === workflow.id;

          return (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
                <CardBody className="p-0">
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setSelectedWorkflow(isSelected ? null : workflow.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${categoryColors[workflow.category] || 'bg-neutral-500'} text-white`}>
                        <Workflow className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-white">{workflow.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[workflow.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                          </span>
                          <Badge variant="secondary" size="xs">{workflow.category}</Badge>
                        </div>
                        <p className="text-sm text-neutral-500 mb-3">{workflow.description}</p>

                        {/* Workflow Steps Preview */}
                        <div className="flex items-center gap-2 mb-3">
                          {workflow.steps.slice(0, 4).map((step, i) => (
                            <div key={step.id} className="flex items-center">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                step.type === 'trigger' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                step.type === 'condition' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                              }`}>
                                <step.icon className="w-4 h-4" />
                              </div>
                              {i < workflow.steps.slice(0, 4).length - 1 && (
                                <ArrowRight className="w-4 h-4 text-neutral-300 mx-1" />
                              )}
                            </div>
                          ))}
                          {workflow.steps.length > 4 && (
                            <span className="text-xs text-neutral-500">+{workflow.steps.length - 4} more</span>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {workflow.triggers} triggers
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {workflow.actions} actions
                          </span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" />
                            {workflow.totalRuns.toLocaleString()} runs
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {workflow.lastRun}
                          </span>
                          {workflow.totalRuns > 0 && (
                            <span className={`flex items-center gap-1 ${
                              workflow.successRate >= 95 ? 'text-green-500' :
                              workflow.successRate >= 80 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              <TrendingUp className="w-4 h-4" />
                              {workflow.successRate}% success
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {workflow.status !== 'draft' && (
                          <Button
                            variant={workflow.status === 'active' ? 'outline' : 'primary'}
                            size="sm"
                            leftIcon={workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(workflow.id);
                            }}
                          >
                            {workflow.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>
                        )}
                        {workflow.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Play className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              runWorkflow(workflow.id);
                            }}
                          >
                            Run
                          </Button>
                        )}
                        <div className="relative group">
                          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                              className="w-full px-3 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateWorkflow(workflow.id);
                              }}
                            >
                              <Copy className="w-4 h-4" /> Duplicate
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> View Logs
                            </button>
                            <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                            <button
                              className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteWorkflow(workflow.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Workflow className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No workflows found</h3>
          <p className="text-neutral-500 mb-6">Create your first workflow to automate tasks</p>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Create Workflow
          </Button>
        </motion.div>
      )}
    </div>
  );
}
