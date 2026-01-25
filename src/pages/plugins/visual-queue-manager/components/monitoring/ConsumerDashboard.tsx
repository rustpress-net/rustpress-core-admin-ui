/**
 * Consumer Dashboard Component
 * Monitor and manage consumers across queues
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  User,
  Activity,
  Clock,
  Layers,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Eye,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { DataTable, Column } from '../shared/DataTable';
import { SearchFilterBar } from '../shared/SearchFilter';
import { SparklineChart } from '../shared/SparklineChart';
import { formatCompactNumber, formatRate, formatDuration } from '../shared/AnimatedCounter';
import type { Consumer, Queue } from '../../types';

export function ConsumerDashboard() {
  const { consumers, queues, channels } = useQueueManagerStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [queueFilter, setQueueFilter] = useState<string>('');
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);

  // Filter consumers
  const filteredConsumers = useMemo(() => {
    let result = [...consumers];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.tag.toLowerCase().includes(search) ||
        c.queueName.toLowerCase().includes(search)
      );
    }

    if (queueFilter) {
      result = result.filter(c => c.queueId === queueFilter);
    }

    return result;
  }, [consumers, searchTerm, queueFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const totalAckRate = consumers.reduce((sum, c) => sum + c.ackRate, 0);
    const totalPrefetch = consumers.reduce((sum, c) => sum + c.prefetchCount, 0);
    const activeConsumers = consumers.filter(c => c.active).length;

    return {
      total: consumers.length,
      active: activeConsumers,
      totalAckRate,
      avgPrefetch: consumers.length > 0 ? Math.round(totalPrefetch / consumers.length) : 0,
    };
  }, [consumers]);

  // Table columns
  const columns: Column<Consumer>[] = [
    {
      key: 'tag',
      header: 'Consumer Tag',
      render: (consumer) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            consumer.active
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}>
            <User className={cn(
              'w-4 h-4',
              consumer.active ? 'text-green-600' : 'text-neutral-500'
            )} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-48">
              {consumer.tag}
            </p>
            <p className="text-xs text-neutral-500">
              Channel #{consumer.channelId?.slice(-4) || 'N/A'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'queueName',
      header: 'Queue',
      render: (consumer) => (
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-500" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            {consumer.queueName}
          </span>
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      width: '100px',
      render: (consumer) => (
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          consumer.active
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
        )}>
          {consumer.active ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Active
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              Idle
            </>
          )}
        </span>
      ),
    },
    {
      key: 'prefetchCount',
      header: 'Prefetch',
      align: 'center',
      width: '100px',
      render: (consumer) => (
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {consumer.prefetchCount}
        </span>
      ),
    },
    {
      key: 'ackRate',
      header: 'Ack Rate',
      align: 'right',
      width: '120px',
      render: (consumer) => (
        <div className="flex items-center justify-end gap-2">
          <SparklineChart
            data={Array.from({ length: 10 }, () => Math.random() * consumer.ackRate)}
            width={50}
            height={20}
            color="#22c55e"
            showArea={false}
          />
          <span className="text-sm font-medium text-green-600">
            {formatRate(consumer.ackRate)}
          </span>
        </div>
      ),
    },
    {
      key: 'utilization',
      header: 'Utilization',
      align: 'center',
      width: '120px',
      render: (consumer) => {
        const util = consumer.utilization || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  util >= 80 ? 'bg-red-500' : util >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${util}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500 w-8">{util}%</span>
          </div>
        );
      },
    },
  ];

  // Row actions
  const rowActions = (consumer: Consumer) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setSelectedConsumer(consumer)}
        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
        title="Cancel consumer"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Consumers
          </h2>
          <p className="text-sm text-neutral-500">
            {stats.total} consumers across {queues.length} queues
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-xs text-neutral-500">Total Consumers</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.active}
              </p>
              <p className="text-xs text-neutral-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {formatRate(stats.totalAckRate)}
              </p>
              <p className="text-xs text-neutral-500">Total Ack Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.avgPrefetch}
              </p>
              <p className="text-xs text-neutral-500">Avg Prefetch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <SearchFilterBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            key: 'queue',
            label: 'Queue',
            value: queueFilter,
            options: queues.map(q => ({ value: q.id, label: q.name })),
            onChange: setQueueFilter,
          },
        ]}
      />

      {/* Consumers Table */}
      <DataTable
        data={filteredConsumers}
        columns={columns}
        keyField="id"
        onRowClick={setSelectedConsumer}
        rowActions={rowActions}
        emptyMessage="No consumers found"
      />

      {/* Consumer Detail Modal */}
      {selectedConsumer && (
        <ConsumerDetailModal
          consumer={selectedConsumer}
          onClose={() => setSelectedConsumer(null)}
        />
      )}
    </div>
  );
}

// Consumer Detail Modal
function ConsumerDetailModal({ consumer, onClose }: { consumer: Consumer; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            'p-3 rounded-xl',
            consumer.active
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}>
            <User className={cn(
              'w-6 h-6',
              consumer.active ? 'text-green-600' : 'text-neutral-500'
            )} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Consumer Details
            </h2>
            <p className="text-sm text-neutral-500 truncate max-w-64">
              {consumer.tag}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Queue</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {consumer.queueName}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Status</p>
              <p className={cn(
                'text-sm font-medium',
                consumer.active ? 'text-green-600' : 'text-neutral-600'
              )}>
                {consumer.active ? 'Active' : 'Idle'}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Prefetch Count</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {consumer.prefetchCount}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Ack Mode</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                {consumer.ackRequired ? 'Manual' : 'Auto'}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Ack Rate</p>
              <p className="text-sm font-medium text-green-600">
                {formatRate(consumer.ackRate)}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Utilization</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {consumer.utilization || 0}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
            >
              Close
            </button>
            <button className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200">
              Cancel Consumer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ConsumerDashboard;
