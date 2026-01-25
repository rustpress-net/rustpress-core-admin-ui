/**
 * Create Queue Modal
 * Form for creating new queues with full configuration
 */

import React, { useState } from 'react';
import { Layers, Plus, Settings, Clock, Hash, Database, AlertTriangle, Zap } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Tabs, TabPanel } from '../shared/Tabs';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import type { Queue, QueueType, QueueArguments } from '../../types';
import { cn } from '../../../../../design-system/utils';

interface CreateQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateQueueModal({ isOpen, onClose }: CreateQueueModalProps) {
  const { addQueue, virtualHosts } = useQueueManagerStore();

  const [name, setName] = useState('');
  const [vhost, setVhost] = useState('/');
  const [queueType, setQueueType] = useState<QueueType>('classic');
  const [durable, setDurable] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [exclusive, setExclusive] = useState(false);

  // Advanced arguments
  const [messageTtl, setMessageTtl] = useState<number | undefined>();
  const [maxLength, setMaxLength] = useState<number | undefined>();
  const [maxLengthBytes, setMaxLengthBytes] = useState<number | undefined>();
  const [overflow, setOverflow] = useState<'drop-head' | 'reject-publish' | 'reject-publish-dlx'>('drop-head');
  const [deadLetterExchange, setDeadLetterExchange] = useState('');
  const [deadLetterRoutingKey, setDeadLetterRoutingKey] = useState('');
  const [maxPriority, setMaxPriority] = useState<number | undefined>();

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Queue name is required';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      newErrors.name = 'Queue name can only contain letters, numbers, dots, underscores, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const args: QueueArguments = {};
    if (messageTtl !== undefined) args['x-message-ttl'] = messageTtl;
    if (maxLength !== undefined) args['x-max-length'] = maxLength;
    if (maxLengthBytes !== undefined) args['x-max-length-bytes'] = maxLengthBytes;
    if (overflow !== 'drop-head') args['x-overflow'] = overflow;
    if (deadLetterExchange) args['x-dead-letter-exchange'] = deadLetterExchange;
    if (deadLetterRoutingKey) args['x-dead-letter-routing-key'] = deadLetterRoutingKey;
    if (maxPriority !== undefined) args['x-max-priority'] = maxPriority;
    args['x-queue-type'] = queueType;

    const newQueue: Queue = {
      id: `queue-${Date.now()}`,
      name,
      vhost,
      type: queueType,
      state: 'running',
      durable,
      autoDelete,
      exclusive,
      arguments: args,
      messagesReady: 0,
      messagesUnacked: 0,
      messagesTotal: 0,
      consumers: 0,
      memory: 0,
      publishRate: 0,
      deliverRate: 0,
      ackRate: 0,
      redeliverRate: 0,
      createdAt: new Date().toISOString(),
      healthScore: 100,
    };

    addQueue(newQueue);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setVhost('/');
    setQueueType('classic');
    setDurable(true);
    setAutoDelete(false);
    setExclusive(false);
    setMessageTtl(undefined);
    setMaxLength(undefined);
    setMaxLengthBytes(undefined);
    setOverflow('drop-head');
    setDeadLetterExchange('');
    setDeadLetterRoutingKey('');
    setMaxPriority(undefined);
    setActiveTab('basic');
    setErrors({});
    onClose();
  };

  const tabs = [
    { id: 'basic', label: 'Basic', icon: <Layers className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings className="w-4 h-4" /> },
    { id: 'dlq', label: 'Dead Letter', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Queue"
      description="Add a new queue to the message broker"
      icon={<Plus className="w-5 h-5 text-primary-600" />}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            Create Queue
          </button>
        </div>
      }
    >
      <Tabs
        tabs={tabs}
        defaultTab="basic"
        onChange={setActiveTab}
        variant="underline"
      >
        <TabPanel tabId="basic">
          <div className="space-y-4 pt-4">
            {/* Queue Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Queue Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my.queue.name"
                className={cn(
                  'w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.name
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-neutral-200 dark:border-neutral-700'
                )}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Virtual Host */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Virtual Host
              </label>
              <select
                value={vhost}
                onChange={(e) => setVhost(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {virtualHosts.map((vh) => (
                  <option key={vh.id} value={vh.name}>{vh.name}</option>
                ))}
              </select>
            </div>

            {/* Queue Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Queue Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['classic', 'quorum', 'stream'] as QueueType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setQueueType(type)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                      queueType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    )}
                  >
                    <Layers className={cn('w-6 h-6', queueType === type ? 'text-primary-600' : 'text-neutral-400')} />
                    <span className={cn('text-sm font-medium capitalize', queueType === type ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400')}>
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <input
                  type="checkbox"
                  checked={durable}
                  onChange={(e) => setDurable(e.target.checked)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Durable</p>
                  <p className="text-xs text-neutral-500">Survives broker restart</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <input
                  type="checkbox"
                  checked={autoDelete}
                  onChange={(e) => setAutoDelete(e.target.checked)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Auto Delete</p>
                  <p className="text-xs text-neutral-500">Delete when unused</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <input
                  type="checkbox"
                  checked={exclusive}
                  onChange={(e) => setExclusive(e.target.checked)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Exclusive</p>
                  <p className="text-xs text-neutral-500">Single consumer only</p>
                </div>
              </label>
            </div>
          </div>
        </TabPanel>

        <TabPanel tabId="advanced">
          <div className="space-y-4 pt-4">
            {/* Message TTL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Message TTL (ms)
                </label>
                <input
                  type="number"
                  value={messageTtl ?? ''}
                  onChange={(e) => setMessageTtl(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 60000"
                  className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Max Priority
                </label>
                <input
                  type="number"
                  value={maxPriority ?? ''}
                  onChange={(e) => setMaxPriority(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 10"
                  min={0}
                  max={255}
                  className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                />
              </div>
            </div>

            {/* Max Length */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Max Length (messages)
                </label>
                <input
                  type="number"
                  value={maxLength ?? ''}
                  onChange={(e) => setMaxLength(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 10000"
                  className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <Database className="w-4 h-4 inline mr-1" />
                  Max Length (bytes)
                </label>
                <input
                  type="number"
                  value={maxLengthBytes ?? ''}
                  onChange={(e) => setMaxLengthBytes(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 104857600"
                  className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                />
              </div>
            </div>

            {/* Overflow Behavior */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Overflow Behavior
              </label>
              <select
                value={overflow}
                onChange={(e) => setOverflow(e.target.value as typeof overflow)}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
              >
                <option value="drop-head">Drop Head (oldest messages)</option>
                <option value="reject-publish">Reject Publish</option>
                <option value="reject-publish-dlx">Reject Publish + DLX</option>
              </select>
            </div>
          </div>
        </TabPanel>

        <TabPanel tabId="dlq">
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm font-medium">Dead Letter Configuration</p>
              </div>
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                Messages that cannot be delivered or are rejected will be routed to the dead letter exchange.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Dead Letter Exchange
              </label>
              <input
                type="text"
                value={deadLetterExchange}
                onChange={(e) => setDeadLetterExchange(e.target.value)}
                placeholder="e.g., dlx"
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Dead Letter Routing Key
              </label>
              <input
                type="text"
                value={deadLetterRoutingKey}
                onChange={(e) => setDeadLetterRoutingKey(e.target.value)}
                placeholder="e.g., dead-letter"
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
              />
              <p className="mt-1 text-xs text-neutral-500">
                If empty, the original routing key will be used
              </p>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

export default CreateQueueModal;
