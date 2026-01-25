/**
 * Connection Monitor Component
 * Monitor and manage active connections
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Server,
  User,
  Clock,
  Activity,
  XCircle,
  Eye,
  ChevronDown,
  ChevronRight,
  Network,
  Globe,
  Shield,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { DataTable, Column } from '../shared/DataTable';
import { SearchFilterBar } from '../shared/SearchFilter';
import { formatBytes, formatDuration, formatCompactNumber } from '../shared/AnimatedCounter';
import { SlideOver } from '../shared/Modal';
import type { Connection, Channel } from '../../types';

export function ConnectionMonitor() {
  const { connections, channels } = useQueueManagerStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());

  // Filter connections
  const filteredConnections = useMemo(() => {
    let result = [...connections];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.host.toLowerCase().includes(search) ||
        c.user.toLowerCase().includes(search)
      );
    }

    if (stateFilter) {
      result = result.filter(c => c.state === stateFilter);
    }

    return result;
  }, [connections, searchTerm, stateFilter]);

  // Get channels for a connection
  const getConnectionChannels = (connectionId: string) => {
    return channels.filter(ch => ch.connectionId === connectionId);
  };

  const toggleExpand = (connectionId: string) => {
    const newExpanded = new Set(expandedConnections);
    if (newExpanded.has(connectionId)) {
      newExpanded.delete(connectionId);
    } else {
      newExpanded.add(connectionId);
    }
    setExpandedConnections(newExpanded);
  };

  const getStateColor = (state: Connection['state']) => {
    switch (state) {
      case 'running':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'blocked':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'closing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600';
    }
  };

  // Summary stats
  const stats = useMemo(() => ({
    total: connections.length,
    running: connections.filter(c => c.state === 'running').length,
    blocked: connections.filter(c => c.state === 'blocked').length,
    totalChannels: channels.length,
  }), [connections, channels]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Connections
          </h2>
          <p className="text-sm text-neutral-500">
            {stats.total} connections, {stats.totalChannels} channels
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Wifi className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-xs text-neutral-500">Total Connections</p>
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
                {stats.running}
              </p>
              <p className="text-xs text-neutral-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.blocked}
              </p>
              <p className="text-xs text-neutral-500">Blocked</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Network className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.totalChannels}
              </p>
              <p className="text-xs text-neutral-500">Channels</p>
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
            key: 'state',
            label: 'State',
            value: stateFilter,
            options: [
              { value: 'running', label: 'Running' },
              { value: 'blocked', label: 'Blocked' },
              { value: 'closing', label: 'Closing' },
            ],
            onChange: setStateFilter,
          },
        ]}
      />

      {/* Connections List */}
      <div className="space-y-2">
        {filteredConnections.map((connection) => {
          const isExpanded = expandedConnections.has(connection.id);
          const connectionChannels = getConnectionChannels(connection.id);

          return (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Connection Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                onClick={() => toggleExpand(connection.id)}
              >
                <button className="p-1">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                <div className={cn(
                  'p-2 rounded-lg',
                  connection.state === 'running'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                )}>
                  <Wifi className={cn(
                    'w-4 h-4',
                    connection.state === 'running' ? 'text-green-600' : 'text-neutral-500'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {connection.name}
                    </p>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                      getStateColor(connection.state)
                    )}>
                      {connection.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {connection.host}:{connection.port}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {connection.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(Date.now() - new Date(connection.connectedAt).getTime())}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {connectionChannels.length}
                    </p>
                    <p className="text-xs text-neutral-500">Channels</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatBytes(connection.sendRate)}/s
                    </p>
                    <p className="text-xs text-neutral-500">Send</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      {formatBytes(connection.receiveRate)}/s
                    </p>
                    <p className="text-xs text-neutral-500">Receive</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConnection(connection);
                    }}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Close connection
                    }}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                    title="Close connection"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Channels */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-neutral-200 dark:border-neutral-800"
                >
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/30">
                    <h4 className="text-xs font-medium text-neutral-500 uppercase mb-3">
                      Channels ({connectionChannels.length})
                    </h4>
                    {connectionChannels.length > 0 ? (
                      <div className="space-y-2">
                        {connectionChannels.map((channel) => (
                          <div
                            key={channel.id}
                            className="flex items-center gap-4 p-3 bg-white dark:bg-neutral-900 rounded-lg"
                          >
                            <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                              <Network className="w-3 h-3 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                Channel #{channel.number}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {channel.consumerCount} consumers • {formatCompactNumber(channel.messagesUnacked)} unacked
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-green-600">
                                {formatCompactNumber(channel.publishRate)}/s pub
                              </span>
                              <span className="text-blue-600">
                                {formatCompactNumber(channel.deliverRate)}/s del
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 text-center py-4">
                        No active channels
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {filteredConnections.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <WifiOff className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-neutral-600 dark:text-neutral-400">No connections found</p>
          </div>
        )}
      </div>

      {/* Connection Detail Slide-over */}
      {selectedConnection && (
        <ConnectionDetailView
          connection={selectedConnection}
          onClose={() => setSelectedConnection(null)}
        />
      )}
    </div>
  );
}

// Connection Detail View
function ConnectionDetailView({ connection, onClose }: { connection: Connection; onClose: () => void }) {
  return (
    <SlideOver isOpen={true} onClose={onClose} position="right" size="md">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
            <Wifi className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {connection.name}
            </h2>
            <p className="text-sm text-neutral-500">{connection.host}:{connection.port}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">User</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {connection.user}
              </p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Virtual Host</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {connection.vhost}
              </p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Protocol</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {connection.protocol}
              </p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Auth Mechanism</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {connection.authMechanism}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
              Client Properties
            </h3>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg space-y-2">
              {Object.entries(connection.clientProperties).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-neutral-900 dark:text-white">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200"
            >
              Force Close Connection
            </button>
          </div>
        </div>
      </div>
    </SlideOver>
  );
}

export default ConnectionMonitor;
