/**
 * API Endpoints Dashboard Component
 * Manage API endpoints with various authentication methods
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Key,
  Shield,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Lock,
  Unlock,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap,
  Clock,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { DataTable, Column } from '../shared/DataTable';
import { Modal, SlideOver } from '../shared/Modal';
import { Tabs, TabPanel } from '../shared/Tabs';
import { SearchFilterBar } from '../shared/SearchFilter';
import { formatCompactNumber, formatRate } from '../shared/AnimatedCounter';
import type { ApiEndpoint, AuthMethod, EndpointOperation, RateLimitConfig } from '../../types/api-endpoints';

export function ApiEndpointsDashboard() {
  const { apiEndpoints, addApiEndpoint, deleteApiEndpoint, updateApiEndpoint } = useQueueManagerStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [authFilter, setAuthFilter] = useState<AuthMethod | ''>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    let result = apiEndpoints || [];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.path.toLowerCase().includes(search)
      );
    }

    if (authFilter) {
      result = result.filter(e => e.authMethod === authFilter);
    }

    return result;
  }, [apiEndpoints, searchTerm, authFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: (apiEndpoints || []).length,
    active: (apiEndpoints || []).filter(e => e.enabled).length,
    authMethods: {
      bearer: (apiEndpoints || []).filter(e => e.authMethod === 'bearer').length,
      apiKey: (apiEndpoints || []).filter(e => e.authMethod === 'api-key').length,
      basic: (apiEndpoints || []).filter(e => e.authMethod === 'basic').length,
      ssh: (apiEndpoints || []).filter(e => e.authMethod === 'ssh').length,
      oauth2: (apiEndpoints || []).filter(e => e.authMethod === 'oauth2').length,
    },
  }), [apiEndpoints]);

  const getAuthMethodBadge = (method: AuthMethod) => {
    const styles: Record<AuthMethod, { bg: string; text: string; label: string }> = {
      none: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600', label: 'No Auth' },
      basic: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Basic Auth' },
      bearer: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Bearer Token' },
      'api-key': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'API Key' },
      ssh: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'SSH' },
      oauth2: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400', label: 'OAuth2' },
      hmac: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', label: 'HMAC' },
      mtls: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'mTLS' },
    };
    const style = styles[method];
    return (
      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', style.bg, style.text)}>
        {style.label}
      </span>
    );
  };

  // Table columns
  const columns: Column<ApiEndpoint>[] = [
    {
      key: 'name',
      header: 'Endpoint',
      render: (endpoint) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            endpoint.enabled
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}>
            <Globe className={cn(
              'w-4 h-4',
              endpoint.enabled ? 'text-green-600' : 'text-neutral-500'
            )} />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{endpoint.name}</p>
            <code className="text-xs text-neutral-500">{endpoint.path}</code>
          </div>
        </div>
      ),
    },
    {
      key: 'authMethod',
      header: 'Authentication',
      width: '150px',
      render: (endpoint) => getAuthMethodBadge(endpoint.authMethod),
    },
    {
      key: 'rateLimit',
      header: 'Rate Limit',
      width: '120px',
      render: (endpoint) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {endpoint.rateLimit.enabled
            ? `${endpoint.rateLimit.requests}/${endpoint.rateLimit.windowSeconds}s`
            : 'Unlimited'}
        </span>
      ),
    },
    {
      key: 'allowedOperations',
      header: 'Operations',
      render: (endpoint) => (
        <div className="flex flex-wrap gap-1">
          {endpoint.allowedOperations.slice(0, 3).map((op) => (
            <span
              key={op}
              className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded"
            >
              {op}
            </span>
          ))}
          {endpoint.allowedOperations.length > 3 && (
            <span className="text-xs text-neutral-500">
              +{endpoint.allowedOperations.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'enabled',
      header: 'Status',
      width: '100px',
      render: (endpoint) => (
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full',
          endpoint.enabled
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
        )}>
          {endpoint.enabled ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              Disabled
            </>
          )}
        </span>
      ),
    },
  ];

  // Row actions
  const rowActions = (endpoint: ApiEndpoint) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setSelectedEndpoint(endpoint)}
        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => deleteApiEndpoint(endpoint.id)}
        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            API Endpoints
          </h2>
          <p className="text-sm text-neutral-500">
            Manage external API access with authentication
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Endpoint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Globe className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-neutral-500">Total Endpoints</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.active}</p>
              <p className="text-xs text-neutral-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Key className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.authMethods.bearer}</p>
              <p className="text-xs text-neutral-500">Bearer Token</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.authMethods.apiKey}</p>
              <p className="text-xs text-neutral-500">API Key</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Server className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.authMethods.ssh}</p>
              <p className="text-xs text-neutral-500">SSH</p>
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
            key: 'auth',
            label: 'Auth Method',
            value: authFilter,
            options: [
              { value: 'bearer', label: 'Bearer Token' },
              { value: 'api-key', label: 'API Key' },
              { value: 'basic', label: 'Basic Auth' },
              { value: 'ssh', label: 'SSH' },
              { value: 'oauth2', label: 'OAuth2' },
              { value: 'hmac', label: 'HMAC' },
              { value: 'mtls', label: 'mTLS' },
            ],
            onChange: (value) => setAuthFilter(value as AuthMethod | ''),
          },
        ]}
      />

      {/* Endpoints Table */}
      <DataTable
        data={filteredEndpoints}
        columns={columns}
        keyField="id"
        onRowClick={setSelectedEndpoint}
        rowActions={rowActions}
        emptyMessage="No API endpoints configured"
      />

      {/* Create Endpoint Modal */}
      <CreateEndpointModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={addApiEndpoint}
      />

      {/* Endpoint Detail Slide-over */}
      {selectedEndpoint && (
        <EndpointDetailView
          endpoint={selectedEndpoint}
          onClose={() => setSelectedEndpoint(null)}
          onUpdate={updateApiEndpoint}
        />
      )}
    </div>
  );
}

// Create Endpoint Modal
function CreateEndpointModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (endpoint: ApiEndpoint) => void;
}) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('/api/v1/');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('bearer');
  const [description, setDescription] = useState('');

  // Auth credentials
  const [token, setToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sshPublicKey, setSshPublicKey] = useState('');

  // Rate limiting
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [rateLimit, setRateLimit] = useState(100);
  const [rateLimitWindow, setRateLimitWindow] = useState(60);

  // Operations
  const [selectedOperations, setSelectedOperations] = useState<EndpointOperation[]>(['queue:read', 'exchange:read']);

  const availableOperations: EndpointOperation[] = [
    'queue:read', 'queue:write', 'queue:delete', 'queue:purge',
    'exchange:read', 'exchange:write', 'exchange:delete',
    'binding:read', 'binding:write', 'binding:delete',
    'message:read', 'message:publish', 'message:ack', 'message:nack',
    'connection:read', 'connection:close',
    'channel:read', 'channel:close',
    'user:read', 'user:write', 'user:delete',
    'vhost:read', 'vhost:write', 'vhost:delete',
    'policy:read', 'policy:write', 'policy:delete',
    'metrics:read', 'health:read',
  ];

  const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setToken(newToken);
  };

  const generateApiKey = () => {
    const prefix = 'vqm';
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setApiKey(`${prefix}_${key}`);
  };

  const handleSubmit = () => {
    const credentials: ApiEndpoint['credentials'] = {};

    switch (authMethod) {
      case 'bearer':
        credentials.token = token || undefined;
        break;
      case 'api-key':
        credentials.apiKey = apiKey || undefined;
        credentials.apiKeyHeader = 'X-API-Key';
        break;
      case 'basic':
        credentials.username = username || undefined;
        credentials.password = password || undefined;
        break;
      case 'ssh':
        credentials.sshPublicKey = sshPublicKey || undefined;
        break;
    }

    const endpoint: ApiEndpoint = {
      id: `endpoint-${Date.now()}`,
      name,
      description,
      path,
      authMethod,
      credentials,
      enabled: true,
      rateLimit: {
        enabled: rateLimitEnabled,
        requests: rateLimit,
        windowSeconds: rateLimitWindow,
      },
      ipWhitelist: {
        enabled: false,
        allowedIPs: [],
        allowedCIDRs: [],
      },
      allowedOperations: selectedOperations,
      createdAt: new Date().toISOString(),
      lastUsed: undefined,
      usageCount: 0,
    };

    onSubmit(endpoint);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPath('/api/v1/');
    setAuthMethod('bearer');
    setDescription('');
    setToken('');
    setApiKey('');
    setUsername('');
    setPassword('');
    setSshPublicKey('');
    setRateLimitEnabled(true);
    setRateLimit(100);
    setRateLimitWindow(60);
    setSelectedOperations(['queue:read', 'exchange:read']);
    onClose();
  };

  const toggleOperation = (op: EndpointOperation) => {
    setSelectedOperations(prev =>
      prev.includes(op)
        ? prev.filter(o => o !== op)
        : [...prev, op]
    );
  };

  const authMethods: { value: AuthMethod; label: string; description: string }[] = [
    { value: 'bearer', label: 'Bearer Token', description: 'JWT or opaque token in Authorization header' },
    { value: 'api-key', label: 'API Key', description: 'API key in custom header' },
    { value: 'basic', label: 'Basic Auth', description: 'Username and password' },
    { value: 'ssh', label: 'SSH', description: 'SSH public key authentication' },
    { value: 'oauth2', label: 'OAuth2', description: 'OAuth 2.0 flow' },
    { value: 'hmac', label: 'HMAC', description: 'HMAC signature verification' },
    { value: 'mtls', label: 'mTLS', description: 'Mutual TLS certificates' },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <Settings className="w-4 h-4" /> },
    { id: 'auth', label: 'Authentication', icon: <Key className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
    { id: 'limits', label: 'Rate Limits', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create API Endpoint"
      description="Configure external API access with authentication"
      icon={<Globe className="w-5 h-5 text-primary-600" />}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !path}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Create Endpoint
          </button>
        </div>
      }
    >
      <Tabs tabs={tabs} defaultTab="basic" variant="underline">
        <TabPanel tabId="basic">
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Endpoint Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production API"
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Path *
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/api/v1/queues"
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional description..."
                className="w-full p-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm resize-none"
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel tabId="auth">
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Authentication Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {authMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setAuthMethod(method.value)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-colors',
                      authMethod === method.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    )}
                  >
                    <p className={cn(
                      'text-sm font-medium',
                      authMethod === method.value
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-neutral-700 dark:text-neutral-300'
                    )}>
                      {method.label}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials based on auth method */}
            {authMethod === 'bearer' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Bearer Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter or generate token"
                    className="flex-1 h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono"
                  />
                  <button
                    onClick={generateToken}
                    className="px-3 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {authMethod === 'api-key' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter or generate API key"
                    className="flex-1 h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono"
                  />
                  <button
                    onClick={generateApiKey}
                    className="px-3 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {authMethod === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>
            )}

            {authMethod === 'ssh' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  SSH Public Key
                </label>
                <textarea
                  value={sshPublicKey}
                  onChange={(e) => setSshPublicKey(e.target.value)}
                  rows={4}
                  placeholder="ssh-rsa AAAA..."
                  className="w-full p-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono resize-none"
                />
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel tabId="permissions">
          <div className="space-y-4 pt-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Select the operations this endpoint is allowed to perform
            </p>

            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              {availableOperations.map((op) => (
                <button
                  key={op}
                  onClick={() => toggleOperation(op)}
                  className={cn(
                    'px-2 py-1.5 text-xs font-medium rounded-lg transition-colors text-left',
                    selectedOperations.includes(op)
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {op}
                </button>
              ))}
            </div>

            <p className="text-xs text-neutral-500">
              {selectedOperations.length} operations selected
            </p>
          </div>
        </TabPanel>

        <TabPanel tabId="limits">
          <div className="space-y-4 pt-4">
            <label className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rateLimitEnabled}
                onChange={(e) => setRateLimitEnabled(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Enable Rate Limiting
                </p>
                <p className="text-xs text-neutral-500">
                  Limit the number of requests per time window
                </p>
              </div>
            </label>

            {rateLimitEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Requests
                  </label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Window (seconds)
                  </label>
                  <input
                    type="number"
                    value={rateLimitWindow}
                    onChange={(e) => setRateLimitWindow(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

// Endpoint Detail View
function EndpointDetailView({
  endpoint,
  onClose,
  onUpdate,
}: {
  endpoint: ApiEndpoint;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ApiEndpoint>) => void;
}) {
  const [showCredentials, setShowCredentials] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <SlideOver isOpen={true} onClose={onClose} position="right" size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-xl',
              endpoint.enabled
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-neutral-100 dark:bg-neutral-800'
            )}>
              <Globe className={cn(
                'w-6 h-6',
                endpoint.enabled ? 'text-green-600' : 'text-neutral-500'
              )} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {endpoint.name}
              </h2>
              <code className="text-sm text-neutral-500">{endpoint.path}</code>
            </div>
          </div>
          <button
            onClick={() => onUpdate(endpoint.id, { enabled: !endpoint.enabled })}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg',
              endpoint.enabled
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            )}
          >
            {endpoint.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Credentials */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                Credentials
              </h3>
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                {showCredentials ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showCredentials ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Auth Method</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                  {endpoint.authMethod.replace('-', ' ')}
                </span>
              </div>
              {endpoint.credentials.token && (
                <div>
                  <span className="text-sm text-neutral-500">Token</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded truncate">
                      {showCredentials ? endpoint.credentials.token : '••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(endpoint.credentials.token || '')}
                      className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {endpoint.credentials.apiKey && (
                <div>
                  <span className="text-sm text-neutral-500">API Key</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded truncate">
                      {showCredentials ? endpoint.credentials.apiKey : '••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(endpoint.credentials.apiKey || '')}
                      className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rate Limiting */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
              Rate Limiting
            </h3>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              {endpoint.rateLimit.enabled ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {endpoint.rateLimit.requests} requests / {endpoint.rateLimit.windowSeconds}s
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ) : (
                <span className="text-sm text-neutral-500">Disabled</span>
              )}
            </div>
          </div>

          {/* Operations */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
              Allowed Operations ({endpoint.allowedOperations.length})
            </h3>
            <div className="flex flex-wrap gap-1.5 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              {endpoint.allowedOperations.map((op) => (
                <span
                  key={op}
                  className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded"
                >
                  {op}
                </span>
              ))}
            </div>
          </div>

          {/* Usage Stats */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
              Usage
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatCompactNumber(endpoint.usageCount)}
                </p>
                <p className="text-xs text-neutral-500">Total Requests</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {endpoint.lastUsed
                    ? new Date(endpoint.lastUsed).toLocaleDateString()
                    : 'Never'}
                </p>
                <p className="text-xs text-neutral-500">Last Used</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideOver>
  );
}

export default ApiEndpointsDashboard;
