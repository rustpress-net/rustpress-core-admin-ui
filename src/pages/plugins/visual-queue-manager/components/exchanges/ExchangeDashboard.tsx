/**
 * Exchange Dashboard Component
 * List and manage all exchanges
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Trash2,
  Eye,
  Settings,
  Link,
  Unlink,
  GitBranch,
  Radio,
  Share2,
  Hash,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { DataTable, Column } from '../shared/DataTable';
import { SearchFilterBar } from '../shared/SearchFilter';
import { formatCompactNumber } from '../shared/AnimatedCounter';
import { CreateExchangeModal } from './CreateExchangeModal';
import { ExchangeDetailView } from './ExchangeDetailView';
import type { Exchange, ExchangeType, ViewMode } from '../../types';

const exchangeTypeIcons: Record<ExchangeType, React.ReactNode> = {
  direct: <ArrowRightLeft className="w-4 h-4" />,
  fanout: <Radio className="w-4 h-4" />,
  topic: <Share2 className="w-4 h-4" />,
  headers: <Hash className="w-4 h-4" />,
  'x-delayed-message': <GitBranch className="w-4 h-4" />,
  'x-consistent-hash': <GitBranch className="w-4 h-4" />,
};

const exchangeTypeColors: Record<ExchangeType, string> = {
  direct: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  fanout: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  topic: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  headers: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  'x-delayed-message': 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  'x-consistent-hash': 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
};

export function ExchangeDashboard() {
  const {
    exchanges,
    bindings,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    deleteExchange,
  } = useQueueManagerStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Exchange>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort exchanges
  const filteredExchanges = useMemo(() => {
    let result = [...exchanges];

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.vhost.toLowerCase().includes(search)
      );
    }

    // Apply type filter
    if (filters.exchangeType) {
      result = result.filter(e => e.type === filters.exchangeType);
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
  }, [exchanges, filters, sortField, sortDirection]);

  // Get binding count for an exchange
  const getBindingCount = (exchangeId: string) => {
    return bindings.filter(b => b.source === exchangeId || b.destination === exchangeId).length;
  };

  // Table columns
  const columns: Column<Exchange>[] = [
    {
      key: 'name',
      header: 'Exchange Name',
      render: (exchange) => (
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', exchangeTypeColors[exchange.type])}>
            {exchangeTypeIcons[exchange.type]}
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{exchange.name}</p>
            <p className="text-xs text-neutral-500">{exchange.vhost}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '120px',
      render: (exchange) => (
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize',
          exchangeTypeColors[exchange.type]
        )}>
          {exchangeTypeIcons[exchange.type]}
          {exchange.type}
        </span>
      ),
    },
    {
      key: 'durable',
      header: 'Durability',
      align: 'center',
      width: '100px',
      render: (exchange) => (
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded',
          exchange.durable
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
        )}>
          {exchange.durable ? 'Durable' : 'Transient'}
        </span>
      ),
    },
    {
      key: 'messagesIn',
      header: 'Messages In',
      align: 'right',
      width: '120px',
      render: (exchange) => (
        <div className="text-right">
          <p className="font-medium text-neutral-900 dark:text-white">
            {formatCompactNumber(exchange.messagesIn)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatCompactNumber(exchange.publishRate)}/s
          </p>
        </div>
      ),
    },
    {
      key: 'messagesOut',
      header: 'Messages Out',
      align: 'right',
      width: '120px',
      render: (exchange) => (
        <div className="text-right">
          <p className="font-medium text-neutral-900 dark:text-white">
            {formatCompactNumber(exchange.messagesOut)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatCompactNumber(exchange.routeRate)}/s
          </p>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Bindings',
      align: 'center',
      width: '100px',
      render: (exchange) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">{getBindingCount(exchange.id)}</span>
        </div>
      ),
    },
  ];

  // Row actions
  const rowActions = (exchange: Exchange) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setSelectedExchangeId(exchange.id)}
        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700"
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => deleteExchange(exchange.id)}
        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
        title="Delete exchange"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  // Grid view card
  const ExchangeCard = ({ exchange }: { exchange: Exchange }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => setSelectedExchangeId(exchange.id)}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-3 rounded-lg', exchangeTypeColors[exchange.type])}>
            {exchangeTypeIcons[exchange.type]}
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{exchange.name}</p>
            <p className="text-xs text-neutral-500 capitalize">{exchange.type} • {exchange.vhost}</p>
          </div>
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded',
          exchange.durable
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
        )}>
          {exchange.durable ? 'Durable' : 'Transient'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {formatCompactNumber(exchange.messagesIn)}
          </p>
          <p className="text-xs text-neutral-500">Messages In</p>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {formatCompactNumber(exchange.messagesOut)}
          </p>
          <p className="text-xs text-neutral-500">Messages Out</p>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {getBindingCount(exchange.id)}
          </p>
          <p className="text-xs text-neutral-500">Bindings</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Exchanges</h2>
          <p className="text-sm text-neutral-500">{filteredExchanges.length} exchanges</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Exchange
        </button>
      </div>

      {/* Filters */}
      <SearchFilterBar
        search={filters.search}
        onSearchChange={(value) => setFilters({ search: value })}
        filters={[
          {
            key: 'exchangeType',
            label: 'Type',
            value: filters.exchangeType,
            options: [
              { value: 'direct', label: 'Direct' },
              { value: 'fanout', label: 'Fanout' },
              { value: 'topic', label: 'Topic' },
              { value: 'headers', label: 'Headers' },
            ],
            onChange: (value) => setFilters({ exchangeType: value }),
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
      {selectedExchanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
        >
          <span className="text-sm text-primary-700 dark:text-primary-300">
            {selectedExchanges.length} exchange(s) selected
          </span>
          <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
            Delete All
          </button>
          <button
            onClick={() => setSelectedExchanges([])}
            className="ml-auto text-sm text-primary-600 hover:text-primary-700"
          >
            Clear selection
          </button>
        </motion.div>
      )}

      {/* Exchange List/Grid */}
      {viewMode === 'list' ? (
        <DataTable
          data={filteredExchanges}
          columns={columns}
          keyField="id"
          selectable
          selectedItems={selectedExchanges}
          onSelectionChange={setSelectedExchanges}
          onRowClick={(exchange) => setSelectedExchangeId(exchange.id)}
          rowActions={rowActions}
          emptyMessage="No exchanges found"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExchanges.map((exchange) => (
            <ExchangeCard key={exchange.id} exchange={exchange} />
          ))}
        </div>
      )}

      {/* Create Exchange Modal */}
      <CreateExchangeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Exchange Detail Slide-over */}
      {selectedExchangeId && (
        <ExchangeDetailView
          exchangeId={selectedExchangeId}
          onClose={() => setSelectedExchangeId(null)}
        />
      )}
    </div>
  );
}

export default ExchangeDashboard;
