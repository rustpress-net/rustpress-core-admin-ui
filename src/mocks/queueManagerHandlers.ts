/**
 * Queue Manager Mock Handlers
 * Mock Service Worker handlers for testing
 */

import { http, HttpResponse, delay } from 'msw';
import type {
  Queue,
  Exchange,
  Binding,
  Connection,
  Consumer,
  VirtualHost,
  User,
  Policy,
  Alert,
  AlertRule,
  Message,
  SystemMetrics,
  ClusterNode,
  Permission,
} from '../pages/plugins/visual-queue-manager/types';
import type { ApiEndpoint } from '../pages/plugins/visual-queue-manager/types/api-endpoints';

// =============================================================================
// MOCK DATA STORAGE
// =============================================================================

const mockData = {
  queues: generateMockQueues(),
  exchanges: generateMockExchanges(),
  bindings: generateMockBindings(),
  connections: generateMockConnections(),
  consumers: generateMockConsumers(),
  vhosts: generateMockVhosts(),
  users: generateMockUsers(),
  permissions: generateMockPermissions(),
  policies: generateMockPolicies(),
  alerts: generateMockAlerts(),
  alertRules: generateMockAlertRules(),
  messages: generateMockMessages(),
  apiEndpoints: generateMockApiEndpoints(),
  clusterNodes: generateMockClusterNodes(),
};

// =============================================================================
// DATA GENERATORS
// =============================================================================

function generateMockQueues(): Queue[] {
  const names = [
    'orders.processing', 'orders.completed', 'orders.failed', 'orders.retry',
    'payments.pending', 'payments.verified', 'payments.failed',
    'notifications.email', 'notifications.push', 'notifications.sms', 'notifications.webhook',
    'webhooks.outgoing', 'webhooks.retry', 'webhooks.dlq',
    'analytics.events', 'analytics.metrics', 'analytics.logs',
    'users.registration', 'users.verification', 'users.password-reset',
    'inventory.sync', 'inventory.updates', 'inventory.alerts',
    'reports.daily', 'reports.weekly', 'reports.monthly',
  ];

  return names.map((name, i) => ({
    id: `queue-${i + 1}`,
    name,
    vhost: '/',
    type: i % 4 === 0 ? 'quorum' : 'classic',
    state: i % 15 === 14 ? 'idle' : 'running',
    durable: true,
    autoDelete: false,
    exclusive: false,
    arguments: i % 5 === 0 ? { 'x-message-ttl': 86400000 } : {},
    messagesReady: Math.floor(Math.random() * 10000),
    messagesUnacked: Math.floor(Math.random() * 500),
    messagesTotal: Math.floor(Math.random() * 15000),
    consumers: Math.floor(Math.random() * 20) + 1,
    memory: Math.floor(Math.random() * 50000000),
    publishRate: Math.random() * 1000,
    deliverRate: Math.random() * 800,
    ackRate: Math.random() * 750,
    redeliverRate: Math.random() * 50,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    healthScore: Math.floor(Math.random() * 30) + 70,
  }));
}

function generateMockExchanges(): Exchange[] {
  const exchanges = [
    { name: 'orders', type: 'topic' as const },
    { name: 'payments', type: 'direct' as const },
    { name: 'notifications', type: 'fanout' as const },
    { name: 'webhooks', type: 'direct' as const },
    { name: 'analytics', type: 'topic' as const },
    { name: 'users', type: 'direct' as const },
    { name: 'inventory', type: 'topic' as const },
    { name: 'reports', type: 'headers' as const },
    { name: 'dlx', type: 'fanout' as const },
    { name: 'amq.direct', type: 'direct' as const },
    { name: 'amq.fanout', type: 'fanout' as const },
    { name: 'amq.topic', type: 'topic' as const },
    { name: 'amq.headers', type: 'headers' as const },
  ];

  return exchanges.map((ex, i) => ({
    id: `exchange-${i + 1}`,
    name: ex.name,
    vhost: '/',
    type: ex.type,
    durable: true,
    autoDelete: false,
    internal: ex.name === 'dlx',
    arguments: {},
    messagesIn: Math.floor(Math.random() * 100000),
    messagesOut: Math.floor(Math.random() * 100000),
    publishRate: Math.random() * 500,
  }));
}

function generateMockBindings(): Binding[] {
  const bindings = [
    { source: 'orders', dest: 'orders.processing', key: 'order.created' },
    { source: 'orders', dest: 'orders.completed', key: 'order.completed' },
    { source: 'orders', dest: 'orders.failed', key: 'order.failed' },
    { source: 'orders', dest: 'orders.retry', key: 'order.retry' },
    { source: 'payments', dest: 'payments.pending', key: 'pending' },
    { source: 'payments', dest: 'payments.verified', key: 'verified' },
    { source: 'payments', dest: 'payments.failed', key: 'failed' },
    { source: 'notifications', dest: 'notifications.email', key: '' },
    { source: 'notifications', dest: 'notifications.push', key: '' },
    { source: 'notifications', dest: 'notifications.sms', key: '' },
    { source: 'webhooks', dest: 'webhooks.outgoing', key: 'outgoing' },
    { source: 'webhooks', dest: 'webhooks.retry', key: 'retry' },
    { source: 'analytics', dest: 'analytics.events', key: 'event.#' },
    { source: 'analytics', dest: 'analytics.metrics', key: 'metric.#' },
    { source: 'dlx', dest: 'webhooks.retry', key: '' },
    { source: 'dlx', dest: 'orders.retry', key: '' },
  ];

  return bindings.map((b, i) => ({
    id: `binding-${i + 1}`,
    source: b.source,
    sourceType: 'exchange' as const,
    destination: b.dest,
    destinationType: 'queue' as const,
    routingKey: b.key,
    arguments: {},
    vhost: '/',
  }));
}

function generateMockConnections(): Connection[] {
  const apps = [
    'order-service', 'payment-service', 'notification-service',
    'webhook-service', 'analytics-service', 'user-service',
    'inventory-service', 'report-service', 'admin-dashboard'
  ];

  return apps.flatMap((app, i) =>
    Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
      id: `conn-${i}-${j}`,
      name: `${app}-${j + 1}`,
      vhost: '/',
      user: i < 3 ? 'admin' : 'api-user',
      state: Math.random() > 0.1 ? 'running' as const : 'blocked' as const,
      protocol: 'AMQP 0-9-1' as const,
      clientHost: `10.0.${i}.${j + 1}`,
      clientPort: 40000 + j,
      clientProperties: { product: app, version: '1.0.0', platform: 'Node.js' },
      serverHost: '0.0.0.0',
      serverPort: 5672,
      ssl: i % 2 === 0,
      channelCount: Math.floor(Math.random() * 8) + 1,
      sendRate: Math.random() * 1000,
      receiveRate: Math.random() * 800,
      sendPending: 0,
      connectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeout: 60,
    }))
  );
}

function generateMockConsumers(): Consumer[] {
  const queues = [
    'orders.processing', 'payments.pending', 'notifications.email',
    'webhooks.outgoing', 'analytics.events', 'users.registration'
  ];

  return queues.flatMap((queue, i) =>
    Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, j) => ({
      id: `consumer-${i}-${j}`,
      tag: `ctag-${queue.replace('.', '-')}-${j}`,
      queueName: queue,
      channelId: `channel-${i}-${j}`,
      connectionId: `conn-${i % 5}-0`,
      ackRequired: true,
      exclusive: false,
      prefetchCount: 10,
      priority: 0,
      messagesDelivered: Math.floor(Math.random() * 50000),
      messagesAcked: Math.floor(Math.random() * 49000),
      messagesNacked: Math.floor(Math.random() * 500),
      deliverRate: Math.random() * 200,
      ackRate: Math.random() * 190,
      avgProcessingTime: Math.random() * 500 + 10,
      isSlowConsumer: Math.random() > 0.9,
    }))
  );
}

function generateMockVhosts(): VirtualHost[] {
  return [
    { id: 'vhost-1', name: '/', queueCount: 26, exchangeCount: 13, connectionCount: 15, tracingEnabled: false },
    { id: 'vhost-2', name: '/production', queueCount: 12, exchangeCount: 8, connectionCount: 10, tracingEnabled: true },
    { id: 'vhost-3', name: '/staging', queueCount: 8, exchangeCount: 5, connectionCount: 3, tracingEnabled: true },
    { id: 'vhost-4', name: '/development', queueCount: 5, exchangeCount: 4, connectionCount: 2, tracingEnabled: false },
  ];
}

function generateMockUsers(): User[] {
  return [
    { id: 'user-1', username: 'admin', passwordHash: '', tags: ['administrator'], createdAt: new Date().toISOString() },
    { id: 'user-2', username: 'api-user', passwordHash: '', tags: ['management', 'monitoring'], createdAt: new Date().toISOString() },
    { id: 'user-3', username: 'publisher', passwordHash: '', tags: ['monitoring'], createdAt: new Date().toISOString() },
    { id: 'user-4', username: 'consumer', passwordHash: '', tags: ['monitoring'], createdAt: new Date().toISOString() },
    { id: 'user-5', username: 'readonly', passwordHash: '', tags: ['monitoring'], createdAt: new Date().toISOString() },
  ];
}

function generateMockPermissions(): Permission[] {
  return [
    { id: 'perm-1', userId: 'user-1', vhost: '/', configure: '.*', write: '.*', read: '.*' },
    { id: 'perm-2', userId: 'user-2', vhost: '/', configure: '', write: '.*', read: '.*' },
    { id: 'perm-3', userId: 'user-3', vhost: '/', configure: '', write: '.*', read: '' },
    { id: 'perm-4', userId: 'user-4', vhost: '/', configure: '', write: '', read: '.*' },
    { id: 'perm-5', userId: 'user-5', vhost: '/', configure: '', write: '', read: '.*' },
  ];
}

function generateMockPolicies(): Policy[] {
  return [
    {
      id: 'policy-1',
      name: 'ha-all',
      vhost: '/',
      pattern: '.*',
      applyTo: 'queues',
      priority: 0,
      definition: { 'ha-mode': 'all', 'ha-sync-mode': 'automatic' },
    },
    {
      id: 'policy-2',
      name: 'ttl-24h',
      vhost: '/',
      pattern: '^temp\\..*',
      applyTo: 'queues',
      priority: 1,
      definition: { 'message-ttl': 86400000 },
    },
    {
      id: 'policy-3',
      name: 'max-length-10k',
      vhost: '/',
      pattern: '^analytics\\..*',
      applyTo: 'queues',
      priority: 1,
      definition: { 'max-length': 10000 },
    },
  ];
}

function generateMockAlerts(): Alert[] {
  return [
    {
      id: 'alert-1',
      ruleId: 'rule-1',
      ruleName: 'High Queue Depth',
      severity: 'warning',
      status: 'active',
      message: 'Queue orders.processing has exceeded 5000 messages',
      targetType: 'queue',
      targetName: 'orders.processing',
      currentValue: 7532,
      threshold: 5000,
      triggeredAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'alert-2',
      ruleId: 'rule-2',
      ruleName: 'Slow Consumer',
      severity: 'error',
      status: 'acknowledged',
      message: 'Consumer on webhooks.outgoing is processing slowly',
      targetType: 'consumer',
      targetName: 'ctag-webhooks-0',
      currentValue: 2500,
      threshold: 1000,
      triggeredAt: new Date(Date.now() - 7200000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledgedBy: 'admin',
    },
    {
      id: 'alert-3',
      ruleId: 'rule-3',
      ruleName: 'High Memory Usage',
      severity: 'critical',
      status: 'active',
      message: 'Memory usage has exceeded 85%',
      targetType: 'system',
      targetName: 'rabbit@localhost',
      currentValue: 87,
      threshold: 85,
      triggeredAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ];
}

function generateMockAlertRules(): AlertRule[] {
  return [
    {
      id: 'rule-1',
      name: 'High Queue Depth',
      description: 'Alert when queue message count exceeds threshold',
      enabled: true,
      metric: 'queue_messages',
      operator: '>',
      threshold: 5000,
      duration: 300,
      severity: 'warning',
      notificationChannels: ['email', 'slack'],
      target: { type: 'queue', pattern: '.*' },
    },
    {
      id: 'rule-2',
      name: 'Slow Consumer',
      description: 'Alert when consumer processing time is too high',
      enabled: true,
      metric: 'consumer_processing_time',
      operator: '>',
      threshold: 1000,
      duration: 600,
      severity: 'error',
      notificationChannels: ['email'],
      target: { type: 'consumer', pattern: '.*' },
    },
    {
      id: 'rule-3',
      name: 'High Memory Usage',
      description: 'Alert when memory usage exceeds threshold',
      enabled: true,
      metric: 'memory_percent',
      operator: '>',
      threshold: 85,
      duration: 60,
      severity: 'critical',
      notificationChannels: ['email', 'slack', 'pagerduty'],
      target: { type: 'system', pattern: '.*' },
    },
  ];
}

function generateMockMessages(): Message[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `msg-${i + 1}`,
    exchangeName: i % 3 === 0 ? 'orders' : i % 3 === 1 ? 'notifications' : 'analytics',
    routingKey: `key.${i}`,
    queueName: i % 3 === 0 ? 'orders.processing' : i % 3 === 1 ? 'notifications.email' : 'analytics.events',
    payload: JSON.stringify({ data: `Message payload ${i + 1}`, timestamp: Date.now() }),
    payloadEncoding: 'string' as const,
    contentType: 'application/json',
    headers: { 'x-trace-id': `trace-${i}` },
    properties: {
      deliveryMode: 2 as const,
      priority: Math.floor(Math.random() * 10),
      timestamp: Date.now() - i * 60000,
    },
    redelivered: i % 5 === 0,
    deliveryTag: i + 1,
    publishedAt: new Date(Date.now() - i * 60000).toISOString(),
    size: Math.floor(Math.random() * 10000) + 100,
  }));
}

function generateMockApiEndpoints(): ApiEndpoint[] {
  return [
    {
      id: 'endpoint-1',
      name: 'Order Events API',
      path: '/api/v1/orders',
      method: 'POST',
      description: 'Endpoint for order events',
      authMethod: 'bearer',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      status: 'active',
      rateLimit: { requestsPerMinute: 1000, burstSize: 100 },
      permissions: ['queue:write', 'exchange:read'],
      allowedIps: [],
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      requestCount: 15234,
    },
    {
      id: 'endpoint-2',
      name: 'Analytics Ingestion',
      path: '/api/v1/analytics',
      method: 'POST',
      description: 'Endpoint for analytics data ingestion',
      authMethod: 'api-key',
      apiKey: 'ak_live_xxxxxxxxxxx',
      status: 'active',
      rateLimit: { requestsPerMinute: 5000, burstSize: 500 },
      permissions: ['queue:write'],
      allowedIps: ['10.0.0.0/8'],
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      requestCount: 892345,
    },
    {
      id: 'endpoint-3',
      name: 'Queue Monitor',
      path: '/api/v1/queues',
      method: 'GET',
      description: 'Read-only endpoint for queue monitoring',
      authMethod: 'basic',
      status: 'active',
      rateLimit: { requestsPerMinute: 100, burstSize: 10 },
      permissions: ['queue:read', 'metrics:read'],
      allowedIps: [],
      createdAt: new Date().toISOString(),
      requestCount: 5678,
    },
  ];
}

function generateMockClusterNodes(): ClusterNode[] {
  return [
    {
      id: 'node-1',
      name: 'rabbit@node1',
      type: 'disc',
      running: true,
      memoryUsed: 2147483648,
      diskFree: 107374182400,
      fdUsed: 150,
      uptime: 864000,
      version: '3.12.0',
    },
    {
      id: 'node-2',
      name: 'rabbit@node2',
      type: 'disc',
      running: true,
      memoryUsed: 1900000000,
      diskFree: 120000000000,
      fdUsed: 120,
      uptime: 850000,
      version: '3.12.0',
    },
    {
      id: 'node-3',
      name: 'rabbit@node3',
      type: 'ram',
      running: true,
      memoryUsed: 1200000000,
      diskFree: 100000000000,
      fdUsed: 80,
      uptime: 800000,
      version: '3.12.0',
    },
  ];
}

function generateSystemMetrics(): SystemMetrics {
  return {
    memoryUsed: 2147483648 + Math.random() * 1073741824,
    memoryLimit: 4294967296,
    memoryAlarm: false,
    diskFree: 107374182400 + Math.random() * 53687091200,
    diskLimit: 5368709120,
    diskAlarm: false,
    fdUsed: 150 + Math.floor(Math.random() * 100),
    fdLimit: 1048576,
    socketsUsed: 50 + Math.floor(Math.random() * 50),
    socketsLimit: 943626,
    processesUsed: 500 + Math.floor(Math.random() * 200),
    processesLimit: 1048576,
    runQueue: Math.floor(Math.random() * 5),
    uptime: 864000 + Math.floor(Math.random() * 604800),
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: items.slice(start, end),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

// =============================================================================
// HANDLERS
// =============================================================================

export const queueManagerHandlers = [
  // =========================================================================
  // QUEUES
  // =========================================================================
  http.get('/api/queue-manager/queues', async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    const vhost = url.searchParams.get('vhost');

    let filtered = mockData.queues;
    if (vhost) {
      filtered = filtered.filter((q) => q.vhost === vhost);
    }

    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  http.get('/api/queue-manager/queues/:id', async ({ params }) => {
    await delay(50);
    const queue = mockData.queues.find((q) => q.id === params.id);
    if (!queue) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(queue);
  }),

  http.post('/api/queue-manager/queues', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<Queue>;
    const newQueue: Queue = {
      id: generateId(),
      name: data.name || 'new-queue',
      vhost: data.vhost || '/',
      type: data.type || 'classic',
      state: 'running',
      durable: data.durable ?? true,
      autoDelete: data.autoDelete ?? false,
      exclusive: data.exclusive ?? false,
      arguments: data.arguments || {},
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
    mockData.queues.push(newQueue);
    return HttpResponse.json(newQueue, { status: 201 });
  }),

  http.put('/api/queue-manager/queues/:id', async ({ params, request }) => {
    await delay(100);
    const idx = mockData.queues.findIndex((q) => q.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const updates = await request.json() as Partial<Queue>;
    mockData.queues[idx] = { ...mockData.queues[idx], ...updates };
    return HttpResponse.json(mockData.queues[idx]);
  }),

  http.delete('/api/queue-manager/queues/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.queues.findIndex((q) => q.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.queues.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/queue-manager/queues/:id/purge', async ({ params }) => {
    await delay(100);
    const idx = mockData.queues.findIndex((q) => q.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const deleted = mockData.queues[idx].messagesReady;
    mockData.queues[idx].messagesReady = 0;
    mockData.queues[idx].messagesTotal = mockData.queues[idx].messagesUnacked;
    return HttpResponse.json({ messagesDeleted: deleted });
  }),

  http.get('/api/queue-manager/queues/:id/messages', async ({ params, request }) => {
    await delay(100);
    const queue = mockData.queues.find((q) => q.id === params.id);
    if (!queue) {
      return new HttpResponse(null, { status: 404 });
    }
    const url = new URL(request.url);
    const count = parseInt(url.searchParams.get('count') || '10');
    const messages = mockData.messages.filter((m) => m.queueName === queue.name).slice(0, count);
    return HttpResponse.json(messages);
  }),

  http.get('/api/queue-manager/queues/:id/consumers', async ({ params }) => {
    await delay(50);
    const queue = mockData.queues.find((q) => q.id === params.id);
    if (!queue) {
      return new HttpResponse(null, { status: 404 });
    }
    const consumers = mockData.consumers.filter((c) => c.queueName === queue.name);
    return HttpResponse.json(consumers);
  }),

  // =========================================================================
  // EXCHANGES
  // =========================================================================
  http.get('/api/queue-manager/exchanges', async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const vhost = url.searchParams.get('vhost');
    const type = url.searchParams.get('type');

    let filtered = mockData.exchanges;
    if (vhost) {
      filtered = filtered.filter((e) => e.vhost === vhost);
    }
    if (type) {
      filtered = filtered.filter((e) => e.type === type);
    }

    return HttpResponse.json(filtered);
  }),

  http.get('/api/queue-manager/exchanges/:id', async ({ params }) => {
    await delay(50);
    const exchange = mockData.exchanges.find((e) => e.id === params.id);
    if (!exchange) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(exchange);
  }),

  http.post('/api/queue-manager/exchanges', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<Exchange>;
    const newExchange: Exchange = {
      id: generateId(),
      name: data.name || 'new-exchange',
      vhost: data.vhost || '/',
      type: data.type || 'direct',
      durable: data.durable ?? true,
      autoDelete: data.autoDelete ?? false,
      internal: data.internal ?? false,
      arguments: data.arguments || {},
      messagesIn: 0,
      messagesOut: 0,
      publishRate: 0,
    };
    mockData.exchanges.push(newExchange);
    return HttpResponse.json(newExchange, { status: 201 });
  }),

  http.delete('/api/queue-manager/exchanges/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.exchanges.findIndex((e) => e.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.exchanges.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/queue-manager/exchanges/:id/publish', async ({ params, request }) => {
    await delay(100);
    const exchange = mockData.exchanges.find((e) => e.id === params.id);
    if (!exchange) {
      return new HttpResponse(null, { status: 404 });
    }
    const data = await request.json() as { routingKey: string; payload: string };
    const newMessage: Message = {
      id: generateId(),
      exchangeName: exchange.name,
      routingKey: data.routingKey,
      queueName: '',
      payload: data.payload,
      payloadEncoding: 'string',
      contentType: 'application/json',
      headers: {},
      properties: { deliveryMode: 2, timestamp: Date.now() },
      redelivered: false,
      deliveryTag: mockData.messages.length + 1,
      publishedAt: new Date().toISOString(),
      size: data.payload.length,
    };
    mockData.messages.unshift(newMessage);
    return HttpResponse.json({ routed: true });
  }),

  // =========================================================================
  // BINDINGS
  // =========================================================================
  http.get('/api/queue-manager/bindings', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const vhost = url.searchParams.get('vhost');

    let filtered = mockData.bindings;
    if (vhost) {
      filtered = filtered.filter((b) => b.vhost === vhost);
    }

    return HttpResponse.json(filtered);
  }),

  http.post('/api/queue-manager/bindings', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<Binding>;
    const newBinding: Binding = {
      id: generateId(),
      source: data.source || '',
      sourceType: data.sourceType || 'exchange',
      destination: data.destination || '',
      destinationType: data.destinationType || 'queue',
      routingKey: data.routingKey || '',
      arguments: data.arguments || {},
      vhost: data.vhost || '/',
    };
    mockData.bindings.push(newBinding);
    return HttpResponse.json(newBinding, { status: 201 });
  }),

  http.delete('/api/queue-manager/bindings/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.bindings.findIndex((b) => b.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.bindings.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // CONNECTIONS
  // =========================================================================
  http.get('/api/queue-manager/connections', async () => {
    await delay(50);
    return HttpResponse.json(mockData.connections);
  }),

  http.get('/api/queue-manager/connections/:id', async ({ params }) => {
    await delay(50);
    const connection = mockData.connections.find((c) => c.id === params.id);
    if (!connection) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(connection);
  }),

  http.delete('/api/queue-manager/connections/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.connections.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.connections.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // CONSUMERS
  // =========================================================================
  http.get('/api/queue-manager/consumers', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const queueName = url.searchParams.get('queueName');

    let filtered = mockData.consumers;
    if (queueName) {
      filtered = filtered.filter((c) => c.queueName === queueName);
    }

    return HttpResponse.json(filtered);
  }),

  http.delete('/api/queue-manager/consumers/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.consumers.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.consumers.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // MESSAGES
  // =========================================================================
  http.get('/api/queue-manager/messages/browse/:queueId', async ({ params, request }) => {
    await delay(100);
    const queue = mockData.queues.find((q) => q.id === params.queueId);
    if (!queue) {
      return new HttpResponse(null, { status: 404 });
    }
    const url = new URL(request.url);
    const count = parseInt(url.searchParams.get('count') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const messages = mockData.messages
      .filter((m) => m.queueName === queue.name)
      .slice(offset, offset + count);

    return HttpResponse.json(messages);
  }),

  http.post('/api/queue-manager/messages/publish', async ({ request }) => {
    await delay(100);
    const data = await request.json() as { exchangeName: string; routingKey: string; payload: string; contentType?: string };
    const newMessage: Message = {
      id: generateId(),
      exchangeName: data.exchangeName,
      routingKey: data.routingKey,
      queueName: '',
      payload: data.payload,
      payloadEncoding: 'string',
      contentType: data.contentType || 'application/json',
      headers: {},
      properties: { deliveryMode: 2, timestamp: Date.now() },
      redelivered: false,
      deliveryTag: mockData.messages.length + 1,
      publishedAt: new Date().toISOString(),
      size: data.payload.length,
    };
    mockData.messages.unshift(newMessage);
    return HttpResponse.json({ messageId: newMessage.id, routed: true });
  }),

  // =========================================================================
  // VIRTUAL HOSTS
  // =========================================================================
  http.get('/api/queue-manager/vhosts', async () => {
    await delay(50);
    return HttpResponse.json(mockData.vhosts);
  }),

  http.post('/api/queue-manager/vhosts', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<VirtualHost>;
    const newVhost: VirtualHost = {
      id: generateId(),
      name: data.name || '/new-vhost',
      queueCount: 0,
      exchangeCount: 0,
      connectionCount: 0,
      tracingEnabled: data.tracingEnabled ?? false,
    };
    mockData.vhosts.push(newVhost);
    return HttpResponse.json(newVhost, { status: 201 });
  }),

  http.delete('/api/queue-manager/vhosts/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.vhosts.findIndex((v) => v.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.vhosts.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // USERS
  // =========================================================================
  http.get('/api/queue-manager/users', async () => {
    await delay(50);
    return HttpResponse.json(mockData.users);
  }),

  http.post('/api/queue-manager/users', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<User> & { password?: string };
    const newUser: User = {
      id: generateId(),
      username: data.username || 'new-user',
      passwordHash: '',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
    };
    mockData.users.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.delete('/api/queue-manager/users/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.users.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.users.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // PERMISSIONS
  // =========================================================================
  http.get('/api/queue-manager/permissions', async () => {
    await delay(50);
    return HttpResponse.json(mockData.permissions);
  }),

  http.post('/api/queue-manager/permissions', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<Permission>;
    const newPermission: Permission = {
      id: generateId(),
      userId: data.userId || '',
      vhost: data.vhost || '/',
      configure: data.configure || '',
      write: data.write || '',
      read: data.read || '',
    };
    mockData.permissions.push(newPermission);
    return HttpResponse.json(newPermission, { status: 201 });
  }),

  http.delete('/api/queue-manager/permissions/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.permissions.findIndex((p) => p.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.permissions.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // POLICIES
  // =========================================================================
  http.get('/api/queue-manager/policies', async () => {
    await delay(50);
    return HttpResponse.json(mockData.policies);
  }),

  http.post('/api/queue-manager/policies', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<Policy>;
    const newPolicy: Policy = {
      id: generateId(),
      name: data.name || 'new-policy',
      vhost: data.vhost || '/',
      pattern: data.pattern || '.*',
      applyTo: data.applyTo || 'queues',
      priority: data.priority ?? 0,
      definition: data.definition || {},
    };
    mockData.policies.push(newPolicy);
    return HttpResponse.json(newPolicy, { status: 201 });
  }),

  http.delete('/api/queue-manager/policies/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.policies.findIndex((p) => p.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.policies.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // ALERTS
  // =========================================================================
  http.get('/api/queue-manager/alerts', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');

    let filtered = mockData.alerts;
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (severity) {
      filtered = filtered.filter((a) => a.severity === severity);
    }

    return HttpResponse.json(filtered);
  }),

  http.post('/api/queue-manager/alerts/:id/acknowledge', async ({ params, request }) => {
    await delay(100);
    const idx = mockData.alerts.findIndex((a) => a.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const data = await request.json() as { user: string };
    mockData.alerts[idx] = {
      ...mockData.alerts[idx],
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: data.user,
    };
    return HttpResponse.json(mockData.alerts[idx]);
  }),

  http.post('/api/queue-manager/alerts/:id/resolve', async ({ params }) => {
    await delay(100);
    const idx = mockData.alerts.findIndex((a) => a.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.alerts[idx] = {
      ...mockData.alerts[idx],
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    };
    return HttpResponse.json(mockData.alerts[idx]);
  }),

  http.delete('/api/queue-manager/alerts/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.alerts.findIndex((a) => a.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.alerts.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // ALERT RULES
  // =========================================================================
  http.get('/api/queue-manager/alert-rules', async () => {
    await delay(50);
    return HttpResponse.json(mockData.alertRules);
  }),

  http.post('/api/queue-manager/alert-rules', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<AlertRule>;
    const newRule: AlertRule = {
      id: generateId(),
      name: data.name || 'New Rule',
      description: data.description || '',
      enabled: data.enabled ?? true,
      metric: data.metric || 'queue_messages',
      operator: data.operator || '>',
      threshold: data.threshold || 1000,
      duration: data.duration || 300,
      severity: data.severity || 'warning',
      notificationChannels: data.notificationChannels || [],
      target: data.target || { type: 'queue', pattern: '.*' },
    };
    mockData.alertRules.push(newRule);
    return HttpResponse.json(newRule, { status: 201 });
  }),

  http.delete('/api/queue-manager/alert-rules/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.alertRules.findIndex((r) => r.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.alertRules.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // METRICS
  // =========================================================================
  http.get('/api/queue-manager/metrics', async () => {
    await delay(50);
    return HttpResponse.json(generateSystemMetrics());
  }),

  http.get('/api/queue-manager/metrics/nodes', async () => {
    await delay(50);
    return HttpResponse.json(mockData.clusterNodes);
  }),

  http.get('/api/queue-manager/metrics/overview', async () => {
    await delay(50);
    const queues = mockData.queues;
    const exchanges = mockData.exchanges;
    const connections = mockData.connections;
    const consumers = mockData.consumers;

    return HttpResponse.json({
      queues: {
        total: queues.length,
        running: queues.filter((q) => q.state === 'running').length,
        idle: queues.filter((q) => q.state === 'idle').length,
      },
      exchanges: {
        total: exchanges.length,
        byType: {
          direct: exchanges.filter((e) => e.type === 'direct').length,
          fanout: exchanges.filter((e) => e.type === 'fanout').length,
          topic: exchanges.filter((e) => e.type === 'topic').length,
          headers: exchanges.filter((e) => e.type === 'headers').length,
        },
      },
      connections: {
        total: connections.length,
        active: connections.filter((c) => c.state === 'running').length,
        blocked: connections.filter((c) => c.state === 'blocked').length,
      },
      consumers: {
        total: consumers.length,
      },
      messages: {
        ready: queues.reduce((sum, q) => sum + q.messagesReady, 0),
        unacked: queues.reduce((sum, q) => sum + q.messagesUnacked, 0),
        total: queues.reduce((sum, q) => sum + q.messagesTotal, 0),
      },
      rates: {
        publish: queues.reduce((sum, q) => sum + q.publishRate, 0),
        deliver: queues.reduce((sum, q) => sum + q.deliverRate, 0),
        ack: queues.reduce((sum, q) => sum + q.ackRate, 0),
      },
    });
  }),

  // =========================================================================
  // API ENDPOINTS
  // =========================================================================
  http.get('/api/queue-manager/api-endpoints', async () => {
    await delay(50);
    return HttpResponse.json(mockData.apiEndpoints);
  }),

  http.get('/api/queue-manager/api-endpoints/:id', async ({ params }) => {
    await delay(50);
    const endpoint = mockData.apiEndpoints.find((e) => e.id === params.id);
    if (!endpoint) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(endpoint);
  }),

  http.post('/api/queue-manager/api-endpoints', async ({ request }) => {
    await delay(100);
    const data = await request.json() as Partial<ApiEndpoint>;
    const newEndpoint: ApiEndpoint = {
      id: generateId(),
      name: data.name || 'New Endpoint',
      path: data.path || '/api/v1/new',
      method: data.method || 'POST',
      description: data.description || '',
      authMethod: data.authMethod || 'bearer',
      token: data.authMethod === 'bearer' ? `tok_${generateId()}` : undefined,
      apiKey: data.authMethod === 'api-key' ? `ak_${generateId()}` : undefined,
      status: 'active',
      rateLimit: data.rateLimit || { requestsPerMinute: 100, burstSize: 10 },
      permissions: data.permissions || [],
      allowedIps: data.allowedIps || [],
      createdAt: new Date().toISOString(),
      requestCount: 0,
    };
    mockData.apiEndpoints.push(newEndpoint);
    return HttpResponse.json(newEndpoint, { status: 201 });
  }),

  http.put('/api/queue-manager/api-endpoints/:id', async ({ params, request }) => {
    await delay(100);
    const idx = mockData.apiEndpoints.findIndex((e) => e.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const updates = await request.json() as Partial<ApiEndpoint>;
    mockData.apiEndpoints[idx] = { ...mockData.apiEndpoints[idx], ...updates };
    return HttpResponse.json(mockData.apiEndpoints[idx]);
  }),

  http.delete('/api/queue-manager/api-endpoints/:id', async ({ params }) => {
    await delay(100);
    const idx = mockData.apiEndpoints.findIndex((e) => e.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockData.apiEndpoints.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/queue-manager/api-endpoints/:id/regenerate', async ({ params }) => {
    await delay(100);
    const idx = mockData.apiEndpoints.findIndex((e) => e.id === params.id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const endpoint = mockData.apiEndpoints[idx];
    if (endpoint.authMethod === 'bearer') {
      endpoint.token = `tok_${generateId()}`;
      return HttpResponse.json({ token: endpoint.token });
    } else if (endpoint.authMethod === 'api-key') {
      endpoint.apiKey = `ak_${generateId()}`;
      return HttpResponse.json({ apiKey: endpoint.apiKey });
    }
    return HttpResponse.json({});
  }),

  http.post('/api/queue-manager/api-endpoints/:id/test', async ({ params }) => {
    await delay(200);
    const endpoint = mockData.apiEndpoints.find((e) => e.id === params.id);
    if (!endpoint) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      success: true,
      latency: Math.floor(Math.random() * 100) + 10,
      response: { status: 'ok', endpoint: endpoint.path },
    });
  }),

  // =========================================================================
  // TOPOLOGY
  // =========================================================================
  http.get('/api/queue-manager/topology', async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const vhost = url.searchParams.get('vhost') || '/';

    return HttpResponse.json({
      exchanges: mockData.exchanges.filter((e) => e.vhost === vhost),
      queues: mockData.queues.filter((q) => q.vhost === vhost),
      bindings: mockData.bindings.filter((b) => b.vhost === vhost),
    });
  }),

  http.get('/api/queue-manager/topology/export', async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const vhost = url.searchParams.get('vhost') || '/';

    return HttpResponse.json({
      rabbit_version: '3.12.0',
      vhosts: mockData.vhosts.filter((v) => v.name === vhost || vhost === '/'),
      queues: mockData.queues.filter((q) => q.vhost === vhost),
      exchanges: mockData.exchanges.filter((e) => e.vhost === vhost),
      bindings: mockData.bindings.filter((b) => b.vhost === vhost),
    });
  }),
];

export default queueManagerHandlers;
