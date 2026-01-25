/**
 * Queue Dashboard Component
 * List and manage all queues
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  MoreVertical,
  Eye,
  Settings,
  ArrowUpDown,
  MessageSquare,
  Users,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { DataTable, Column } from '../shared/DataTable';
import { SearchFilterBar, FilterDropdown } from '../shared/SearchFilter';
import { QueueStateBadge, HealthScoreBadge } from '../shared/StatusBadge';
import { SparklineChart } from '../shared/SparklineChart';
import { formatCompactNumber, formatBytes, formatRate } from '../shared/AnimatedCounter';
import { CreateQueueModal } from './CreateQueueModal';
import { QueueDetailView } from './QueueDetailView';
import type { Queue, ViewMode } from '../../types';

export function QueueDashboard() {
  const {
    queues,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    selectedQueueId,
    setSelectedQueueId,
    deleteQueue,
    purgeQueue,
  } = useQueueManagerStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQueues, setSelectedQueues] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Queue>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort queues
  const filteredQueues = useMemo(() => {
    let result = [...queues];

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(q =>
        q.name.toLowerCase().includes(search) ||
        q.vhost.toLowerCase().includes(search)
      );
    }

    // Apply state filter
    if (filters.state) {
      result = result.filter(q => q.state === filters.state);
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter(q => q.type === filters.type);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [queues, filters, sortField, sortDirection]);

  // Table columns
  const columns: Column<Queue>[] = [
    {
      key: 'name',
      header: 'Queue Name',
      render: (queue) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <Layers className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{queue.name}</p>
            <p className="text-xs text-neutral-500">{queue.vhost}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'state',
      header: 'State',
      width: '120px',
      render: (queue) => <QueueStateBadge state={queue.state} />,
    },
    {
      key: 'messagesTotal',
      header: 'Messages',
      align: 'right',
      render: (queue) => (
        <div className="text-right">
          <p className="font-medium text-neutral-900 dark:text-white">
            {formatCompactNumber(queue.messagesTotal)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatCompactNumber(queue.messagesReady)} ready
          </p>
        </div>
      ),
    },
    {
      key: 'consumers',
      header: 'Consumers',
      align: 'center',
      width: '100px',
      render: (queue) => (
        <div className="flex items-center justify-center gap-1">
          <Users className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">{queue.consumers}</span>
        </div>
      ),
    },
    {
      key: 'publishRate',
      header: 'Rates',
      width: '150px',
      render: (queue) => (
        <div className="flex items-center gap-2">
          <SparklineChart
            data={Array.from({ length: 10 }, () => Math.random() * queue.publishRate)}
            width={60}
            height={24}
            color="#3b82f6"
            showArea={false}
          />
          <div className="text-xs">
            <p className="text-green-600">{formatRate(queue.publishRate)}</p>
            <p className="text-blue-600">{formatRate(queue.deliverRate)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'memory',
      header: 'Memory',
      align: 'right',
      width: '100px',
      render: (queue) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatBytes(queue.memory)}
        </span>
      ),
    },
    {
      key: 'healthScore',
      header: 'Health',
      align: 'center',
      width: '120px',
      render: (queue) => <HealthScoreBadge score={queue.healthScore} />,
    },
  ];

  // Row actions
  const rowActions = (queue: Queue) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setSelectedQueueId(queue.id)}
        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700"
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => purgeQueue(queue.id)}
        className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-500"
        title="Purge queue"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
      <button
        onClick={() => deleteQueue(queue.id)}
        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
        title="Delete queue"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  // Grid view card
  const QueueCard = ({ queue }: { queue: Queue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => setSelectedQueueId(queue.id)}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{queue.name}</p>
            <p className="text-xs text-neutral-500">{queue.type} • {queue.vhost}</p>
          </div>
        </div>
        <QueueStateBadge state={queue.state} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {formatCompactNumber(queue.messagesTotal)}
          </p>
          <p className="text-xs text-neutral-500">Messages</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {queue.consumers}
          </p>
          <p className="text-xs text-neutral-500">Consumers</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {formatRate(queue.publishRate)}
          </p>
          <p className="text-xs text-neutral-500">Publish</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SparklineChart
          data={Array.from({ length: 20 }, () => Math.random() * 100)}
          width={120}
          height={30}
          color="#3b82f6"
        />
        <HealthScoreBadge score={queue.healthScore} />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Queues</h2>
          <p className="text-sm text-neutral-500">{filteredQueues.length} queues</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Queue
        </button>
      </div>

      {/* Filters */}
      <SearchFilterBar
        search={filters.search}
        onSearchChange={(value) => setFilters({ search: value })}
        filters={[
          {
            key: 'state',
            label: 'State',
            value: filters.state,
            options: [
              { value: 'running', label: 'Running' },
              { value: 'idle', label: 'Idle' },
              { value: 'down', label: 'Down' },
            ],
            onChange: (value) => setFilters({ state: value }),
          },
          {
            key: 'type',
            label: 'Type',
            value: filters.type,
            options: [
              { value: 'classic', label: 'Classic' },
              { value: 'quorum', label: 'Quorum' },
              { value: 'stream', label: 'Stream' },
            ],
            onChange: (value) => setFilters({ type: value }),
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Bulk Actions */}
      {selectedQueues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
        >
          <span className="text-sm text-primary-700 dark:text-primary-300">
            {selectedQueues.length} queue(s) selected
          </span>
          <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200">
            Purge All
          </button>
          <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
            Delete All
          </button>
          <button
            onClick={() => setSelectedQueues([])}
            className="ml-auto text-sm text-primary-600 hover:text-primary-700"
          >
            Clear selection
          </button>
        </motion.div>
      )}

      {/* Queue List/Grid */}
      {viewMode === 'list' ? (
        <DataTable
          data={filteredQueues}
          columns={columns}
          keyField="id"
          selectable
          selectedItems={selectedQueues}
          onSelectionChange={setSelectedQueues}
          onRowClick={(queue) => setSelectedQueueId(queue.id)}
          rowActions={rowActions}
          emptyMessage="No queues found"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQueues.map((queue) => (
            <QueueCard key={queue.id} queue={queue} />
          ))}
        </div>
      )}

      {/* Create Queue Modal */}
      <CreateQueueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Queue Detail Slide-over */}
      {selectedQueueId && (
        <QueueDetailView
          queueId={selectedQueueId}
          onClose={() => setSelectedQueueId(null)}
        />
      )}
    </div>
  );
}

export default QueueDashboard;
