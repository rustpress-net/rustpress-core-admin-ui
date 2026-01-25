/**
 * Create Exchange Modal
 * Form for creating new exchanges
 */

import React, { useState } from 'react';
import { ArrowRightLeft, Plus, Radio, Share2, Hash, GitBranch, Info } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import type { Exchange, ExchangeType } from '../../types';
import { cn } from '../../../../../design-system/utils';

interface CreateExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const exchangeTypes: {
  type: ExchangeType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'direct',
    label: 'Direct',
    description: 'Routes messages to queues with matching routing key',
    icon: <ArrowRightLeft className="w-5 h-5" />,
  },
  {
    type: 'fanout',
    label: 'Fanout',
    description: 'Broadcasts messages to all bound queues',
    icon: <Radio className="w-5 h-5" />,
  },
  {
    type: 'topic',
    label: 'Topic',
    description: 'Routes messages using pattern matching on routing key',
    icon: <Share2 className="w-5 h-5" />,
  },
  {
    type: 'headers',
    label: 'Headers',
    description: 'Routes based on message header attributes',
    icon: <Hash className="w-5 h-5" />,
  },
  {
    type: 'x-delayed-message',
    label: 'Delayed',
    description: 'Delays message delivery by specified time',
    icon: <GitBranch className="w-5 h-5" />,
  },
];

export function CreateExchangeModal({ isOpen, onClose }: CreateExchangeModalProps) {
  const { addExchange, virtualHosts } = useQueueManagerStore();

  const [name, setName] = useState('');
  const [vhost, setVhost] = useState('/');
  const [exchangeType, setExchangeType] = useState<ExchangeType>('direct');
  const [durable, setDurable] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [internal, setInternal] = useState(false);
  const [alternateExchange, setAlternateExchange] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Exchange name is required';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      newErrors.name = 'Exchange name can only contain letters, numbers, dots, underscores, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newExchange: Exchange = {
      id: `exchange-${Date.now()}`,
      name,
      vhost,
      type: exchangeType,
      durable,
      autoDelete,
      internal,
      arguments: alternateExchange ? { 'alternate-exchange': alternateExchange } : {},
      messagesIn: 0,
      messagesOut: 0,
      publishRate: 0,
      routeRate: 0,
      unroutableRate: 0,
    };

    addExchange(newExchange);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setVhost('/');
    setExchangeType('direct');
    setDurable(true);
    setAutoDelete(false);
    setInternal(false);
    setAlternateExchange('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Exchange"
      description="Add a new exchange to route messages"
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
            Create Exchange
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Exchange Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Exchange Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my.exchange.name"
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

        {/* Exchange Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Exchange Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {exchangeTypes.map(({ type, label, description, icon }) => (
              <button
                key={type}
                onClick={() => setExchangeType(type)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors',
                  exchangeType === type
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  exchangeType === type
                    ? 'bg-primary-100 dark:bg-primary-800 text-primary-600'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                )}>
                  {icon}
                </div>
                <div>
                  <p className={cn(
                    'font-medium',
                    exchangeType === type
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-neutral-700 dark:text-neutral-300'
                  )}>
                    {label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
                </div>
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
              <p className="text-xs text-neutral-500">Survives restart</p>
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
              checked={internal}
              onChange={(e) => setInternal(e.target.checked)}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Internal</p>
              <p className="text-xs text-neutral-500">No direct publish</p>
            </div>
          </label>
        </div>

        {/* Alternate Exchange */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Alternate Exchange
          </label>
          <input
            type="text"
            value={alternateExchange}
            onChange={(e) => setAlternateExchange(e.target.value)}
            placeholder="e.g., unrouted.messages"
            className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Messages that cannot be routed will be sent to the alternate exchange instead of being dropped.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateExchangeModal;
