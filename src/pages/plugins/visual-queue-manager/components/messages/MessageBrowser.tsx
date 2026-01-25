/**
 * Message Browser Component
 * Browse and inspect messages in queues
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  RotateCcw,
  Copy,
  ChevronDown,
  ChevronRight,
  Clock,
  Hash,
  Tag,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { Modal, SlideOver } from '../shared/Modal';
import { SearchFilterBar } from '../shared/SearchFilter';
import { formatDuration } from '../shared/AnimatedCounter';
import type { Message, Queue } from '../../types';

interface MessageBrowserProps {
  queueId?: string;
}

export function MessageBrowser({ queueId }: MessageBrowserProps) {
  const { queues, messages } = useQueueManagerStore();

  const [selectedQueueId, setSelectedQueueId] = useState(queueId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('');

  const selectedQueue = queues.find(q => q.id === selectedQueueId);

  // Filter messages
  const filteredMessages = useMemo(() => {
    let result = queueId
      ? messages.filter(m => m.queueId === queueId)
      : selectedQueueId
        ? messages.filter(m => m.queueId === selectedQueueId)
        : messages;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.id.toLowerCase().includes(search) ||
        m.routingKey?.toLowerCase().includes(search) ||
        JSON.stringify(m.payload).toLowerCase().includes(search)
      );
    }

    if (filterStatus) {
      result = result.filter(m => m.status === filterStatus);
    }

    return result;
  }, [messages, selectedQueueId, queueId, searchTerm, filterStatus]);

  const toggleExpand = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'ready':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'unacked':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'redelivered':
        return <RotateCcw className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getStatusBadge = (status: Message['status']) => {
    const styles = {
      ready: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      unacked: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      redelivered: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    };
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', styles[status])}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Message Browser
          </h2>
          <p className="text-sm text-neutral-500">
            {filteredMessages.length} messages
            {selectedQueue && ` in ${selectedQueue.name}`}
          </p>
        </div>
      </div>

      {/* Queue Selector & Filters */}
      <div className="flex items-center gap-4">
        {!queueId && (
          <div className="w-64">
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            >
              <option value="">All Queues</option>
              {queues.map((queue) => (
                <option key={queue.id} value={queue.id}>
                  {queue.name} ({queue.messagesTotal})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
        >
          <option value="">All Status</option>
          <option value="ready">Ready</option>
          <option value="unacked">Unacked</option>
          <option value="redelivered">Redelivered</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {filteredMessages.map((message) => {
          const isExpanded = expandedMessages.has(message.id);
          const queue = queues.find(q => q.id === message.queueId);

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Message Header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                onClick={() => toggleExpand(message.id)}
              >
                <button className="p-1">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {getStatusIcon(message.status)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-neutral-900 dark:text-white truncate">
                      {message.id}
                    </code>
                    {getStatusBadge(message.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    {!queueId && queue && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {queue.name}
                      </span>
                    )}
                    {message.routingKey && (
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {message.routingKey}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {message.size} bytes
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMessage(message);
                    }}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(JSON.stringify(message.payload));
                    }}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500"
                    title="Copy payload"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="p-4 space-y-4">
                      {/* Properties */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                          <p className="text-xs text-neutral-500 mb-1">Priority</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {message.properties?.priority || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                          <p className="text-xs text-neutral-500 mb-1">Delivery Mode</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {message.properties?.deliveryMode === 2 ? 'Persistent' : 'Non-persistent'}
                          </p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                          <p className="text-xs text-neutral-500 mb-1">Content Type</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {message.properties?.contentType || 'text/plain'}
                          </p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                          <p className="text-xs text-neutral-500 mb-1">Redelivered</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {message.redelivered ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>

                      {/* Payload */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Payload
                          </p>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(message.payload, null, 2))}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <pre className="p-4 bg-neutral-900 dark:bg-neutral-950 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">
                          {typeof message.payload === 'string'
                            ? message.payload
                            : JSON.stringify(message.payload, null, 2)}
                        </pre>
                      </div>

                      {/* Headers */}
                      {message.headers && Object.keys(message.headers).length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Headers
                          </p>
                          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg space-y-2">
                            {Object.entries(message.headers).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <code className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                                  {key}
                                </code>
                                <span className="text-sm text-neutral-900 dark:text-white">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-neutral-600 dark:text-neutral-400">No messages found</p>
            <p className="text-sm text-neutral-500 mt-1">
              {selectedQueueId ? 'This queue is empty' : 'Select a queue to browse messages'}
            </p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}

// Message Detail Modal
function MessageDetailModal({ message, onClose }: { message: Message; onClose: () => void }) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Message Details"
      size="lg"
    >
      <div className="space-y-4">
        {/* Message ID */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Message ID
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono">
              {message.id}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(message.id)}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Routing Key
            </label>
            <p className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-sm">
              {message.routingKey || '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Exchange
            </label>
            <p className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-sm">
              {message.exchange || '(default)'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Timestamp
            </label>
            <p className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-sm">
              {new Date(message.timestamp).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Size
            </label>
            <p className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-sm">
              {message.size} bytes
            </p>
          </div>
        </div>

        {/* Payload */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Payload
            </label>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(message.payload, null, 2))}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
          <pre className="p-4 bg-neutral-900 rounded-lg text-sm text-green-400 font-mono overflow-x-auto max-h-64">
            {typeof message.payload === 'string'
              ? message.payload
              : JSON.stringify(message.payload, null, 2)}
          </pre>
        </div>
      </div>
    </Modal>
  );
}

export default MessageBrowser;
