/**
 * Node Configuration Builders
 * Visual form builders for each workflow node type
 * Replaces raw JSON editing with user-friendly controls
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  Globe,
  Key,
  Clock,
  Mail,
  Database,
  Code,
  FileText,
  Variable,
  Copy,
  Check,
  Info,
  Zap,
  Calendar,
  AlertCircle,
  Search,
  Play,
  Settings,
  RefreshCw,
  Filter,
  Shuffle,
  GitBranch,
  Users,
  Link,
  Send,
  Server,
  Terminal,
} from 'lucide-react';

// ============================================
// SHARED COMPONENTS
// ============================================

interface KeyValuePair {
  key: string;
  value: string;
  id: string;
}

function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  suggestions = [],
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  suggestions?: { key: string; value: string; description?: string }[];
}) {
  const addPair = () => {
    onChange([...pairs, { key: '', value: '', id: Date.now().toString() }]);
  };

  const updatePair = (id: string, field: 'key' | 'value', value: string) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePair = (id: string) => {
    onChange(pairs.filter((p) => p.id !== id));
  };

  const addSuggestion = (suggestion: { key: string; value: string }) => {
    onChange([...pairs, { ...suggestion, id: Date.now().toString() }]);
  };

  return (
    <div className="space-y-2">
      {pairs.map((pair) => (
        <div key={pair.id} className="flex gap-2">
          <input
            type="text"
            value={pair.key}
            onChange={(e) => updatePair(pair.id, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 px-2 py-1.5 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
          />
          <input
            type="text"
            value={pair.value}
            onChange={(e) => updatePair(pair.id, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 px-2 py-1.5 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
          />
          <button
            onClick={() => removePair(pair.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          onClick={addPair}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>

        {suggestions.length > 0 && (
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg">
              <Zap className="w-4 h-4" />
              Quick Add
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => addSuggestion(s)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="font-medium text-neutral-900 dark:text-white">{s.key}</span>
                  {s.description && (
                    <span className="text-neutral-500 ml-2 text-xs">{s.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpressionInput({
  value,
  onChange,
  placeholder,
  variables = [],
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables?: { name: string; description?: string }[];
  multiline?: boolean;
}) {
  const [showVars, setShowVars] = useState(false);

  const insertVariable = (varName: string) => {
    onChange(value + `{{${varName}}}`);
    setShowVars(false);
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      <div className="relative">
        <Variable className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-400" />
        <InputComponent
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={placeholder || 'Use {{variable}} for dynamic values'}
          className={`w-full pl-8 pr-10 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 ${
            multiline ? 'resize-none min-h-[80px]' : ''
          }`}
          {...(multiline ? { rows: 3 } : { type: 'text' })}
        />
        {variables.length > 0 && (
          <button
            onClick={() => setShowVars(!showVars)}
            className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-primary-500 rounded"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showVars ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {showVars && variables.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {variables.map((v, i) => (
            <button
              key={i}
              onClick={() => insertVariable(v.name)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-between"
            >
              <code className="text-primary-600 dark:text-primary-400">{`{{${v.name}}}`}</code>
              {v.description && <span className="text-neutral-500 text-xs">{v.description}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickSelectGrid({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: { value: string; label: string; icon?: React.ReactNode; description?: string }[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-2 grid-cols-${columns}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`p-3 rounded-lg border text-left transition-all ${
            value === opt.value
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {opt.icon && <span className="text-neutral-500">{opt.icon}</span>}
            <span className={`text-sm font-medium ${value === opt.value ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-900 dark:text-white'}`}>
              {opt.label}
            </span>
          </div>
          {opt.description && (
            <p className="text-xs text-neutral-500">{opt.description}</p>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// HTTP REQUEST BUILDER
// ============================================

export function HttpRequestBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'basic' | 'headers' | 'body' | 'auth'>('basic');

  const httpMethods = [
    { value: 'GET', label: 'GET', description: 'Retrieve data', color: 'text-green-500' },
    { value: 'POST', label: 'POST', description: 'Create data', color: 'text-blue-500' },
    { value: 'PUT', label: 'PUT', description: 'Replace data', color: 'text-amber-500' },
    { value: 'PATCH', label: 'PATCH', description: 'Update data', color: 'text-purple-500' },
    { value: 'DELETE', label: 'DELETE', description: 'Remove data', color: 'text-red-500' },
  ];

  const headerSuggestions = [
    { key: 'Content-Type', value: 'application/json', description: 'JSON data' },
    { key: 'Authorization', value: 'Bearer {{token}}', description: 'Auth token' },
    { key: 'Accept', value: 'application/json', description: 'Accept JSON' },
    { key: 'X-API-Key', value: '{{apiKey}}', description: 'API Key' },
    { key: 'User-Agent', value: 'RustPress-Workflow/1.0', description: 'User agent' },
  ];

  const bodyTemplates = [
    {
      name: 'JSON Object',
      template: '{\n  "key": "value"\n}',
    },
    {
      name: 'Create Resource',
      template: '{\n  "name": "{{input.name}}",\n  "email": "{{input.email}}",\n  "data": {}\n}',
    },
    {
      name: 'Update Resource',
      template: '{\n  "id": "{{input.id}}",\n  "updates": {}\n}',
    },
    {
      name: 'Slack Message',
      template: '{\n  "text": "{{input.message}}",\n  "channel": "#general"\n}',
    },
  ];

  const headers = config.headers || {};
  const headerPairs: KeyValuePair[] = Object.entries(headers).map(([key, value], i) => ({
    key,
    value: value as string,
    id: i.toString(),
  }));

  const updateHeaders = (pairs: KeyValuePair[]) => {
    const newHeaders: Record<string, string> = {};
    pairs.forEach((p) => {
      if (p.key) newHeaders[p.key] = p.value;
    });
    onChange('headers', newHeaders);
  };

  return (
    <div className="space-y-4">
      {/* Method Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">HTTP Method</label>
        <div className="flex gap-1">
          {httpMethods.map((m) => (
            <button
              key={m.value}
              onClick={() => onChange('method', m.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                config.method === m.value
                  ? `bg-neutral-900 dark:bg-white text-white dark:text-neutral-900`
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              {m.value}
            </button>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">URL</label>
        <ExpressionInput
          value={config.url || ''}
          onChange={(v) => onChange('url', v)}
          placeholder="https://api.example.com/endpoint"
          variables={[
            { name: 'input.id', description: 'Input ID' },
            { name: 'input.userId', description: 'User ID' },
            { name: 'secrets.API_URL', description: 'API URL secret' },
          ]}
        />

        {/* Quick URL Templates */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-neutral-500">Templates:</span>
          {[
            { label: 'REST Resource', url: 'https://api.example.com/{{input.resource}}/{{input.id}}' },
            { label: 'Query Params', url: 'https://api.example.com/search?q={{input.query}}' },
            { label: 'Webhook', url: '{{secrets.WEBHOOK_URL}}' },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => onChange('url', t.url)}
              className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-4">
          {[
            { id: 'headers', label: 'Headers', count: headerPairs.length },
            { id: 'body', label: 'Body' },
            { id: 'auth', label: 'Auth' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {tab.label}
              {'count' in tab && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 rounded">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Headers Tab */}
      {activeTab === 'headers' && (
        <div>
          <KeyValueEditor
            pairs={headerPairs}
            onChange={updateHeaders}
            keyPlaceholder="Header name"
            valuePlaceholder="Value"
            suggestions={headerSuggestions}
          />
        </div>
      )}

      {/* Body Tab */}
      {activeTab === 'body' && (
        <div className="space-y-3">
          {/* Body Templates */}
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-neutral-500 mr-1">Templates:</span>
            {bodyTemplates.map((t) => (
              <button
                key={t.name}
                onClick={() => onChange('body', JSON.parse(t.template.replace(/\n/g, '').replace(/{{.*?}}/g, '""')))}
                className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                {t.name}
              </button>
            ))}
          </div>

          <textarea
            value={typeof config.body === 'string' ? config.body : JSON.stringify(config.body || {}, null, 2)}
            onChange={(e) => {
              try {
                onChange('body', JSON.parse(e.target.value));
              } catch {
                onChange('body', e.target.value);
              }
            }}
            placeholder='{\n  "key": "value"\n}'
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono resize-none min-h-[120px]"
          />
        </div>
      )}

      {/* Auth Tab */}
      {activeTab === 'auth' && (
        <div className="space-y-3">
          <QuickSelectGrid
            value={config.authType || 'none'}
            onChange={(v) => onChange('authType', v)}
            columns={2}
            options={[
              { value: 'none', label: 'No Auth', description: 'Public endpoint' },
              { value: 'bearer', label: 'Bearer Token', description: 'JWT or API token' },
              { value: 'apikey', label: 'API Key', description: 'X-API-Key header' },
              { value: 'basic', label: 'Basic Auth', description: 'Username & password' },
            ]}
          />

          {config.authType === 'bearer' && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Token</label>
              <ExpressionInput
                value={config.authToken || ''}
                onChange={(v) => onChange('authToken', v)}
                placeholder="{{secrets.API_TOKEN}}"
                variables={[{ name: 'secrets.API_TOKEN', description: 'API Token' }]}
              />
            </div>
          )}

          {config.authType === 'apikey' && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Header Name</label>
                <select
                  value={config.apiKeyHeader || 'X-API-Key'}
                  onChange={(e) => onChange('apiKeyHeader', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                >
                  <option value="X-API-Key">X-API-Key</option>
                  <option value="api-key">api-key</option>
                  <option value="apikey">apikey</option>
                  <option value="Authorization">Authorization</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">API Key</label>
                <ExpressionInput
                  value={config.apiKey || ''}
                  onChange={(v) => onChange('apiKey', v)}
                  placeholder="{{secrets.API_KEY}}"
                  variables={[{ name: 'secrets.API_KEY', description: 'API Key' }]}
                />
              </div>
            </div>
          )}

          {config.authType === 'basic' && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Username</label>
                <ExpressionInput
                  value={config.basicUsername || ''}
                  onChange={(v) => onChange('basicUsername', v)}
                  placeholder="username or {{secrets.USERNAME}}"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Password</label>
                <ExpressionInput
                  value={config.basicPassword || ''}
                  onChange={(v) => onChange('basicPassword', v)}
                  placeholder="{{secrets.PASSWORD}}"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeout */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Timeout</label>
        <div className="flex items-center gap-2">
          <select
            value={config.timeout || 30000}
            onChange={(e) => onChange('timeout', Number(e.target.value))}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          >
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={120000}>2 minutes</option>
            <option value={300000}>5 minutes</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SCHEDULE BUILDER
// ============================================

export function ScheduleBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const cronPresets = [
    { label: 'Every minute', cron: '* * * * *', description: 'Runs every minute' },
    { label: 'Every 5 minutes', cron: '*/5 * * * *', description: 'Runs every 5 minutes' },
    { label: 'Every 15 minutes', cron: '*/15 * * * *', description: 'Runs every 15 minutes' },
    { label: 'Every hour', cron: '0 * * * *', description: 'At minute 0 of every hour' },
    { label: 'Every 6 hours', cron: '0 */6 * * *', description: 'At minute 0 every 6 hours' },
    { label: 'Daily at midnight', cron: '0 0 * * *', description: 'Every day at 00:00' },
    { label: 'Daily at 9 AM', cron: '0 9 * * *', description: 'Every day at 09:00' },
    { label: 'Daily at 6 PM', cron: '0 18 * * *', description: 'Every day at 18:00' },
    { label: 'Weekdays at 9 AM', cron: '0 9 * * 1-5', description: 'Mon-Fri at 09:00' },
    { label: 'Weekly on Monday', cron: '0 9 * * 1', description: 'Every Monday at 09:00' },
    { label: 'Monthly on 1st', cron: '0 0 1 * *', description: '1st of every month at 00:00' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Chicago', label: 'Central Time (US)' },
    { value: 'America/Denver', label: 'Mountain Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Europe/London', label: 'London (UK)' },
    { value: 'Europe/Paris', label: 'Paris (France)' },
    { value: 'Europe/Berlin', label: 'Berlin (Germany)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (Japan)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (China)' },
    { value: 'Asia/Singapore', label: 'Singapore' },
    { value: 'Australia/Sydney', label: 'Sydney (Australia)' },
  ];

  return (
    <div className="space-y-4">
      {/* Schedule Type */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Schedule Type</label>
        <QuickSelectGrid
          value={config.scheduleType || 'cron'}
          onChange={(v) => onChange('scheduleType', v)}
          columns={3}
          options={[
            { value: 'cron', label: 'Cron', icon: <Clock className="w-4 h-4" />, description: 'Advanced scheduling' },
            { value: 'interval', label: 'Interval', icon: <RefreshCw className="w-4 h-4" />, description: 'Run every X minutes' },
            { value: 'specific', label: 'Specific', icon: <Calendar className="w-4 h-4" />, description: 'Exact times' },
          ]}
        />
      </div>

      {/* Cron Presets */}
      {config.scheduleType === 'cron' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Select Schedule</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {cronPresets.map((preset) => (
              <button
                key={preset.cron}
                onClick={() => onChange('cron', preset.cron)}
                className={`p-2 text-left rounded-lg border transition-all ${
                  config.cron === preset.cron
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="text-sm font-medium text-neutral-900 dark:text-white">{preset.label}</div>
                <div className="text-xs text-neutral-500">{preset.description}</div>
              </button>
            ))}
          </div>

          {/* Custom Cron */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Or enter custom cron expression</label>
            <input
              type="text"
              value={config.cron || '0 * * * *'}
              onChange={(e) => onChange('cron', e.target.value)}
              placeholder="0 * * * *"
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Format: minute (0-59) | hour (0-23) | day (1-31) | month (1-12) | weekday (0-6, Sun=0)
            </p>
          </div>
        </div>
      )}

      {/* Interval Mode */}
      {config.scheduleType === 'interval' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Run Every</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={config.intervalValue || 15}
              onChange={(e) => onChange('intervalValue', Number(e.target.value))}
              className="w-24 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
            />
            <select
              value={config.intervalUnit || 'minutes'}
              onChange={(e) => onChange('intervalUnit', e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>
      )}

      {/* Specific Times Mode */}
      {config.scheduleType === 'specific' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Run At Specific Times</label>
          <div className="space-y-2">
            {(config.specificTimes || ['09:00']).map((time: string, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const newTimes = [...(config.specificTimes || ['09:00'])];
                    newTimes[i] = e.target.value;
                    onChange('specificTimes', newTimes);
                  }}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
                <button
                  onClick={() => {
                    const newTimes = (config.specificTimes || ['09:00']).filter((_: any, idx: number) => idx !== i);
                    onChange('specificTimes', newTimes.length ? newTimes : ['09:00']);
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange('specificTimes', [...(config.specificTimes || ['09:00']), '12:00'])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Time
            </button>
          </div>
        </div>
      )}

      {/* Timezone */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Timezone</label>
        <select
          value={config.timezone || 'UTC'}
          onChange={(e) => onChange('timezone', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============================================
// DATABASE QUERY BUILDER
// ============================================

export function DatabaseQueryBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const tables = [
    { value: 'posts', label: 'Posts', description: 'Blog posts and articles' },
    { value: 'pages', label: 'Pages', description: 'Static pages' },
    { value: 'users', label: 'Users', description: 'User accounts' },
    { value: 'media', label: 'Media', description: 'Uploaded files' },
    { value: 'comments', label: 'Comments', description: 'Post comments' },
    { value: 'categories', label: 'Categories', description: 'Content categories' },
    { value: 'tags', label: 'Tags', description: 'Content tags' },
    { value: 'settings', label: 'Settings', description: 'Site settings' },
  ];

  const queryTemplates = {
    select: [
      { label: 'Get all', query: 'SELECT * FROM {{table}}' },
      { label: 'Get by ID', query: 'SELECT * FROM {{table}} WHERE id = {{input.id}}' },
      { label: 'Get recent', query: 'SELECT * FROM {{table}} ORDER BY created_at DESC LIMIT 10' },
      { label: 'Get by status', query: 'SELECT * FROM {{table}} WHERE status = {{input.status}}' },
      { label: 'Search', query: 'SELECT * FROM {{table}} WHERE title LIKE %{{input.search}}%' },
    ],
    insert: [
      { label: 'Insert one', query: 'INSERT INTO {{table}} (title, content) VALUES ({{input.title}}, {{input.content}})' },
    ],
    update: [
      { label: 'Update by ID', query: 'UPDATE {{table}} SET {{field}} = {{value}} WHERE id = {{input.id}}' },
      { label: 'Update status', query: 'UPDATE {{table}} SET status = {{input.status}} WHERE id = {{input.id}}' },
    ],
    delete: [
      { label: 'Delete by ID', query: 'DELETE FROM {{table}} WHERE id = {{input.id}}' },
      { label: 'Delete old', query: 'DELETE FROM {{table}} WHERE created_at < {{input.date}}' },
    ],
  };

  const currentTemplates = queryTemplates[config.operation as keyof typeof queryTemplates] || [];

  return (
    <div className="space-y-4">
      {/* Operation Type */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Operation</label>
        <QuickSelectGrid
          value={config.operation || 'select'}
          onChange={(v) => onChange('operation', v)}
          columns={2}
          options={[
            { value: 'select', label: 'SELECT', icon: <Search className="w-4 h-4" />, description: 'Query data' },
            { value: 'insert', label: 'INSERT', icon: <Plus className="w-4 h-4" />, description: 'Add records' },
            { value: 'update', label: 'UPDATE', icon: <RefreshCw className="w-4 h-4" />, description: 'Modify records' },
            { value: 'delete', label: 'DELETE', icon: <Trash2 className="w-4 h-4" />, description: 'Remove records' },
          ]}
        />
      </div>

      {/* Table Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Table</label>
        <select
          value={config.table || ''}
          onChange={(e) => onChange('table', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value="">Select a table...</option>
          {tables.map((t) => (
            <option key={t.value} value={t.value}>{t.label} - {t.description}</option>
          ))}
        </select>
      </div>

      {/* Query Templates */}
      {currentTemplates.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Templates</label>
          <div className="flex flex-wrap gap-1">
            {currentTemplates.map((t) => (
              <button
                key={t.label}
                onClick={() => onChange('query', t.query.replace('{{table}}', config.table || 'table'))}
                className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Editor */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Query</label>
        <ExpressionInput
          value={config.query || ''}
          onChange={(v) => onChange('query', v)}
          placeholder="Enter your SQL query or conditions..."
          multiline
          variables={[
            { name: 'input.id', description: 'Record ID' },
            { name: 'input.status', description: 'Status value' },
            { name: 'input.search', description: 'Search term' },
          ]}
        />
      </div>

      {/* Limit */}
      {config.operation === 'select' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Limit Results</label>
          <select
            value={config.limit || 100}
            onChange={(e) => onChange('limit', Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          >
            <option value={10}>10 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={500}>500 rows</option>
            <option value={1000}>1000 rows</option>
            <option value={0}>No limit</option>
          </select>
        </div>
      )}
    </div>
  );
}

// ============================================
// EMAIL BUILDER
// ============================================

export function EmailBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const emailTemplates = [
    { id: 'welcome', name: 'Welcome Email', preview: 'Welcome new users to your platform' },
    { id: 'notification', name: 'Notification', preview: 'General notification template' },
    { id: 'order-confirmation', name: 'Order Confirmation', preview: 'Confirm customer orders' },
    { id: 'password-reset', name: 'Password Reset', preview: 'Password reset instructions' },
    { id: 'newsletter', name: 'Newsletter', preview: 'Marketing newsletter template' },
  ];

  const bodyTemplates = [
    {
      name: 'Simple Text',
      body: 'Hello {{input.name}},\n\nThank you for contacting us.\n\nBest regards,\nThe Team',
    },
    {
      name: 'Welcome',
      body: '<h1>Welcome, {{input.name}}!</h1>\n<p>We\'re excited to have you on board.</p>\n<p>Get started by exploring our features.</p>',
    },
    {
      name: 'Notification',
      body: '<h2>{{input.subject}}</h2>\n<p>{{input.message}}</p>\n<p><a href="{{input.actionUrl}}">{{input.actionText}}</a></p>',
    },
    {
      name: 'Order Confirmation',
      body: '<h1>Order Confirmed</h1>\n<p>Order #{{input.orderId}}</p>\n<p>Thank you for your purchase!</p>\n<p>Total: ${{input.total}}</p>',
    },
  ];

  return (
    <div className="space-y-4">
      {/* To Field */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">To (Recipient)</label>
        <ExpressionInput
          value={config.to || ''}
          onChange={(v) => onChange('to', v)}
          placeholder="email@example.com or {{input.email}}"
          variables={[
            { name: 'input.email', description: 'Input email' },
            { name: 'input.user.email', description: 'User email' },
          ]}
        />
        <div className="mt-1 flex gap-1">
          <button
            onClick={() => onChange('to', '{{input.email}}')}
            className="text-xs text-primary-600 hover:underline"
          >
            Use input email
          </button>
          <span className="text-neutral-400">|</span>
          <button
            onClick={() => onChange('to', '{{input.user.email}}')}
            className="text-xs text-primary-600 hover:underline"
          >
            Use user email
          </button>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Subject</label>
        <ExpressionInput
          value={config.subject || ''}
          onChange={(v) => onChange('subject', v)}
          placeholder="Email subject line"
          variables={[
            { name: 'input.name', description: 'Recipient name' },
            { name: 'input.orderId', description: 'Order ID' },
          ]}
        />
        <div className="mt-1 flex flex-wrap gap-1">
          {[
            'Welcome to {{appName}}!',
            'Your order #{{input.orderId}} is confirmed',
            'Action required: {{input.action}}',
            '{{input.name}}, you have a new message',
          ].map((s) => (
            <button
              key={s}
              onClick={() => onChange('subject', s)}
              className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200"
            >
              {s.substring(0, 25)}...
            </button>
          ))}
        </div>
      </div>

      {/* Template vs Custom */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Email Content</label>
        <QuickSelectGrid
          value={config.useTemplate ? 'template' : 'custom'}
          onChange={(v) => onChange('useTemplate', v === 'template')}
          columns={2}
          options={[
            { value: 'template', label: 'Use Template', description: 'Pre-designed templates' },
            { value: 'custom', label: 'Custom HTML', description: 'Write your own' },
          ]}
        />
      </div>

      {/* Template Selection */}
      {config.useTemplate && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Select Template</label>
          <div className="grid grid-cols-1 gap-2">
            {emailTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => onChange('template', t.id)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  config.template === t.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium text-sm text-neutral-900 dark:text-white">{t.name}</div>
                <div className="text-xs text-neutral-500">{t.preview}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Body */}
      {!config.useTemplate && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-neutral-500">Email Body (HTML)</label>
            <div className="flex gap-1">
              {bodyTemplates.map((t) => (
                <button
                  key={t.name}
                  onClick={() => onChange('body', t.body)}
                  className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={config.body || ''}
            onChange={(e) => onChange('body', e.target.value)}
            placeholder="<h1>Hello {{input.name}}</h1>\n<p>Your message here...</p>"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[150px]"
          />
        </div>
      )}

      {/* CC/BCC */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">CC (optional)</label>
          <input
            type="text"
            value={config.cc || ''}
            onChange={(e) => onChange('cc', e.target.value)}
            placeholder="cc@example.com"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">BCC (optional)</label>
          <input
            type="text"
            value={config.bcc || ''}
            onChange={(e) => onChange('bcc', e.target.value)}
            placeholder="bcc@example.com"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONDITION BUILDER (IF/ELSE)
// ============================================

export function ConditionBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const conditionTemplates = [
    { label: 'Status is 200', condition: 'input.status === 200' },
    { label: 'Status is OK', condition: 'input.status >= 200 && input.status < 300' },
    { label: 'Has data', condition: 'input.data && input.data.length > 0' },
    { label: 'Is empty', condition: '!input.data || input.data.length === 0' },
    { label: 'Value exists', condition: 'input.value !== null && input.value !== undefined' },
    { label: 'Is true', condition: 'input.value === true' },
    { label: 'Is false', condition: 'input.value === false' },
    { label: 'Greater than', condition: 'input.amount > {{threshold}}' },
    { label: 'Less than', condition: 'input.amount < {{threshold}}' },
    { label: 'Equals', condition: 'input.status === "{{value}}"' },
    { label: 'Contains', condition: 'input.text.includes("{{search}}")' },
    { label: 'Starts with', condition: 'input.text.startsWith("{{prefix}}")' },
    { label: 'Email valid', condition: 'input.email && input.email.includes("@")' },
    { label: 'Is array', condition: 'Array.isArray(input.data)' },
    { label: 'Is premium user', condition: 'input.user.plan === "premium"' },
  ];

  const operators = [
    { value: '===', label: 'Equals (===)' },
    { value: '!==', label: 'Not equals (!==)' },
    { value: '>', label: 'Greater than (>)' },
    { value: '>=', label: 'Greater or equal (>=)' },
    { value: '<', label: 'Less than (<)' },
    { value: '<=', label: 'Less or equal (<=)' },
    { value: 'includes', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
  ];

  const [useBuilder, setUseBuilder] = useState(false);
  const [builderField, setBuilderField] = useState('input.status');
  const [builderOperator, setBuilderOperator] = useState('===');
  const [builderValue, setBuilderValue] = useState('200');

  const buildCondition = () => {
    let condition = '';
    if (['includes', 'startsWith', 'endsWith'].includes(builderOperator)) {
      condition = `${builderField}.${builderOperator}("${builderValue}")`;
    } else {
      const value = isNaN(Number(builderValue)) ? `"${builderValue}"` : builderValue;
      condition = `${builderField} ${builderOperator} ${value}`;
    }
    onChange('condition', condition);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Builder Mode</label>
        <QuickSelectGrid
          value={useBuilder ? 'builder' : 'expression'}
          onChange={(v) => setUseBuilder(v === 'builder')}
          columns={2}
          options={[
            { value: 'builder', label: 'Visual Builder', description: 'Build with dropdowns' },
            { value: 'expression', label: 'Expression', description: 'Write JavaScript' },
          ]}
        />
      </div>

      {/* Visual Builder */}
      {useBuilder && (
        <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Field</label>
            <select
              value={builderField}
              onChange={(e) => setBuilderField(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            >
              <option value="input.status">input.status</option>
              <option value="input.data">input.data</option>
              <option value="input.value">input.value</option>
              <option value="input.amount">input.amount</option>
              <option value="input.email">input.email</option>
              <option value="input.name">input.name</option>
              <option value="input.type">input.type</option>
              <option value="input.user.role">input.user.role</option>
              <option value="input.user.plan">input.user.plan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Operator</label>
            <select
              value={builderOperator}
              onChange={(e) => setBuilderOperator(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Value</label>
            <input
              type="text"
              value={builderValue}
              onChange={(e) => setBuilderValue(e.target.value)}
              placeholder="Enter value"
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            />
          </div>

          <button
            onClick={buildCondition}
            className="w-full px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
          >
            Apply Condition
          </button>
        </div>
      )}

      {/* Quick Templates */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Conditions</label>
        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
          {conditionTemplates.map((t) => (
            <button
              key={t.label}
              onClick={() => onChange('condition', t.condition)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                config.condition === t.condition
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expression Input */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Condition Expression</label>
        <ExpressionInput
          value={config.condition || ''}
          onChange={(v) => onChange('condition', v)}
          placeholder="input.status === 200"
          variables={[
            { name: 'input.status', description: 'HTTP status' },
            { name: 'input.data', description: 'Response data' },
            { name: 'input.value', description: 'Input value' },
            { name: 'input.email', description: 'Email field' },
          ]}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Returns true → data flows to "True" output<br />
          Returns false → data flows to "False" output
        </p>
      </div>
    </div>
  );
}

// ============================================
// LOOP BUILDER
// ============================================

export function LoopBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Execution Mode */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Execution Mode</label>
        <QuickSelectGrid
          value={config.parallel ? 'parallel' : 'sequential'}
          onChange={(v) => onChange('parallel', v === 'parallel')}
          columns={2}
          options={[
            { value: 'sequential', label: 'Sequential', icon: <GitBranch className="w-4 h-4" />, description: 'One at a time, in order' },
            { value: 'parallel', label: 'Parallel', icon: <Zap className="w-4 h-4" />, description: 'Multiple at once, faster' },
          ]}
        />
      </div>

      {/* Max Iterations */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Maximum Iterations</label>
        <select
          value={config.maxIterations || 100}
          onChange={(e) => onChange('maxIterations', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value={10}>10 items</option>
          <option value={50}>50 items</option>
          <option value={100}>100 items</option>
          <option value={500}>500 items</option>
          <option value={1000}>1,000 items</option>
          <option value={5000}>5,000 items</option>
          <option value={10000}>10,000 items</option>
        </select>
        <p className="mt-1 text-xs text-neutral-500">Safety limit to prevent infinite loops</p>
      </div>

      {/* Batch Size (for parallel) */}
      {config.parallel && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Batch Size</label>
          <select
            value={config.batchSize || 10}
            onChange={(e) => onChange('batchSize', Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          >
            <option value={5}>5 at a time</option>
            <option value={10}>10 at a time</option>
            <option value={25}>25 at a time</option>
            <option value={50}>50 at a time</option>
            <option value={100}>100 at a time</option>
          </select>
          <p className="mt-1 text-xs text-neutral-500">How many items to process simultaneously</p>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">How Loop works:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>Input:</strong> Connect an array to the loop input</li>
              <li><strong>Item output:</strong> Each item flows through this connection</li>
              <li><strong>All Results:</strong> Collected results after all iterations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEMPLATE BUILDER
// ============================================

export function TemplateBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const templateExamples = [
    {
      name: 'Simple greeting',
      template: 'Hello {{name}}, welcome to our platform!',
    },
    {
      name: 'Email body',
      template: 'Dear {{user.name}},\n\nThank you for your order #{{orderId}}.\n\nBest regards,\nThe Team',
    },
    {
      name: 'List items',
      template: '{{#each items}}\n- {{this.name}}: {{this.price}}\n{{/each}}\n\nTotal: {{total}}',
    },
    {
      name: 'Conditional',
      template: '{{#if isPremium}}Premium member{{else}}Free user{{/if}}',
    },
    {
      name: 'JSON output',
      template: '{\n  "name": "{{name}}",\n  "email": "{{email}}",\n  "timestamp": "{{timestamp}}"\n}',
    },
    {
      name: 'HTML card',
      template: '<div class="card">\n  <h2>{{title}}</h2>\n  <p>{{description}}</p>\n  <a href="{{link}}">Read more</a>\n</div>',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Engine Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Template Engine</label>
        <QuickSelectGrid
          value={config.engine || 'handlebars'}
          onChange={(v) => onChange('engine', v)}
          columns={3}
          options={[
            { value: 'handlebars', label: 'Handlebars', description: 'Most popular' },
            { value: 'mustache', label: 'Mustache', description: 'Simple & clean' },
            { value: 'ejs', label: 'EJS', description: 'Full JavaScript' },
          ]}
        />
      </div>

      {/* Quick Examples */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Templates</label>
        <div className="flex flex-wrap gap-1">
          {templateExamples.map((t) => (
            <button
              key={t.name}
              onClick={() => onChange('template', t.template)}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Template Editor */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Template Content</label>
        <textarea
          value={config.template || ''}
          onChange={(e) => onChange('template', e.target.value)}
          placeholder="Hello {{name}}, your order #{{orderId}} is ready!"
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[150px]"
        />
      </div>

      {/* Syntax Help */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-xs">
        <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">Handlebars Syntax:</p>
        <div className="space-y-1 text-neutral-600 dark:text-neutral-400 font-mono">
          <p><code>{'{{variable}}'}</code> - Insert variable</p>
          <p><code>{'{{#if condition}}...{{/if}}'}</code> - Conditional</p>
          <p><code>{'{{#each array}}...{{/each}}'}</code> - Loop</p>
          <p><code>{'{{{rawHtml}}}'}</code> - Raw HTML (no escaping)</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// WEBHOOK BUILDER
// ============================================

export function WebhookBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const pathTemplates = [
    '/webhooks/github',
    '/webhooks/stripe',
    '/webhooks/slack',
    '/webhooks/custom',
    '/api/incoming/{{type}}',
  ];

  return (
    <div className="space-y-4">
      {/* Path */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Webhook Path</label>
        <div className="flex gap-2">
          <span className="px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 rounded-l-lg text-neutral-500">
            /api
          </span>
          <input
            type="text"
            value={config.path || '/webhooks/my-hook'}
            onChange={(e) => onChange('path', e.target.value)}
            placeholder="/webhooks/my-hook"
            className="flex-1 px-3 py-2 text-sm rounded-r-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {pathTemplates.map((p) => (
            <button
              key={p}
              onClick={() => onChange('path', p)}
              className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Method */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">HTTP Method</label>
        <div className="flex gap-1">
          {['POST', 'GET', 'PUT', 'DELETE'].map((m) => (
            <button
              key={m}
              onClick={() => onChange('method', m)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                config.method === m
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Authentication */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Authentication</label>
        <QuickSelectGrid
          value={config.auth || 'none'}
          onChange={(v) => onChange('auth', v)}
          columns={3}
          options={[
            { value: 'none', label: 'None', description: 'Public endpoint' },
            { value: 'api_key', label: 'API Key', description: 'X-API-Key header' },
            { value: 'bearer', label: 'Bearer', description: 'Auth token' },
          ]}
        />

        {config.auth === 'api_key' && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Expected API Key</label>
            <ExpressionInput
              value={config.expectedApiKey || ''}
              onChange={(v) => onChange('expectedApiKey', v)}
              placeholder="{{secrets.WEBHOOK_API_KEY}}"
              variables={[{ name: 'secrets.WEBHOOK_API_KEY', description: 'Webhook API Key' }]}
            />
          </div>
        )}
      </div>

      {/* Response Config */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Response</label>
        <select
          value={config.responseType || 'json'}
          onChange={(e) => onChange('responseType', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value="json">JSON Response</option>
          <option value="text">Plain Text</option>
          <option value="empty">Empty (204 No Content)</option>
        </select>
      </div>

      {/* Info */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-300">
            <p className="font-medium">Webhook URL will be:</p>
            <code className="block mt-1 p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
              https://your-domain.com/api{config.path || '/webhooks/my-hook'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CUSTOM CODE BUILDER
// ============================================

export function CustomCodeBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const codeTemplates = [
    {
      name: 'Transform data',
      code: `// Transform input data
const result = {
  ...input,
  processed: true,
  timestamp: new Date().toISOString()
};

return result;`,
    },
    {
      name: 'Filter array',
      code: `// Filter items from input array
const filtered = input.items.filter(item => {
  return item.active === true;
});

return { items: filtered, count: filtered.length };`,
    },
    {
      name: 'Calculate stats',
      code: `// Calculate statistics
const values = input.numbers;
const sum = values.reduce((a, b) => a + b, 0);
const avg = sum / values.length;

return {
  sum,
  average: avg,
  min: Math.min(...values),
  max: Math.max(...values),
  count: values.length
};`,
    },
    {
      name: 'Format output',
      code: `// Format data for API response
return {
  success: true,
  data: input.data,
  meta: {
    processedAt: new Date().toISOString(),
    itemCount: input.data?.length || 0
  }
};`,
    },
    {
      name: 'Validate data',
      code: `// Validate input data
const errors = [];

if (!input.email || !input.email.includes('@')) {
  errors.push('Invalid email');
}

if (!input.name || input.name.length < 2) {
  errors.push('Name is required');
}

return {
  valid: errors.length === 0,
  errors,
  data: input
};`,
    },
    {
      name: 'Async fetch',
      code: `// Fetch external data (enable async mode)
const response = await fetch('https://api.example.com/data');
const data = await response.json();

return {
  status: response.status,
  data
};`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Async Mode */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.async || false}
            onChange={(e) => onChange('async', e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Enable async/await
          </span>
          <span className="text-xs text-neutral-500">(for fetch, file ops, etc.)</span>
        </label>
      </div>

      {/* Code Templates */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Code Templates</label>
        <div className="flex flex-wrap gap-1">
          {codeTemplates.map((t) => (
            <button
              key={t.name}
              onClick={() => onChange('code', t.code)}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">JavaScript Code</label>
        <textarea
          value={config.code || '// Access input data with "input"\nreturn input;'}
          onChange={(e) => onChange('code', e.target.value)}
          placeholder="// Your code here"
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[200px]"
          spellCheck={false}
        />
      </div>

      {/* Quick Reference */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-xs">
        <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">Quick Reference:</p>
        <div className="space-y-1 text-neutral-600 dark:text-neutral-400 font-mono">
          <p><code>input</code> - Access input data</p>
          <p><code>input.field</code> - Access specific field</p>
          <p><code>return value</code> - Return result (required)</p>
          <p><code>console.log()</code> - Debug logging</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAP BUILDER
// ============================================

export function MapBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const mapTemplates = [
    { label: 'Extract field', expression: 'item.name' },
    { label: 'Extract ID', expression: 'item.id' },
    { label: 'Extract email', expression: 'item.email' },
    { label: 'Add field', expression: '{ ...item, newField: "value" }' },
    { label: 'Calculate total', expression: '{ ...item, total: item.price * item.quantity }' },
    { label: 'Format date', expression: '{ ...item, date: new Date(item.timestamp).toLocaleDateString() }' },
    { label: 'Uppercase name', expression: '{ ...item, name: item.name.toUpperCase() }' },
    { label: 'Trim strings', expression: '{ ...item, name: item.name.trim() }' },
    { label: 'Rename field', expression: '{ id: item._id, name: item.title }' },
  ];

  return (
    <div className="space-y-4">
      {/* Templates */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Transformations</label>
        <div className="flex flex-wrap gap-1">
          {mapTemplates.map((t) => (
            <button
              key={t.label}
              onClick={() => onChange('expression', t.expression)}
              className={`px-2 py-1 text-xs rounded ${
                config.expression === t.expression
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expression Input */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Transform Expression</label>
        <ExpressionInput
          value={config.expression || ''}
          onChange={(v) => onChange('expression', v)}
          placeholder="item.name"
          multiline
          variables={[
            { name: 'item', description: 'Current array item' },
            { name: 'item.id', description: 'Item ID' },
            { name: 'item.name', description: 'Item name' },
          ]}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Use <code className="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">item</code> to reference each array element
        </p>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p><strong>Input:</strong> Array of items</p>
            <p><strong>Output:</strong> Array of transformed items (same length)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FILTER BUILDER
// ============================================

export function FilterBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const filterTemplates = [
    { label: 'Is active', condition: 'item.active === true' },
    { label: 'Is not deleted', condition: 'item.deleted !== true' },
    { label: 'Has value', condition: 'item.value !== null && item.value !== undefined' },
    { label: 'Status is published', condition: 'item.status === "published"' },
    { label: 'Amount > 0', condition: 'item.amount > 0' },
    { label: 'Amount > 100', condition: 'item.amount > 100' },
    { label: 'Has email', condition: 'item.email && item.email.includes("@")' },
    { label: 'Not empty string', condition: 'item.name && item.name.trim() !== ""' },
    { label: 'Created today', condition: 'new Date(item.createdAt).toDateString() === new Date().toDateString()' },
    { label: 'Is premium', condition: 'item.plan === "premium" || item.plan === "pro"' },
  ];

  return (
    <div className="space-y-4">
      {/* Templates */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Filters</label>
        <div className="flex flex-wrap gap-1">
          {filterTemplates.map((t) => (
            <button
              key={t.label}
              onClick={() => onChange('condition', t.condition)}
              className={`px-2 py-1 text-xs rounded ${
                config.condition === t.condition
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Input */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Filter Condition</label>
        <ExpressionInput
          value={config.condition || ''}
          onChange={(v) => onChange('condition', v)}
          placeholder="item.status === 'active'"
          multiline
          variables={[
            { name: 'item', description: 'Current array item' },
            { name: 'item.id', description: 'Item ID' },
            { name: 'item.status', description: 'Item status' },
          ]}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Returns <code className="px-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">true</code> to keep item,
          <code className="px-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded ml-1">false</code> to remove
        </p>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p><strong>Input:</strong> Array of items</p>
            <p><strong>Output:</strong> Array with only matching items</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DELAY BUILDER
// ============================================

export function DelayBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const presets = [
    { label: '500ms', value: 500 },
    { label: '1 second', value: 1000 },
    { label: '2 seconds', value: 2000 },
    { label: '5 seconds', value: 5000 },
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
  ];

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Select</label>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => onChange('duration', p.value)}
              className={`px-2 py-2 text-xs rounded-lg border ${
                config.duration === p.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Or enter custom duration</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={100}
            value={config.duration || 1000}
            onChange={(e) => onChange('duration', Number(e.target.value))}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          />
          <span className="px-3 py-2 text-sm text-neutral-500">milliseconds</span>
        </div>
      </div>

      {/* Humanized display */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-center">
        <Clock className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Workflow will wait for{' '}
          <strong>
            {config.duration >= 60000
              ? `${(config.duration / 60000).toFixed(1)} minutes`
              : config.duration >= 1000
              ? `${(config.duration / 1000).toFixed(1)} seconds`
              : `${config.duration} milliseconds`}
          </strong>
        </p>
      </div>
    </div>
  );
}

// ============================================
// MANUAL TRIGGER BUILDER
// ============================================

export function ManualTriggerBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const inputSchemaTemplates = [
    {
      name: 'Empty',
      schema: {},
    },
    {
      name: 'Simple ID',
      schema: { id: { type: 'string', description: 'Record ID' } },
    },
    {
      name: 'User Input',
      schema: {
        name: { type: 'string', description: 'User name' },
        email: { type: 'string', description: 'Email address' },
      },
    },
    {
      name: 'Content Data',
      schema: {
        title: { type: 'string', description: 'Content title' },
        body: { type: 'string', description: 'Content body' },
        status: { type: 'string', enum: ['draft', 'published'], description: 'Status' },
      },
    },
    {
      name: 'API Request',
      schema: {
        endpoint: { type: 'string', description: 'API endpoint' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        payload: { type: 'object', description: 'Request payload' },
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Play className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium">Manual Trigger</p>
            <p>This workflow starts when triggered manually from the admin panel or via API call.</p>
          </div>
        </div>
      </div>

      {/* Trigger Name */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Trigger Name</label>
        <input
          type="text"
          value={config.triggerName || ''}
          onChange={(e) => onChange('triggerName', e.target.value)}
          placeholder="e.g., Process Order, Send Newsletter"
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        />
      </div>

      {/* Require Confirmation */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.requireConfirmation ?? true}
            onChange={(e) => onChange('requireConfirmation', e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Require confirmation before running
          </span>
        </label>
        <p className="mt-1 text-xs text-neutral-500 ml-6">Show a confirmation dialog before executing</p>
      </div>

      {/* Input Schema */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Input Data Schema</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {inputSchemaTemplates.map((t) => (
            <button
              key={t.name}
              onClick={() => onChange('inputSchema', t.schema)}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {t.name}
            </button>
          ))}
        </div>
        <textarea
          value={JSON.stringify(config.inputSchema || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange('inputSchema', JSON.parse(e.target.value));
            } catch {
              // Keep as string if invalid
            }
          }}
          placeholder='{\n  "fieldName": { "type": "string" }\n}'
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[100px]"
        />
        <p className="mt-1 text-xs text-neutral-500">Define the expected input data structure</p>
      </div>

      {/* Allowed Roles */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Allowed Roles</label>
        <div className="flex flex-wrap gap-2">
          {['admin', 'editor', 'author', 'subscriber'].map((role) => (
            <label key={role} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={(config.allowedRoles || ['admin']).includes(role)}
                onChange={(e) => {
                  const current = config.allowedRoles || ['admin'];
                  if (e.target.checked) {
                    onChange('allowedRoles', [...current, role]);
                  } else {
                    onChange('allowedRoles', current.filter((r: string) => r !== role));
                  }
                }}
                className="w-3.5 h-3.5 rounded border-neutral-300 text-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EVENT TRIGGER BUILDER
// ============================================

export function EventTriggerBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const eventCategories = [
    {
      category: 'Content',
      events: [
        { value: 'post.created', label: 'Post Created', description: 'When a new post is created' },
        { value: 'post.updated', label: 'Post Updated', description: 'When a post is modified' },
        { value: 'post.published', label: 'Post Published', description: 'When a post is published' },
        { value: 'post.deleted', label: 'Post Deleted', description: 'When a post is deleted' },
        { value: 'page.created', label: 'Page Created', description: 'When a new page is created' },
        { value: 'page.updated', label: 'Page Updated', description: 'When a page is modified' },
        { value: 'media.uploaded', label: 'Media Uploaded', description: 'When media is uploaded' },
      ],
    },
    {
      category: 'Users',
      events: [
        { value: 'user.registered', label: 'User Registered', description: 'When a new user signs up' },
        { value: 'user.login', label: 'User Login', description: 'When a user logs in' },
        { value: 'user.logout', label: 'User Logout', description: 'When a user logs out' },
        { value: 'user.updated', label: 'Profile Updated', description: 'When user profile changes' },
        { value: 'user.deleted', label: 'User Deleted', description: 'When a user is deleted' },
      ],
    },
    {
      category: 'Comments',
      events: [
        { value: 'comment.created', label: 'Comment Created', description: 'When a new comment is posted' },
        { value: 'comment.approved', label: 'Comment Approved', description: 'When a comment is approved' },
        { value: 'comment.spam', label: 'Comment Marked Spam', description: 'When marked as spam' },
      ],
    },
    {
      category: 'System',
      events: [
        { value: 'plugin.activated', label: 'Plugin Activated', description: 'When a plugin is activated' },
        { value: 'plugin.deactivated', label: 'Plugin Deactivated', description: 'When a plugin is deactivated' },
        { value: 'settings.changed', label: 'Settings Changed', description: 'When site settings change' },
        { value: 'backup.completed', label: 'Backup Completed', description: 'When a backup finishes' },
      ],
    },
    {
      category: 'E-commerce',
      events: [
        { value: 'order.created', label: 'Order Created', description: 'When a new order is placed' },
        { value: 'order.paid', label: 'Order Paid', description: 'When payment is received' },
        { value: 'order.shipped', label: 'Order Shipped', description: 'When order is shipped' },
        { value: 'order.completed', label: 'Order Completed', description: 'When order is delivered' },
        { value: 'order.refunded', label: 'Order Refunded', description: 'When order is refunded' },
      ],
    },
  ];

  const [expandedCategory, setExpandedCategory] = useState<string | null>('Content');

  return (
    <div className="space-y-4">
      {/* Event Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Select Event</label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {eventCategories.map((cat) => (
            <div key={cat.category} className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{cat.category}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${expandedCategory === cat.category ? 'rotate-180' : ''}`} />
              </button>
              {expandedCategory === cat.category && (
                <div className="p-2 space-y-1">
                  {cat.events.map((event) => (
                    <button
                      key={event.value}
                      onClick={() => onChange('eventType', event.value)}
                      className={`w-full p-2 text-left rounded-lg transition-all ${
                        config.eventType === event.value
                          ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-500'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">{event.label}</div>
                      <div className="text-xs text-neutral-500">{event.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Event */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Or Enter Custom Event</label>
        <input
          type="text"
          value={config.eventType || ''}
          onChange={(e) => onChange('eventType', e.target.value)}
          placeholder="custom.event.name"
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        />
      </div>

      {/* Filter Conditions */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Filter Conditions (optional)</label>
        <textarea
          value={config.filterCondition || ''}
          onChange={(e) => onChange('filterCondition', e.target.value)}
          placeholder="e.g., event.data.status === 'published'"
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none"
          rows={2}
        />
        <p className="mt-1 text-xs text-neutral-500">Only trigger when this condition is true</p>
      </div>

      {/* Debounce */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Debounce (optional)</label>
        <select
          value={config.debounce || 0}
          onChange={(e) => onChange('debounce', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value={0}>No debounce</option>
          <option value={1000}>1 second</option>
          <option value={5000}>5 seconds</option>
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={60000}>1 minute</option>
        </select>
        <p className="mt-1 text-xs text-neutral-500">Prevent rapid consecutive triggers</p>
      </div>
    </div>
  );
}

// ============================================
// CREATE CONTENT BUILDER
// ============================================

export function CreateContentBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const contentTypes = [
    { value: 'post', label: 'Blog Post', icon: <FileText className="w-4 h-4" /> },
    { value: 'page', label: 'Page', icon: <FileText className="w-4 h-4" /> },
    { value: 'product', label: 'Product', icon: <Database className="w-4 h-4" /> },
    { value: 'custom', label: 'Custom Type', icon: <Settings className="w-4 h-4" /> },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', description: 'Save as draft' },
    { value: 'pending', label: 'Pending Review', description: 'Needs approval' },
    { value: 'published', label: 'Published', description: 'Immediately visible' },
    { value: 'scheduled', label: 'Scheduled', description: 'Publish later' },
  ];

  const fieldTemplates = [
    { name: 'Blog Post', fields: { title: '{{input.title}}', content: '{{input.content}}', excerpt: '{{input.excerpt}}', author: '{{input.authorId}}' } },
    { name: 'Product', fields: { title: '{{input.name}}', price: '{{input.price}}', description: '{{input.description}}', sku: '{{input.sku}}' } },
    { name: 'From API', fields: { title: '{{input.data.title}}', content: '{{input.data.body}}', meta: '{{input.data.metadata}}' } },
  ];

  return (
    <div className="space-y-4">
      {/* Content Type */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Content Type</label>
        <QuickSelectGrid
          value={config.contentType || 'post'}
          onChange={(v) => onChange('contentType', v)}
          columns={2}
          options={contentTypes.map((t) => ({
            value: t.value,
            label: t.label,
            icon: t.icon,
          }))}
        />
      </div>

      {/* Custom Type Name */}
      {config.contentType === 'custom' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Custom Type Name</label>
          <input
            type="text"
            value={config.customTypeName || ''}
            onChange={(e) => onChange('customTypeName', e.target.value)}
            placeholder="e.g., testimonial, portfolio"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          />
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Initial Status</label>
        <QuickSelectGrid
          value={config.status || 'draft'}
          onChange={(v) => onChange('status', v)}
          columns={2}
          options={statusOptions}
        />
      </div>

      {/* Field Mapping */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-neutral-500">Field Mapping</label>
          <div className="flex gap-1">
            {fieldTemplates.map((t) => (
              <button
                key={t.name}
                onClick={() => onChange('fields', t.fields)}
                className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={JSON.stringify(config.fields || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange('fields', JSON.parse(e.target.value));
            } catch {}
          }}
          placeholder='{\n  "title": "{{input.title}}",\n  "content": "{{input.content}}"\n}'
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[120px]"
        />
      </div>

      {/* Categories/Tags */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Categories</label>
          <ExpressionInput
            value={config.categories || ''}
            onChange={(v) => onChange('categories', v)}
            placeholder="{{input.categories}}"
            variables={[{ name: 'input.categories', description: 'Category IDs array' }]}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Tags</label>
          <ExpressionInput
            value={config.tags || ''}
            onChange={(v) => onChange('tags', v)}
            placeholder="{{input.tags}}"
            variables={[{ name: 'input.tags', description: 'Tag names array' }]}
          />
        </div>
      </div>

      {/* Author */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Author</label>
        <ExpressionInput
          value={config.author || ''}
          onChange={(v) => onChange('author', v)}
          placeholder="{{input.authorId}} or leave empty for current user"
          variables={[
            { name: 'input.authorId', description: 'Author user ID' },
            { name: 'input.user.id', description: 'Current user ID' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// RUN FUNCTION BUILDER
// ============================================

export function RunFunctionBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const runtimeOptions = [
    { value: 'javascript', label: 'JavaScript', description: 'Node.js runtime' },
    { value: 'typescript', label: 'TypeScript', description: 'TypeScript with types' },
    { value: 'python', label: 'Python', description: 'Python 3.x runtime' },
    { value: 'rust', label: 'Rust (WASM)', description: 'WebAssembly compiled' },
  ];

  const functionTemplates = [
    { name: 'Transform Data', description: 'Modify input data' },
    { name: 'Validate Input', description: 'Check data validity' },
    { name: 'Calculate', description: 'Perform calculations' },
    { name: 'Format Output', description: 'Prepare API response' },
  ];

  return (
    <div className="space-y-4">
      {/* Function Selection Mode */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Function Source</label>
        <QuickSelectGrid
          value={config.functionSource || 'existing'}
          onChange={(v) => onChange('functionSource', v)}
          columns={2}
          options={[
            { value: 'existing', label: 'Existing Function', description: 'Select from library' },
            { value: 'inline', label: 'Inline Code', description: 'Write code here' },
          ]}
        />
      </div>

      {/* Existing Function Selector */}
      {config.functionSource === 'existing' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Select Function</label>
          <select
            value={config.functionId || ''}
            onChange={(e) => onChange('functionId', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          >
            <option value="">Select a function...</option>
            <optgroup label="Data Processing">
              <option value="transform-json">Transform JSON</option>
              <option value="validate-schema">Validate Schema</option>
              <option value="sanitize-html">Sanitize HTML</option>
            </optgroup>
            <optgroup label="Utilities">
              <option value="generate-uuid">Generate UUID</option>
              <option value="hash-data">Hash Data</option>
              <option value="encode-base64">Encode Base64</option>
            </optgroup>
            <optgroup label="Integrations">
              <option value="slack-format">Format for Slack</option>
              <option value="email-template">Email Template</option>
              <option value="webhook-sign">Sign Webhook</option>
            </optgroup>
          </select>
        </div>
      )}

      {/* Inline Code */}
      {config.functionSource === 'inline' && (
        <>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2">Runtime</label>
            <QuickSelectGrid
              value={config.runtime || 'javascript'}
              onChange={(v) => onChange('runtime', v)}
              columns={2}
              options={runtimeOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2">Function Code</label>
            <textarea
              value={config.code || '// Access input with `input`\nreturn { result: input };'}
              onChange={(e) => onChange('code', e.target.value)}
              placeholder="// Your function code"
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[150px]"
              spellCheck={false}
            />
          </div>
        </>
      )}

      {/* Function Arguments */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Arguments</label>
        <textarea
          value={JSON.stringify(config.arguments || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange('arguments', JSON.parse(e.target.value));
            } catch {}
          }}
          placeholder='{\n  "param1": "{{input.value}}"\n}'
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none"
          rows={3}
        />
      </div>

      {/* Timeout */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Execution Timeout</label>
        <select
          value={config.timeout || 30000}
          onChange={(e) => onChange('timeout', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value={5000}>5 seconds</option>
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={60000}>1 minute</option>
          <option value={300000}>5 minutes</option>
        </select>
      </div>
    </div>
  );
}

// ============================================
// CALL PLUGIN BUILDER
// ============================================

export function CallPluginBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const popularPlugins = [
    {
      id: 'seo-optimizer',
      name: 'SEO Optimizer',
      methods: ['analyzePage', 'generateMeta', 'checkLinks', 'generateSitemap'],
    },
    {
      id: 'image-optimizer',
      name: 'Image Optimizer',
      methods: ['optimize', 'resize', 'convert', 'generateThumbnail'],
    },
    {
      id: 'email-marketing',
      name: 'Email Marketing',
      methods: ['addSubscriber', 'sendCampaign', 'createTemplate', 'getStats'],
    },
    {
      id: 'analytics',
      name: 'Analytics',
      methods: ['trackEvent', 'getPageViews', 'getUserStats', 'exportReport'],
    },
    {
      id: 'backup-manager',
      name: 'Backup Manager',
      methods: ['createBackup', 'restoreBackup', 'listBackups', 'scheduleBackup'],
    },
    {
      id: 'social-share',
      name: 'Social Share',
      methods: ['shareToTwitter', 'shareToFacebook', 'shareToLinkedIn', 'getShareCounts'],
    },
  ];

  const selectedPlugin = popularPlugins.find((p) => p.id === config.pluginId);

  return (
    <div className="space-y-4">
      {/* Plugin Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Select Plugin</label>
        <select
          value={config.pluginId || ''}
          onChange={(e) => {
            onChange('pluginId', e.target.value);
            onChange('method', ''); // Reset method when plugin changes
          }}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value="">Select a plugin...</option>
          {popularPlugins.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
          <option value="custom">Custom Plugin ID</option>
        </select>
      </div>

      {/* Custom Plugin ID */}
      {config.pluginId === 'custom' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Plugin ID</label>
          <input
            type="text"
            value={config.customPluginId || ''}
            onChange={(e) => onChange('customPluginId', e.target.value)}
            placeholder="my-custom-plugin"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          />
        </div>
      )}

      {/* Method Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Method</label>
        {selectedPlugin ? (
          <div className="grid grid-cols-2 gap-2">
            {selectedPlugin.methods.map((method) => (
              <button
                key={method}
                onClick={() => onChange('method', method)}
                className={`p-2 text-left text-sm rounded-lg border transition-all ${
                  config.method === method
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <code className="text-primary-600 dark:text-primary-400">{method}()</code>
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={config.method || ''}
            onChange={(e) => onChange('method', e.target.value)}
            placeholder="methodName"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono"
          />
        )}
      </div>

      {/* Method Arguments */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Arguments</label>
        <textarea
          value={JSON.stringify(config.args || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange('args', JSON.parse(e.target.value));
            } catch {}
          }}
          placeholder='{\n  "param1": "{{input.value}}"\n}'
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[100px]"
        />
      </div>

      {/* Async Execution */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.async || false}
            onChange={(e) => onChange('async', e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Async execution (don't wait for result)
          </span>
        </label>
      </div>
    </div>
  );
}

// ============================================
// SWITCH BUILDER
// ============================================

export function SwitchBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const switchTemplates = [
    {
      name: 'HTTP Status',
      expression: 'input.status',
      cases: [
        { value: '200', label: 'Success (200)' },
        { value: '400', label: 'Bad Request (400)' },
        { value: '404', label: 'Not Found (404)' },
        { value: '500', label: 'Server Error (500)' },
      ],
    },
    {
      name: 'User Role',
      expression: 'input.user.role',
      cases: [
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Editor' },
        { value: 'author', label: 'Author' },
        { value: 'subscriber', label: 'Subscriber' },
      ],
    },
    {
      name: 'Content Status',
      expression: 'input.status',
      cases: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      name: 'Order Status',
      expression: 'input.order.status',
      cases: [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
      ],
    },
  ];

  const cases = config.cases || [{ value: '', label: '' }];

  const addCase = () => {
    onChange('cases', [...cases, { value: '', label: '' }]);
  };

  const updateCase = (index: number, field: 'value' | 'label', value: string) => {
    const newCases = [...cases];
    newCases[index] = { ...newCases[index], [field]: value };
    onChange('cases', newCases);
  };

  const removeCase = (index: number) => {
    onChange('cases', cases.filter((_: any, i: number) => i !== index));
  };

  const applyTemplate = (template: typeof switchTemplates[0]) => {
    onChange('expression', template.expression);
    onChange('cases', template.cases);
  };

  return (
    <div className="space-y-4">
      {/* Quick Templates */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Templates</label>
        <div className="flex flex-wrap gap-1">
          {switchTemplates.map((t) => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t)}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Switch Expression */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Switch Expression</label>
        <ExpressionInput
          value={config.expression || ''}
          onChange={(v) => onChange('expression', v)}
          placeholder="input.status"
          variables={[
            { name: 'input.status', description: 'Status value' },
            { name: 'input.type', description: 'Type value' },
            { name: 'input.user.role', description: 'User role' },
          ]}
        />
        <p className="mt-1 text-xs text-neutral-500">Value to evaluate against cases</p>
      </div>

      {/* Cases */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Cases</label>
        <div className="space-y-2">
          {cases.map((c: any, i: number) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={c.value}
                onChange={(e) => updateCase(i, 'value', e.target.value)}
                placeholder="Value to match"
                className="flex-1 px-2 py-1.5 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono"
              />
              <input
                type="text"
                value={c.label}
                onChange={(e) => updateCase(i, 'label', e.target.value)}
                placeholder="Output label"
                className="flex-1 px-2 py-1.5 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
              />
              <button
                onClick={() => removeCase(i)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                disabled={cases.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addCase}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Case
          </button>
        </div>
      </div>

      {/* Default Case */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.hasDefault ?? true}
            onChange={(e) => onChange('hasDefault', e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Include default case (when no match)
          </span>
        </label>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <GitBranch className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p>Each case creates a separate output. Connect downstream nodes to the appropriate case outputs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PARALLEL BUILDER
// ============================================

export function ParallelBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const branches = config.branches || [{ id: '1', name: 'Branch 1' }, { id: '2', name: 'Branch 2' }];

  const addBranch = () => {
    const newId = (branches.length + 1).toString();
    onChange('branches', [...branches, { id: newId, name: `Branch ${newId}` }]);
  };

  const updateBranch = (index: number, name: string) => {
    const newBranches = [...branches];
    newBranches[index] = { ...newBranches[index], name };
    onChange('branches', newBranches);
  };

  const removeBranch = (index: number) => {
    if (branches.length > 2) {
      onChange('branches', branches.filter((_: any, i: number) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      {/* Execution Strategy */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Execution Strategy</label>
        <QuickSelectGrid
          value={config.strategy || 'all'}
          onChange={(v) => onChange('strategy', v)}
          columns={2}
          options={[
            { value: 'all', label: 'Wait for All', description: 'Continue when all branches complete' },
            { value: 'any', label: 'Wait for Any', description: 'Continue when first branch completes' },
            { value: 'race', label: 'Race', description: 'Use first result, cancel others' },
            { value: 'allSettled', label: 'All Settled', description: 'Wait for all, including failures' },
          ]}
        />
      </div>

      {/* Branches */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Parallel Branches ({branches.length})</label>
        <div className="space-y-2">
          {branches.map((branch: any, i: number) => (
            <div key={branch.id} className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                {i + 1}
              </div>
              <input
                type="text"
                value={branch.name}
                onChange={(e) => updateBranch(i, e.target.value)}
                placeholder={`Branch ${i + 1}`}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
              />
              <button
                onClick={() => removeBranch(i)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                disabled={branches.length <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addBranch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Branch
          </button>
        </div>
      </div>

      {/* Timeout */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Branch Timeout</label>
        <select
          value={config.branchTimeout || 60000}
          onChange={(e) => onChange('branchTimeout', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={60000}>1 minute</option>
          <option value={300000}>5 minutes</option>
          <option value={600000}>10 minutes</option>
          <option value={0}>No timeout</option>
        </select>
      </div>

      {/* Fail Fast */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.failFast ?? false}
            onChange={(e) => onChange('failFast', e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Fail fast (stop all branches if one fails)
          </span>
        </label>
      </div>

      {/* Info */}
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
          <div className="text-xs text-purple-700 dark:text-purple-300">
            <p>Each branch has its own output connection. Connect different nodes to each branch to run them in parallel.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MERGE BUILDER
// ============================================

export function MergeBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Merge Strategy */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Merge Strategy</label>
        <QuickSelectGrid
          value={config.strategy || 'object'}
          onChange={(v) => onChange('strategy', v)}
          columns={2}
          options={[
            { value: 'object', label: 'As Object', description: 'Combine into single object' },
            { value: 'array', label: 'As Array', description: 'Collect into array' },
            { value: 'first', label: 'First Value', description: 'Use first input only' },
            { value: 'last', label: 'Last Value', description: 'Use last input only' },
          ]}
        />
      </div>

      {/* Wait Mode */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Wait Mode</label>
        <QuickSelectGrid
          value={config.waitMode || 'all'}
          onChange={(v) => onChange('waitMode', v)}
          columns={2}
          options={[
            { value: 'all', label: 'Wait for All', description: 'All inputs must arrive' },
            { value: 'any', label: 'Wait for Any', description: 'Continue with first input' },
          ]}
        />
      </div>

      {/* Expected Inputs */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Expected Input Count</label>
        <select
          value={config.expectedInputs || 2}
          onChange={(e) => onChange('expectedInputs', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value={2}>2 inputs</option>
          <option value={3}>3 inputs</option>
          <option value={4}>4 inputs</option>
          <option value={5}>5 inputs</option>
          <option value={0}>Dynamic (auto-detect)</option>
        </select>
      </div>

      {/* Timeout */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Wait Timeout</label>
        <select
          value={config.timeout || 60000}
          onChange={(e) => onChange('timeout', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={60000}>1 minute</option>
          <option value={300000}>5 minutes</option>
          <option value={0}>No timeout</option>
        </select>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Shuffle className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p><strong>As Object:</strong> <code>{`{ branch1: data1, branch2: data2 }`}</code></p>
            <p><strong>As Array:</strong> <code>{`[data1, data2, data3]`}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// RETRY BUILDER
// ============================================

export function RetryBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const retryPresets = [
    { name: 'Quick retry', attempts: 3, delay: 1000, backoff: 'fixed' },
    { name: 'Exponential', attempts: 5, delay: 1000, backoff: 'exponential' },
    { name: 'Slow retry', attempts: 3, delay: 5000, backoff: 'fixed' },
    { name: 'Aggressive', attempts: 10, delay: 500, backoff: 'linear' },
  ];

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-1">
          {retryPresets.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                onChange('maxAttempts', p.attempts);
                onChange('initialDelay', p.delay);
                onChange('backoffType', p.backoff);
              }}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Max Attempts */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Maximum Attempts</label>
        <div className="flex gap-2">
          {[1, 3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => onChange('maxAttempts', n)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                config.maxAttempts === n
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Backoff Type */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Backoff Strategy</label>
        <QuickSelectGrid
          value={config.backoffType || 'exponential'}
          onChange={(v) => onChange('backoffType', v)}
          columns={3}
          options={[
            { value: 'fixed', label: 'Fixed', description: 'Same delay each time' },
            { value: 'exponential', label: 'Exponential', description: 'Doubles each retry' },
            { value: 'linear', label: 'Linear', description: 'Increases steadily' },
          ]}
        />
      </div>

      {/* Initial Delay */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Initial Delay</label>
        <select
          value={config.initialDelay || 1000}
          onChange={(e) => onChange('initialDelay', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value={500}>500ms</option>
          <option value={1000}>1 second</option>
          <option value={2000}>2 seconds</option>
          <option value={5000}>5 seconds</option>
          <option value={10000}>10 seconds</option>
        </select>
      </div>

      {/* Max Delay */}
      {config.backoffType !== 'fixed' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Maximum Delay</label>
          <select
            value={config.maxDelay || 30000}
            onChange={(e) => onChange('maxDelay', Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          >
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
          </select>
        </div>
      )}

      {/* Retry Conditions */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Retry On</label>
        <div className="space-y-2">
          {[
            { key: 'retryOnError', label: 'Any error' },
            { key: 'retryOnTimeout', label: 'Timeout' },
            { key: 'retryOn5xx', label: 'HTTP 5xx errors' },
            { key: 'retryOn429', label: 'Rate limit (429)' },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config[opt.key] ?? (opt.key === 'retryOnError')}
                onChange={(e) => onChange(opt.key, e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Retry Schedule Preview:</p>
        <div className="text-xs text-neutral-500 font-mono">
          {Array.from({ length: Math.min(config.maxAttempts || 3, 5) }, (_, i) => {
            let delay = config.initialDelay || 1000;
            if (config.backoffType === 'exponential') {
              delay = Math.min(delay * Math.pow(2, i), config.maxDelay || 30000);
            } else if (config.backoffType === 'linear') {
              delay = Math.min(delay * (i + 1), config.maxDelay || 30000);
            }
            return (
              <div key={i}>
                Attempt {i + 1}: {i === 0 ? 'Immediate' : `after ${delay >= 1000 ? `${delay / 1000}s` : `${delay}ms`}`}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SET VARIABLE BUILDER
// ============================================

export function SetVariableBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const variables = config.variables || [{ name: '', value: '', id: '1' }];

  const addVariable = () => {
    onChange('variables', [...variables, { name: '', value: '', id: Date.now().toString() }]);
  };

  const updateVariable = (id: string, field: 'name' | 'value', value: string) => {
    onChange('variables', variables.map((v: any) => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariable = (id: string) => {
    onChange('variables', variables.filter((v: any) => v.id !== id));
  };

  const variableTemplates = [
    { name: 'timestamp', value: 'new Date().toISOString()' },
    { name: 'counter', value: '(workflow.counter || 0) + 1' },
    { name: 'result', value: 'input.data' },
    { name: 'userId', value: 'input.user.id' },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Templates */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Add</label>
        <div className="flex flex-wrap gap-1">
          {variableTemplates.map((t) => (
            <button
              key={t.name}
              onClick={() => onChange('variables', [...variables, { ...t, id: Date.now().toString() }])}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Variables */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Variables to Set</label>
        <div className="space-y-2">
          {variables.map((v: any) => (
            <div key={v.id} className="flex gap-2">
              <input
                type="text"
                value={v.name}
                onChange={(e) => updateVariable(v.id, 'name', e.target.value)}
                placeholder="Variable name"
                className="w-1/3 px-2 py-1.5 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono"
              />
              <input
                type="text"
                value={v.value}
                onChange={(e) => updateVariable(v.id, 'value', e.target.value)}
                placeholder="Value or expression"
                className="flex-1 px-2 py-1.5 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
              />
              <button
                onClick={() => removeVariable(v.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                disabled={variables.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addVariable}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Variable
          </button>
        </div>
      </div>

      {/* Scope */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Variable Scope</label>
        <QuickSelectGrid
          value={config.scope || 'workflow'}
          onChange={(v) => onChange('scope', v)}
          columns={2}
          options={[
            { value: 'workflow', label: 'Workflow', description: 'Available in entire workflow' },
            { value: 'global', label: 'Global', description: 'Persists across runs' },
          ]}
        />
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Variable className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p>Access variables in other nodes using:</p>
            <code className="block mt-1 p-1 bg-blue-100 dark:bg-blue-900/30 rounded">{'{{workflow.variableName}}'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOG BUILDER
// ============================================

export function LogBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const logLevels = [
    { value: 'debug', label: 'Debug', color: 'text-neutral-500', description: 'Detailed debugging' },
    { value: 'info', label: 'Info', color: 'text-blue-500', description: 'General information' },
    { value: 'warn', label: 'Warning', color: 'text-amber-500', description: 'Potential issues' },
    { value: 'error', label: 'Error', color: 'text-red-500', description: 'Error conditions' },
  ];

  const messageTemplates = [
    { label: 'Workflow started', message: 'Workflow started with input: {{JSON.stringify(input)}}' },
    { label: 'Step completed', message: 'Step completed: {{stepName}} - Duration: {{duration}}ms' },
    { label: 'Data received', message: 'Received {{input.data.length}} items from {{input.source}}' },
    { label: 'Error occurred', message: 'Error in {{nodeName}}: {{error.message}}' },
    { label: 'API response', message: 'API returned status {{input.status}}: {{input.statusText}}' },
  ];

  return (
    <div className="space-y-4">
      {/* Log Level */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Log Level</label>
        <div className="flex gap-1">
          {logLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onChange('level', level.value)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                config.level === level.value
                  ? `bg-neutral-900 dark:bg-white text-white dark:text-neutral-900`
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              <span className={config.level === level.value ? '' : level.color}>{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Templates */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Messages</label>
        <div className="flex flex-wrap gap-1">
          {messageTemplates.map((t) => (
            <button
              key={t.label}
              onClick={() => onChange('message', t.message)}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Log Message</label>
        <ExpressionInput
          value={config.message || ''}
          onChange={(v) => onChange('message', v)}
          placeholder="Processing {{input.data.length}} items..."
          multiline
          variables={[
            { name: 'input', description: 'Input data' },
            { name: 'input.data', description: 'Data payload' },
            { name: 'workflow.name', description: 'Workflow name' },
            { name: 'JSON.stringify(input)', description: 'Full input as JSON' },
          ]}
        />
      </div>

      {/* Include Data */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.includeData ?? false}
            onChange={(e) => onChange('includeData', e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Include full input data in log
          </span>
        </label>
      </div>

      {/* Log Destination */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Log Destination</label>
        <div className="space-y-2">
          {[
            { key: 'logToConsole', label: 'Console', default: true },
            { key: 'logToFile', label: 'Log file', default: false },
            { key: 'logToDatabase', label: 'Database', default: false },
            { key: 'logToExternal', label: 'External service (webhook)', default: false },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config[opt.key] ?? opt.default}
                onChange={(e) => onChange(opt.key, e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// RUSTPRESS API BUILDER
// ============================================

export function RustPressApiBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const apiEndpoints = [
    {
      category: 'Content',
      endpoints: [
        { method: 'GET', path: '/api/posts', description: 'List all posts' },
        { method: 'GET', path: '/api/posts/:id', description: 'Get post by ID' },
        { method: 'POST', path: '/api/posts', description: 'Create new post' },
        { method: 'PUT', path: '/api/posts/:id', description: 'Update post' },
        { method: 'DELETE', path: '/api/posts/:id', description: 'Delete post' },
        { method: 'GET', path: '/api/pages', description: 'List all pages' },
        { method: 'GET', path: '/api/media', description: 'List media files' },
      ],
    },
    {
      category: 'Users',
      endpoints: [
        { method: 'GET', path: '/api/users', description: 'List users' },
        { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
        { method: 'GET', path: '/api/users/me', description: 'Get current user' },
        { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
      ],
    },
    {
      category: 'Settings',
      endpoints: [
        { method: 'GET', path: '/api/settings', description: 'Get site settings' },
        { method: 'PUT', path: '/api/settings', description: 'Update settings' },
        { method: 'GET', path: '/api/plugins', description: 'List plugins' },
        { method: 'GET', path: '/api/themes', description: 'List themes' },
      ],
    },
    {
      category: 'System',
      endpoints: [
        { method: 'GET', path: '/api/health', description: 'Health check' },
        { method: 'GET', path: '/api/stats', description: 'Site statistics' },
        { method: 'POST', path: '/api/cache/clear', description: 'Clear cache' },
        { method: 'POST', path: '/api/backup', description: 'Create backup' },
      ],
    },
  ];

  const selectEndpoint = (endpoint: { method: string; path: string }) => {
    onChange('method', endpoint.method);
    onChange('endpoint', endpoint.path);
  };

  return (
    <div className="space-y-4">
      {/* Quick Select Endpoint */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Quick Select API Endpoint</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {apiEndpoints.map((cat) => (
            <div key={cat.category}>
              <div className="text-xs font-medium text-neutral-400 mb-1">{cat.category}</div>
              <div className="grid grid-cols-1 gap-1">
                {cat.endpoints.map((ep) => (
                  <button
                    key={`${ep.method}-${ep.path}`}
                    onClick={() => selectEndpoint(ep)}
                    className={`p-2 text-left rounded-lg text-xs transition-all ${
                      config.method === ep.method && config.endpoint === ep.path
                        ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-500'
                        : 'bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className={`font-mono font-medium ${
                      ep.method === 'GET' ? 'text-green-600' :
                      ep.method === 'POST' ? 'text-blue-600' :
                      ep.method === 'PUT' ? 'text-amber-600' :
                      'text-red-600'
                    }`}>{ep.method}</span>
                    <span className="ml-2 text-neutral-700 dark:text-neutral-300">{ep.path}</span>
                    <span className="ml-2 text-neutral-500">- {ep.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Endpoint */}
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Method</label>
          <select
            value={config.method || 'GET'}
            onChange={(e) => onChange('method', e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        <div className="col-span-3">
          <label className="block text-xs font-medium text-neutral-500 mb-1">Endpoint</label>
          <ExpressionInput
            value={config.endpoint || ''}
            onChange={(v) => onChange('endpoint', v)}
            placeholder="/api/posts/{{input.id}}"
            variables={[
              { name: 'input.id', description: 'Resource ID' },
              { name: 'input.userId', description: 'User ID' },
            ]}
          />
        </div>
      </div>

      {/* Request Body */}
      {['POST', 'PUT', 'PATCH'].includes(config.method) && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Request Body</label>
          <textarea
            value={typeof config.body === 'string' ? config.body : JSON.stringify(config.body || {}, null, 2)}
            onChange={(e) => {
              try {
                onChange('body', JSON.parse(e.target.value));
              } catch {
                onChange('body', e.target.value);
              }
            }}
            placeholder='{\n  "title": "{{input.title}}"\n}'
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[100px]"
          />
        </div>
      )}

      {/* Query Parameters */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Query Parameters</label>
        <textarea
          value={JSON.stringify(config.queryParams || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange('queryParams', JSON.parse(e.target.value));
            } catch {}
          }}
          placeholder='{\n  "page": 1,\n  "limit": 10\n}'
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}

// ============================================
// SUB-WORKFLOW BUILDER
// ============================================

export function SubWorkflowBuilder({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  // In a real implementation, this would fetch available workflows
  const availableWorkflows = [
    { id: 'send-notification', name: 'Send Notification', description: 'Send email/push notification' },
    { id: 'process-payment', name: 'Process Payment', description: 'Handle payment processing' },
    { id: 'sync-data', name: 'Sync External Data', description: 'Synchronize with external service' },
    { id: 'generate-report', name: 'Generate Report', description: 'Create and send reports' },
    { id: 'cleanup-old-data', name: 'Cleanup Old Data', description: 'Archive or delete old records' },
  ];

  return (
    <div className="space-y-4">
      {/* Workflow Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Select Workflow</label>
        <select
          value={config.workflowId || ''}
          onChange={(e) => onChange('workflowId', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        >
          <option value="">Select a workflow...</option>
          {availableWorkflows.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        {config.workflowId && (
          <p className="mt-1 text-xs text-neutral-500">
            {availableWorkflows.find((w) => w.id === config.workflowId)?.description}
          </p>
        )}
      </div>

      {/* Or Enter ID */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Or Enter Workflow ID</label>
        <ExpressionInput
          value={config.workflowId || ''}
          onChange={(v) => onChange('workflowId', v)}
          placeholder="workflow-id or {{input.workflowId}}"
          variables={[{ name: 'input.workflowId', description: 'Dynamic workflow ID' }]}
        />
      </div>

      {/* Input Data */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Input Data for Sub-Workflow</label>
        <textarea
          value={JSON.stringify(config.inputData || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange('inputData', JSON.parse(e.target.value));
            } catch {}
          }}
          placeholder='{\n  "data": "{{input.data}}",\n  "userId": "{{input.userId}}"\n}'
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono resize-none min-h-[100px]"
        />
        <div className="mt-1 flex gap-1">
          <button
            onClick={() => onChange('inputData', { data: '{{input}}' })}
            className="text-xs text-primary-600 hover:underline"
          >
            Pass all input
          </button>
          <span className="text-neutral-400">|</span>
          <button
            onClick={() => onChange('inputData', { data: '{{input.data}}', userId: '{{input.userId}}' })}
            className="text-xs text-primary-600 hover:underline"
          >
            Pass selected fields
          </button>
        </div>
      </div>

      {/* Execution Mode */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">Execution Mode</label>
        <QuickSelectGrid
          value={config.executionMode || 'sync'}
          onChange={(v) => onChange('executionMode', v)}
          columns={2}
          options={[
            { value: 'sync', label: 'Synchronous', description: 'Wait for completion' },
            { value: 'async', label: 'Asynchronous', description: 'Fire and forget' },
          ]}
        />
      </div>

      {/* Timeout */}
      {config.executionMode === 'sync' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">Timeout</label>
          <select
            value={config.timeout || 60000}
            onChange={(e) => onChange('timeout', Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          >
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
            <option value={600000}>10 minutes</option>
            <option value={0}>No timeout</option>
          </select>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Link className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p><strong>Sync:</strong> Waits for sub-workflow to complete and returns its output</p>
            <p><strong>Async:</strong> Triggers sub-workflow and continues immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORT ALL BUILDERS
// ============================================

export const nodeBuilders: Record<string, React.ComponentType<{ config: Record<string, any>; onChange: (key: string, value: any) => void }>> = {
  // Triggers
  'manual': ManualTriggerBuilder,
  'schedule': ScheduleBuilder,
  'webhook': WebhookBuilder,
  'event': EventTriggerBuilder,

  // Actions
  'http_request': HttpRequestBuilder,
  'database_query': DatabaseQueryBuilder,
  'send_email': EmailBuilder,
  'create_content': CreateContentBuilder,
  'run_function': RunFunctionBuilder,
  'call_plugin': CallPluginBuilder,

  // Logic
  'if_else': ConditionBuilder,
  'switch': SwitchBuilder,
  'loop': LoopBuilder,
  'parallel': ParallelBuilder,
  'merge': MergeBuilder,

  // Transform
  'map': MapBuilder,
  'filter': FilterBuilder,
  'template': TemplateBuilder,

  // Utilities
  'delay': DelayBuilder,
  'retry': RetryBuilder,
  'error_handler': ConditionBuilder, // Reuse condition builder for error handling
  'set_variable': SetVariableBuilder,
  'log': LogBuilder,

  // Integration
  'rustpress_api': RustPressApiBuilder,
  'sub_workflow': SubWorkflowBuilder,

  // Custom
  'custom_code': CustomCodeBuilder,
};

export function getNodeBuilder(nodeType: string) {
  return nodeBuilders[nodeType];
}
