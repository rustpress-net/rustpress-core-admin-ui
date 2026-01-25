/**
 * Publish Message Component
 * Form for publishing messages to exchanges
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Plus,
  Trash2,
  FileJson,
  FileText,
  Code,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { Modal } from '../shared/Modal';
import { Tabs, TabPanel } from '../shared/Tabs';
import type { Exchange } from '../../types';

interface PublishMessageProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExchange?: string;
}

type ContentType = 'application/json' | 'text/plain' | 'application/xml';

export function PublishMessage({ isOpen, onClose, defaultExchange }: PublishMessageProps) {
  const { exchanges, addMessage, queues } = useQueueManagerStore();

  const [exchangeId, setExchangeId] = useState(defaultExchange || '');
  const [routingKey, setRoutingKey] = useState('');
  const [payload, setPayload] = useState('{\n  "message": "Hello, World!"\n}');
  const [contentType, setContentType] = useState<ContentType>('application/json');
  const [deliveryMode, setDeliveryMode] = useState<1 | 2>(2);
  const [priority, setPriority] = useState(0);
  const [expiration, setExpiration] = useState('');
  const [correlationId, setCorrelationId] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);

  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const selectedExchange = exchanges.find(e => e.id === exchangeId);

  const validatePayload = () => {
    if (contentType === 'application/json') {
      try {
        JSON.parse(payload);
        setPayloadError(null);
        return true;
      } catch (e) {
        setPayloadError('Invalid JSON format');
        return false;
      }
    }
    setPayloadError(null);
    return true;
  };

  const handlePublish = () => {
    if (!validatePayload()) return;

    const headersObj: Record<string, string> = {};
    headers.forEach(h => {
      if (h.key) headersObj[h.key] = h.value;
    });

    // Find a queue that's bound to this exchange
    const targetQueue = queues[0]; // In a real app, this would be determined by routing

    addMessage({
      id: `msg-${Date.now()}`,
      queueId: targetQueue?.id || '',
      exchange: selectedExchange?.name || '',
      routingKey,
      payload: contentType === 'application/json' ? JSON.parse(payload) : payload,
      properties: {
        contentType,
        deliveryMode,
        priority,
        expiration: expiration || undefined,
        correlationId: correlationId || undefined,
        replyTo: replyTo || undefined,
      },
      headers: Object.keys(headersObj).length > 0 ? headersObj : undefined,
      timestamp: new Date().toISOString(),
      size: new Blob([payload]).size,
      status: 'ready',
      redelivered: false,
    });

    setPublishStatus('success');
    setTimeout(() => {
      setPublishStatus('idle');
      onClose();
    }, 1500);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const formatPayload = () => {
    if (contentType === 'application/json') {
      try {
        const parsed = JSON.parse(payload);
        setPayload(JSON.stringify(parsed, null, 2));
        setPayloadError(null);
      } catch (e) {
        setPayloadError('Cannot format: Invalid JSON');
      }
    }
  };

  const tabs = [
    { id: 'payload', label: 'Payload', icon: <FileJson className="w-4 h-4" /> },
    { id: 'properties', label: 'Properties', icon: <FileText className="w-4 h-4" /> },
    { id: 'headers', label: 'Headers', icon: <Code className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Message"
      description="Send a message to an exchange"
      icon={<Send className="w-5 h-5 text-primary-600" />}
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            {payload.length} characters • {new Blob([payload]).size} bytes
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!exchangeId || publishStatus === 'success'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors',
                publishStatus === 'success'
                  ? 'bg-green-600'
                  : 'bg-primary-600 hover:bg-primary-700 disabled:opacity-50'
              )}
            >
              {publishStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Published
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish Message
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Exchange & Routing Key */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Exchange *
            </label>
            <select
              value={exchangeId}
              onChange={(e) => setExchangeId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            >
              <option value="">Select exchange...</option>
              {exchanges.map((exchange) => (
                <option key={exchange.id} value={exchange.id}>
                  {exchange.name} ({exchange.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Routing Key
            </label>
            <input
              type="text"
              value={routingKey}
              onChange={(e) => setRoutingKey(e.target.value)}
              placeholder="e.g., user.created"
              className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            />
          </div>
        </div>

        <Tabs tabs={tabs} defaultTab="payload" variant="underline">
          <TabPanel tabId="payload">
            <div className="pt-4 space-y-3">
              {/* Content Type */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Content Type:
                </label>
                <div className="flex items-center gap-2">
                  {(['application/json', 'text/plain', 'application/xml'] as ContentType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                        contentType === type
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {type.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={formatPayload}
                  className="ml-auto text-xs text-primary-600 hover:text-primary-700"
                >
                  Format
                </button>
              </div>

              {/* Payload Editor */}
              <div className="relative">
                <textarea
                  value={payload}
                  onChange={(e) => {
                    setPayload(e.target.value);
                    setPayloadError(null);
                  }}
                  onBlur={validatePayload}
                  rows={12}
                  className={cn(
                    'w-full p-4 rounded-lg bg-neutral-900 dark:bg-neutral-950 text-green-400 font-mono text-sm resize-none focus:outline-none focus:ring-2',
                    payloadError
                      ? 'ring-2 ring-red-500'
                      : 'focus:ring-primary-500'
                  )}
                  placeholder="Enter your message payload..."
                />
                {payloadError && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {payloadError}
                  </div>
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel tabId="properties">
            <div className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Delivery Mode
                  </label>
                  <select
                    value={deliveryMode}
                    onChange={(e) => setDeliveryMode(parseInt(e.target.value) as 1 | 2)}
                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  >
                    <option value={1}>Non-persistent (1)</option>
                    <option value={2}>Persistent (2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Priority (0-255)
                  </label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
                    min={0}
                    max={255}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Expiration (ms)
                  </label>
                  <input
                    type="text"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    placeholder="e.g., 60000"
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Correlation ID
                  </label>
                  <input
                    type="text"
                    value={correlationId}
                    onChange={(e) => setCorrelationId(e.target.value)}
                    placeholder="e.g., request-123"
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Reply To
                </label>
                <input
                  type="text"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="e.g., response.queue"
                  className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Persistent messages (delivery mode 2) are written to disk and survive broker restarts.
                </p>
              </div>
            </div>
          </TabPanel>

          <TabPanel tabId="headers">
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Custom headers for the message
                </p>
                <button
                  onClick={addHeader}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Header
                </button>
              </div>

              {headers.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No custom headers</p>
                  <p className="text-xs mt-1">Click "Add Header" to add custom headers</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="Header name"
                        className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </Modal>
  );
}

export default PublishMessage;
