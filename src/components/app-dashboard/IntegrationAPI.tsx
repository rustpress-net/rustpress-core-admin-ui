/**
 * Integration & API Components
 * Part of the 30 Enterprise Dashboard Enhancements
 *
 * Features:
 * 1. GraphQL Playground
 * 2. Webhook Tester
 * 3. API Key Management
 * 4. Integration Health Dashboard
 * 5. Data Pipeline Monitor
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Play,
  Send,
  Webhook,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Database,
  Server,
  ArrowRight,
  Pause,
  Link,
  Settings,
  Zap,
  GitBranch,
  BarChart3,
} from 'lucide-react';

// ============================================
// 1. GraphQL Playground
// ============================================

interface QueryHistory {
  id: string;
  query: string;
  variables: string;
  timestamp: Date;
  duration: number;
  status: 'success' | 'error';
}

const sampleQueries = [
  {
    name: 'Get Users',
    query: `query GetUsers($limit: Int) {
  users(limit: $limit) {
    id
    name
    email
    role
    createdAt
  }
}`,
    variables: '{ "limit": 10 }',
  },
  {
    name: 'Get Applications',
    query: `query GetApplications {
  applications {
    id
    name
    status
    metrics {
      cpu
      memory
      requests
    }
  }
}`,
    variables: '{}',
  },
  {
    name: 'Create User',
    query: `mutation CreateUser($input: UserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}`,
    variables: '{ "input": { "name": "John", "email": "john@example.com" } }',
  },
];

export function GraphQLPlayground() {
  const [query, setQuery] = useState(sampleQueries[0].query);
  const [variables, setVariables] = useState(sampleQueries[0].variables);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'query' | 'history' | 'docs'>('query');

  const executeQuery = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const mockResult = {
      data: {
        users: [
          { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin', createdAt: '2024-01-15' },
          { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user', createdAt: '2024-01-16' },
          { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'user', createdAt: '2024-01-17' },
        ],
      },
    };

    const duration = Date.now() - startTime;
    setResult(JSON.stringify(mockResult, null, 2));
    setIsLoading(false);

    setHistory([
      {
        id: `q-${Date.now()}`,
        query,
        variables,
        timestamp: new Date(),
        duration,
        status: 'success',
      },
      ...history.slice(0, 9),
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">GraphQL Playground</h3>
            <p className="text-sm text-neutral-500">Execute queries and explore the API</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-transparent">
            <option>Production</option>
            <option>Staging</option>
            <option>Development</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        {[
          { id: 'query', label: 'Query' },
          { id: 'history', label: 'History' },
          { id: 'docs', label: 'Docs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'query' && (
          <div className="grid grid-cols-2 gap-4">
            {/* Query Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Query</span>
                <select
                  onChange={(e) => {
                    const sample = sampleQueries[Number(e.target.value)];
                    setQuery(sample.query);
                    setVariables(sample.variables);
                  }}
                  className="text-xs px-2 py-1 border border-neutral-200 dark:border-neutral-700 rounded bg-transparent"
                >
                  {sampleQueries.map((s, i) => (
                    <option key={i} value={i}>{s.name}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-40 px-3 py-2 font-mono text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg resize-none"
                placeholder="Enter your GraphQL query..."
              />
              <div className="mt-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Variables</span>
                <textarea
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  className="w-full h-20 mt-2 px-3 py-2 font-mono text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg resize-none"
                  placeholder='{ "key": "value" }'
                />
              </div>
              <button
                onClick={executeQuery}
                disabled={isLoading}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isLoading ? 'Executing...' : 'Execute Query'}
              </button>
            </div>

            {/* Result */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Result</span>
                {result && (
                  <button className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                )}
              </div>
              <div className="h-[280px] px-3 py-2 font-mono text-sm bg-neutral-900 text-green-400 border border-neutral-700 rounded-lg overflow-auto">
                {result ? (
                  <pre>{result}</pre>
                ) : (
                  <span className="text-neutral-500">Results will appear here...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-neutral-500 py-8">No query history yet</p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${
                      item.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {item.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-mono text-neutral-600 dark:text-neutral-300 truncate max-w-xs">
                        {item.query.split('\n')[0]}...
                      </p>
                      <p className="text-xs text-neutral-400">
                        {item.timestamp.toLocaleTimeString()} • {item.duration}ms
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setQuery(item.query); setVariables(item.variables); setActiveTab('query'); }}
                    className="text-xs text-primary-500 hover:text-primary-600"
                  >
                    Reuse
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="p-4 text-center text-neutral-500">
            <Code className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p>API documentation would be displayed here</p>
            <p className="text-sm mt-1">Including schema types, queries, and mutations</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// 2. Webhook Tester
// ============================================

interface WebhookTest {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: string;
  headers: Record<string, string>;
  response?: {
    status: number;
    body: string;
    duration: number;
  };
  timestamp: Date;
}

export function WebhookTester() {
  const [url, setUrl] = useState('https://api.example.com/webhook');
  const [method, setMethod] = useState<'POST' | 'PUT' | 'PATCH'>('POST');
  const [payload, setPayload] = useState(JSON.stringify({
    event: 'user.created',
    data: { id: '123', email: 'user@example.com' },
    timestamp: new Date().toISOString(),
  }, null, 2));
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
    'X-Webhook-Secret': 'whsec_xxx',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<WebhookTest['response'] | null>(null);
  const [history, setHistory] = useState<WebhookTest[]>([]);

  const testWebhook = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    // Simulate webhook call
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const mockResponse = {
      status: Math.random() > 0.2 ? 200 : 500,
      body: JSON.stringify({ received: true, processed: true }, null, 2),
      duration: Date.now() - startTime,
    };

    setResponse(mockResponse);
    setIsLoading(false);

    const test: WebhookTest = {
      id: `wh-${Date.now()}`,
      url,
      method,
      payload,
      headers,
      response: mockResponse,
      timestamp: new Date(),
    };
    setHistory([test, ...history.slice(0, 9)]);
  };

  const addHeader = () => {
    setHeaders({ ...headers, '': '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
          <Webhook className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Webhook Tester</h3>
          <p className="text-sm text-neutral-500">Test and debug webhook endpoints</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Request */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent font-mono text-sm"
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Webhook URL..."
              className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent text-sm"
            />
          </div>

          {/* Headers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Headers</span>
              <button onClick={addHeader} className="text-xs text-primary-500 hover:text-primary-600">
                + Add Header
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(headers).map(([key, value], i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newHeaders = { ...headers };
                      delete newHeaders[key];
                      newHeaders[e.target.value] = value;
                      setHeaders(newHeaders);
                    }}
                    placeholder="Header name"
                    className="w-1/3 px-2 py-1 border border-neutral-200 dark:border-neutral-700 rounded text-xs bg-transparent"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setHeaders({ ...headers, [key]: e.target.value })}
                    placeholder="Value"
                    className="flex-1 px-2 py-1 border border-neutral-200 dark:border-neutral-700 rounded text-xs bg-transparent"
                  />
                  <button
                    onClick={() => {
                      const { [key]: _, ...rest } = headers;
                      setHeaders(rest);
                    }}
                    className="p-1 text-neutral-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payload */}
          <div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Payload</span>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full h-32 mt-2 px-3 py-2 font-mono text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg resize-none"
            />
          </div>

          <button
            onClick={testWebhook}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isLoading ? 'Sending...' : 'Send Webhook'}
          </button>
        </div>

        {/* Response */}
        <div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Response</span>
          <div className="mt-2 h-64 p-3 bg-neutral-900 rounded-lg overflow-auto">
            {response ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    response.status < 400
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {response.status}
                  </span>
                  <span className="text-xs text-neutral-500">{response.duration}ms</span>
                </div>
                <pre className="text-sm text-green-400 font-mono">{response.body}</pre>
              </div>
            ) : (
              <span className="text-neutral-500 text-sm">Response will appear here...</span>
            )}
          </div>

          {/* Recent Tests */}
          <div className="mt-4">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Recent Tests</span>
            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
              {history.slice(0, 3).map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-900 rounded text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      test.response?.status && test.response.status < 400 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-[150px]">
                      {test.url}
                    </span>
                  </div>
                  <span className="text-neutral-400">{test.response?.duration}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// 3. API Key Management
// ============================================

interface APIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  permissions: string[];
  createdAt: Date;
  lastUsed: Date | null;
  expiresAt: Date | null;
  status: 'active' | 'expired' | 'revoked';
  usageCount: number;
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'rp_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'rp_prod_',
    permissions: ['read', 'write', 'delete'],
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date('2024-01-20'),
    expiresAt: null,
    status: 'active',
    usageCount: 15420,
  },
  {
    id: '2',
    name: 'Analytics Service',
    key: 'rp_prod_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    prefix: 'rp_prod_',
    permissions: ['read'],
    createdAt: new Date('2024-01-10'),
    lastUsed: new Date('2024-01-19'),
    expiresAt: new Date('2024-06-10'),
    status: 'active',
    usageCount: 8732,
  },
  {
    id: '3',
    name: 'Legacy Integration',
    key: 'rp_test_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    prefix: 'rp_test_',
    permissions: ['read', 'write'],
    createdAt: new Date('2023-06-15'),
    lastUsed: new Date('2023-12-01'),
    expiresAt: new Date('2024-01-01'),
    status: 'expired',
    usageCount: 45230,
  },
];

export function APIKeyManagement() {
  const [keys, setKeys] = useState<APIKey[]>(mockAPIKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const revokeKey = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
  };

  const createKey = () => {
    if (newKeyName) {
      const newKey: APIKey = {
        id: `key-${Date.now()}`,
        name: newKeyName,
        key: `sk_live_${Math.random().toString(36).substring(2, 38)}`,
        prefix: 'sk_live_',
        permissions: newKeyPermissions,
        createdAt: new Date(),
        lastUsed: null,
        expiresAt: null,
        status: 'active',
        usageCount: 0,
      };
      setKeys([newKey, ...keys]);
      setNewKeyName('');
      setNewKeyPermissions(['read']);
      setIsCreating(false);
    }
  };

  const maskKey = (key: string) => {
    const prefix = key.substring(0, 8);
    return `${prefix}${'•'.repeat(32)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">API Keys</h3>
            <p className="text-sm text-neutral-500">Manage your API access credentials</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </div>

      {/* Create Key Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Key name (e.g., Production API)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm"
              />
              <div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 block">Permissions</span>
                <div className="flex gap-2">
                  {['read', 'write', 'delete'].map((perm) => (
                    <button
                      key={perm}
                      onClick={() => {
                        if (newKeyPermissions.includes(perm)) {
                          setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm));
                        } else {
                          setNewKeyPermissions([...newKeyPermissions, perm]);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-sm capitalize ${
                        newKeyPermissions.includes(perm)
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {perm}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createKey}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm"
                >
                  Create API Key
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys List */}
      <div className="space-y-3">
        {keys.map((apiKey) => (
          <motion.div
            key={apiKey.id}
            layout
            className={`p-4 rounded-xl border ${
              apiKey.status === 'active'
                ? 'border-neutral-200 dark:border-neutral-700'
                : 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-neutral-900 dark:text-white">{apiKey.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    apiKey.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : apiKey.status === 'expired'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}>
                    {apiKey.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <code className="px-2 py-1 bg-neutral-100 dark:bg-neutral-900 rounded text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    {visibleKeys.has(apiKey.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyKey(apiKey.key, apiKey.id)}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    {copiedKey === apiKey.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">
                  Created {apiKey.createdAt.toLocaleDateString()}
                </p>
                <p className="text-xs text-neutral-500">
                  {apiKey.usageCount.toLocaleString()} requests
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex gap-1">
                {apiKey.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs capitalize"
                  >
                    {perm}
                  </span>
                ))}
              </div>
              {apiKey.status === 'active' && (
                <button
                  onClick={() => revokeKey(apiKey.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Revoke
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// 4. Integration Health Dashboard
// ============================================

interface Integration {
  id: string;
  name: string;
  icon: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastCheck: Date;
  errors24h: number;
  category: string;
}

const mockIntegrations: Integration[] = [
  { id: '1', name: 'Stripe', icon: '💳', status: 'healthy', latency: 45, uptime: 99.99, lastCheck: new Date(), errors24h: 0, category: 'Payments' },
  { id: '2', name: 'SendGrid', icon: '📧', status: 'healthy', latency: 120, uptime: 99.95, lastCheck: new Date(), errors24h: 2, category: 'Email' },
  { id: '3', name: 'AWS S3', icon: '☁️', status: 'healthy', latency: 35, uptime: 99.99, lastCheck: new Date(), errors24h: 0, category: 'Storage' },
  { id: '4', name: 'Twilio', icon: '📱', status: 'degraded', latency: 350, uptime: 98.5, lastCheck: new Date(), errors24h: 15, category: 'SMS' },
  { id: '5', name: 'GitHub', icon: '🐙', status: 'healthy', latency: 80, uptime: 99.9, lastCheck: new Date(), errors24h: 1, category: 'DevOps' },
  { id: '6', name: 'Slack', icon: '💬', status: 'down', latency: 0, uptime: 95.2, lastCheck: new Date(), errors24h: 142, category: 'Communication' },
  { id: '7', name: 'PostgreSQL', icon: '🐘', status: 'healthy', latency: 12, uptime: 99.99, lastCheck: new Date(), errors24h: 0, category: 'Database' },
  { id: '8', name: 'Redis', icon: '🔴', status: 'healthy', latency: 5, uptime: 99.99, lastCheck: new Date(), errors24h: 0, category: 'Cache' },
];

export function IntegrationHealthDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'degraded' | 'down'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const healthyCount = integrations.filter(i => i.status === 'healthy').length;
  const degradedCount = integrations.filter(i => i.status === 'degraded').length;
  const downCount = integrations.filter(i => i.status === 'down').length;

  const filteredIntegrations = filter === 'all'
    ? integrations
    : integrations.filter(i => i.status === filter);

  const refresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIntegrations(integrations.map(i => ({ ...i, lastCheck: new Date() })));
    setIsRefreshing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
            <Link className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Integration Health</h3>
            <p className="text-sm text-neutral-500">Monitor third-party service status</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div
          onClick={() => setFilter('healthy')}
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            filter === 'healthy' ? 'ring-2 ring-green-500' : ''
          } bg-green-50 dark:bg-green-900/20`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{healthyCount}</span>
          </div>
          <p className="text-sm text-green-600 mt-1">Healthy</p>
        </div>
        <div
          onClick={() => setFilter('degraded')}
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            filter === 'degraded' ? 'ring-2 ring-amber-500' : ''
          } bg-amber-50 dark:bg-amber-900/20`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{degradedCount}</span>
          </div>
          <p className="text-sm text-amber-600 mt-1">Degraded</p>
        </div>
        <div
          onClick={() => setFilter('down')}
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            filter === 'down' ? 'ring-2 ring-red-500' : ''
          } bg-red-50 dark:bg-red-900/20`}
        >
          <div className="flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold text-red-600">{downCount}</span>
          </div>
          <p className="text-sm text-red-600 mt-1">Down</p>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-1 mb-4 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
        {['all', 'healthy', 'degraded', 'down'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm capitalize transition-all ${
              filter === f
                ? 'bg-white dark:bg-neutral-700 shadow'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {filteredIntegrations.map((integration) => (
          <motion.div
            key={integration.id}
            layout
            className={`p-3 rounded-lg border ${
              integration.status === 'healthy'
                ? 'border-green-200 dark:border-green-900/50'
                : integration.status === 'degraded'
                ? 'border-amber-200 dark:border-amber-900/50'
                : 'border-red-200 dark:border-red-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{integration.icon}</span>
                <span className="font-medium text-neutral-900 dark:text-white">{integration.name}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                integration.status === 'healthy' ? 'bg-green-500' :
                integration.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{integration.latency}ms latency</span>
              <span>{integration.uptime}% uptime</span>
            </div>
            {integration.errors24h > 0 && (
              <p className="text-xs text-red-500 mt-1">
                {integration.errors24h} errors in 24h
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// 5. Data Pipeline Monitor
// ============================================

interface Pipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'running' | 'paused' | 'failed' | 'completed';
  progress: number;
  recordsProcessed: number;
  recordsTotal: number;
  startTime: Date;
  estimatedCompletion: Date | null;
  errors: number;
}

const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'User Analytics ETL',
    source: 'PostgreSQL',
    destination: 'BigQuery',
    status: 'running',
    progress: 67,
    recordsProcessed: 1547892,
    recordsTotal: 2300000,
    startTime: new Date(Date.now() - 3600000),
    estimatedCompletion: new Date(Date.now() + 1800000),
    errors: 0,
  },
  {
    id: '2',
    name: 'Event Stream Sync',
    source: 'Kafka',
    destination: 'Elasticsearch',
    status: 'running',
    progress: 100,
    recordsProcessed: 89234,
    recordsTotal: 89234,
    startTime: new Date(Date.now() - 7200000),
    estimatedCompletion: null,
    errors: 3,
  },
  {
    id: '3',
    name: 'Daily Backup',
    source: 'MongoDB',
    destination: 'S3',
    status: 'completed',
    progress: 100,
    recordsProcessed: 456789,
    recordsTotal: 456789,
    startTime: new Date(Date.now() - 14400000),
    estimatedCompletion: null,
    errors: 0,
  },
  {
    id: '4',
    name: 'ML Feature Pipeline',
    source: 'Redis',
    destination: 'ML Platform',
    status: 'paused',
    progress: 34,
    recordsProcessed: 12000,
    recordsTotal: 35000,
    startTime: new Date(Date.now() - 1800000),
    estimatedCompletion: null,
    errors: 1,
  },
  {
    id: '5',
    name: 'Log Aggregation',
    source: 'Fluentd',
    destination: 'Splunk',
    status: 'failed',
    progress: 45,
    recordsProcessed: 23456,
    recordsTotal: 52000,
    startTime: new Date(Date.now() - 900000),
    estimatedCompletion: null,
    errors: 15,
  },
];

export function DataPipelineMonitor() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipelines(pipes => pipes.map(p => {
        if (p.status === 'running' && p.progress < 100) {
          const newProgress = Math.min(p.progress + Math.random() * 2, 100);
          const newProcessed = Math.floor((newProgress / 100) * p.recordsTotal);
          return { ...p, progress: newProgress, recordsProcessed: newProcessed };
        }
        return p;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const togglePipeline = (id: string) => {
    setPipelines(pipelines.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'running' ? 'paused' : p.status === 'paused' ? 'running' : p.status,
        };
      }
      return p;
    }));
  };

  const retryPipeline = (id: string) => {
    setPipelines(pipelines.map(p => {
      if (p.id === id && p.status === 'failed') {
        return { ...p, status: 'running', errors: 0 };
      }
      return p;
    }));
  };

  const getStatusIcon = (status: Pipeline['status']) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'paused': return <Pause className="w-4 h-4 text-amber-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Data Pipelines</h3>
            <p className="text-sm text-neutral-500">Monitor ETL and data sync jobs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {pipelines.filter(p => p.status === 'running').length} running
          </span>
          <span className="text-neutral-300">|</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            {pipelines.filter(p => p.status === 'failed').length} failed
          </span>
        </div>
      </div>

      {/* Pipeline List */}
      <div className="space-y-3">
        {pipelines.map((pipeline) => (
          <motion.div
            key={pipeline.id}
            layout
            onClick={() => setSelectedPipeline(selectedPipeline === pipeline.id ? null : pipeline.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              pipeline.status === 'failed'
                ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(pipeline.status)}
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">{pipeline.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                    <Database className="w-3 h-3" />
                    {pipeline.source}
                    <ArrowRight className="w-3 h-3" />
                    <Server className="w-3 h-3" />
                    {pipeline.destination}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pipeline.status === 'failed' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); retryPipeline(pipeline.id); }}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Retry
                  </button>
                )}
                {(pipeline.status === 'running' || pipeline.status === 'paused') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePipeline(pipeline.id); }}
                    className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    {pipeline.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                <span>{formatNumber(pipeline.recordsProcessed)} / {formatNumber(pipeline.recordsTotal)} records</span>
                <span>{pipeline.progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pipeline.progress}%` }}
                  className={`h-full rounded-full ${
                    pipeline.status === 'failed' ? 'bg-red-500' :
                    pipeline.status === 'completed' ? 'bg-blue-500' :
                    pipeline.status === 'paused' ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                />
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedPipeline === pipeline.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3 mt-3 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500 text-xs">Started</p>
                      <p className="font-medium">{pipeline.startTime.toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs">ETA</p>
                      <p className="font-medium">
                        {pipeline.estimatedCompletion
                          ? pipeline.estimatedCompletion.toLocaleTimeString()
                          : pipeline.status === 'completed' ? 'Done' : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs">Errors</p>
                      <p className={`font-medium ${pipeline.errors > 0 ? 'text-red-500' : ''}`}>
                        {pipeline.errors}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {pipeline.errors > 0 && pipeline.status !== 'failed' && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {pipeline.errors} warning{pipeline.errors > 1 ? 's' : ''} during execution
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-neutral-500">
              Total records today: <span className="font-medium text-neutral-900 dark:text-white">
                {formatNumber(pipelines.reduce((sum, p) => sum + p.recordsProcessed, 0))}
              </span>
            </span>
          </div>
          <button className="text-primary-500 hover:text-primary-600 flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </button>
        </div>
      </div>
    </motion.div>
  );
}
