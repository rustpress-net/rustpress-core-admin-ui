/**
 * Visual Queue Manager - Main Store
 * Zustand store for complete queue management state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Queue,
  Exchange,
  Binding,
  Connection,
  Channel,
  Consumer,
  VirtualHost,
  User,
  Role,
  Policy,
  Alert,
  AlertRule,
  SystemEvent,
  Message,
  SystemMetrics,
  ClusterNode,
  DatabaseConnection,
  LoggingService,
  NotificationChannel,
  CloudBridge,
  AuthProvider,
  QueueTemplate,
  AutomationRule,
  ViewMode,
  TimeRange,
  FilterState,
  Permission,
} from '../types';
import type { ApiEndpoint } from '../types/api-endpoints';

// =============================================================================
// SAMPLE DATA GENERATORS
// =============================================================================

const generateSampleQueues = (): Queue[] => {
  const names = [
    'orders.processing',
    'orders.completed',
    'payments.pending',
    'payments.verified',
    'notifications.email',
    'notifications.push',
    'notifications.sms',
    'webhooks.outgoing',
    'webhooks.retry',
    'analytics.events',
    'analytics.metrics',
    'users.registration',
    'users.verification',
    'inventory.sync',
    'inventory.updates',
  ];

  return names.map((name, i) => ({
    id: `queue-${i + 1}`,
    name,
    vhost: '/',
    type: i % 3 === 0 ? 'quorum' : 'classic',
    state: i % 10 === 9 ? 'idle' : 'running',
    durable: true,
    autoDelete: false,
    exclusive: false,
    arguments: {},
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
};

const generateSampleExchanges = (): Exchange[] => {
  const exchanges = [
    { name: 'orders', type: 'topic' as const },
    { name: 'payments', type: 'direct' as const },
    { name: 'notifications', type: 'fanout' as const },
    { name: 'webhooks', type: 'direct' as const },
    { name: 'analytics', type: 'topic' as const },
    { name: 'users', type: 'direct' as const },
    { name: 'inventory', type: 'topic' as const },
    { name: 'dlx', type: 'fanout' as const },
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
};

const generateSampleBindings = (): Binding[] => {
  const bindings = [
    { source: 'orders', dest: 'orders.processing', key: 'order.created' },
    { source: 'orders', dest: 'orders.completed', key: 'order.completed' },
    { source: 'payments', dest: 'payments.pending', key: 'pending' },
    { source: 'payments', dest: 'payments.verified', key: 'verified' },
    { source: 'notifications', dest: 'notifications.email', key: '' },
    { source: 'notifications', dest: 'notifications.push', key: '' },
    { source: 'notifications', dest: 'notifications.sms', key: '' },
    { source: 'webhooks', dest: 'webhooks.outgoing', key: 'outgoing' },
    { source: 'webhooks', dest: 'webhooks.retry', key: 'retry' },
    { source: 'analytics', dest: 'analytics.events', key: 'event.#' },
    { source: 'analytics', dest: 'analytics.metrics', key: 'metric.#' },
    { source: 'dlx', dest: 'webhooks.retry', key: '' },
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
};

const generateSampleConnections = (): Connection[] => {
  const apps = ['order-service', 'payment-service', 'notification-service', 'webhook-service', 'analytics-service'];
  return apps.flatMap((app, i) =>
    Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
      id: `conn-${i}-${j}`,
      name: `${app}-${j + 1}`,
      vhost: '/',
      user: 'admin',
      state: 'running' as const,
      protocol: 'AMQP 0-9-1' as const,
      clientHost: `10.0.${i}.${j + 1}`,
      clientPort: 40000 + j,
      clientProperties: { product: app, version: '1.0.0' },
      serverHost: '0.0.0.0',
      serverPort: 5672,
      ssl: i % 2 === 0,
      channelCount: Math.floor(Math.random() * 5) + 1,
      sendRate: Math.random() * 1000,
      receiveRate: Math.random() * 800,
      sendPending: 0,
      connectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeout: 60,
    }))
  );
};

const generateSampleConsumers = (): Consumer[] => {
  const queues = ['orders.processing', 'payments.pending', 'notifications.email', 'webhooks.outgoing', 'analytics.events'];
  return queues.flatMap((queue, i) =>
    Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, j) => ({
      id: `consumer-${i}-${j}`,
      tag: `ctag-${queue}-${j}`,
      queueName: queue,
      channelId: `channel-${i}-${j}`,
      connectionId: `conn-${i}-0`,
      ackRequired: true,
      exclusive: false,
      prefetchCount: 10,
      priority: 0,
      messagesDelivered: Math.floor(Math.random() * 10000),
      messagesAcked: Math.floor(Math.random() * 9500),
      messagesNacked: Math.floor(Math.random() * 100),
      deliverRate: Math.random() * 100,
      ackRate: Math.random() * 95,
      avgProcessingTime: Math.random() * 500,
      isSlowConsumer: Math.random() > 0.9,
    }))
  );
};

const generateSampleAlerts = (): Alert[] => {
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
  ];
};

const generateSampleEvents = (): SystemEvent[] => {
  const events = [
    { type: 'queue', action: 'created', message: 'Queue orders.priority created' },
    { type: 'connection', action: 'started', message: 'Connection from order-service established' },
    { type: 'user', action: 'modified', message: 'User permissions updated for api-user' },
    { type: 'policy', action: 'created', message: 'Policy ha-all created' },
    { type: 'system', action: 'started', message: 'Node rabbit@node1 started' },
    { type: 'queue', action: 'deleted', message: 'Queue temp.queue deleted' },
    { type: 'exchange', action: 'created', message: 'Exchange events.dlx created' },
  ];

  return events.map((e, i) => ({
    id: `event-${i + 1}`,
    type: e.type as SystemEvent['type'],
    action: e.action as SystemEvent['action'],
    severity: e.action === 'error' ? 'error' : 'info',
    message: e.message,
    timestamp: new Date(Date.now() - i * 600000).toISOString(),
    user: 'admin',
  }));
};

const generateSystemMetrics = (): SystemMetrics => ({
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
});

// =============================================================================
// STORE INTERFACE
// =============================================================================

interface QueueManagerState {
  // Core entities
  queues: Queue[];
  exchanges: Exchange[];
  bindings: Binding[];
  connections: Connection[];
  channels: Channel[];
  consumers: Consumer[];
  virtualHosts: VirtualHost[];

  // Security
  users: User[];
  roles: Role[];
  policies: Policy[];

  // Monitoring
  alerts: Alert[];
  alertRules: AlertRule[];
  events: SystemEvent[];
  systemMetrics: SystemMetrics;
  clusterNodes: ClusterNode[];

  // Integrations
  databases: DatabaseConnection[];
  loggingServices: LoggingService[];
  notificationChannels: NotificationChannel[];
  cloudBridges: CloudBridge[];
  authProviders: AuthProvider[];

  // Templates & Automation
  queueTemplates: QueueTemplate[];
  automationRules: AutomationRule[];

  // API Endpoints
  apiEndpoints: ApiEndpoint[];

  // Permissions
  permissions: Permission[];

  // Messages
  messages: Message[];

  // Real-time
  liveMessages: Message[];
  isStreaming: boolean;

  // UI State
  selectedQueueId: string | null;
  selectedExchangeId: string | null;
  selectedConnectionId: string | null;
  viewMode: ViewMode;
  sidebarTab: 'queues' | 'exchanges' | 'connections' | 'monitoring' | 'integrations' | 'security';
  timeRange: TimeRange;
  filters: FilterState;
  isRefreshing: boolean;
  autoRefresh: boolean;
  autoRefreshInterval: number;
  refreshInterval: number;

  // Actions - Queues
  setQueues: (queues: Queue[]) => void;
  addQueue: (queue: Queue) => void;
  updateQueue: (id: string, updates: Partial<Queue>) => void;
  deleteQueue: (id: string) => void;
  purgeQueue: (id: string) => void;

  // Actions - Exchanges
  setExchanges: (exchanges: Exchange[]) => void;
  addExchange: (exchange: Exchange) => void;
  deleteExchange: (id: string) => void;

  // Actions - Bindings
  setBindings: (bindings: Binding[]) => void;
  addBinding: (binding: Binding) => void;
  deleteBinding: (id: string) => void;

  // Actions - Connections
  setConnections: (connections: Connection[]) => void;
  closeConnection: (id: string) => void;

  // Actions - Consumers
  setConsumers: (consumers: Consumer[]) => void;
  cancelConsumer: (id: string) => void;

  // Actions - Alerts
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string, user: string) => void;
  resolveAlert: (id: string) => void;

  // Actions - Events
  addEvent: (event: SystemEvent) => void;
  clearEvents: () => void;

  // Actions - Live Messages
  addLiveMessage: (message: Message) => void;
  clearLiveMessages: () => void;
  setIsStreaming: (streaming: boolean) => void;

  // Actions - UI State
  setSelectedQueueId: (id: string | null) => void;
  setSelectedExchangeId: (id: string | null) => void;
  setSelectedConnectionId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarTab: (tab: QueueManagerState['sidebarTab']) => void;
  setTimeRange: (range: TimeRange) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setAutoRefreshInterval: (ms: number) => void;

  // Actions - Integrations
  addDatabaseConnection: (db: DatabaseConnection) => void;
  updateDatabaseConnection: (id: string, updates: Partial<DatabaseConnection>) => void;
  deleteDatabaseConnection: (id: string) => void;
  addNotificationChannel: (channel: NotificationChannel) => void;
  deleteNotificationChannel: (id: string) => void;

  // Actions - API Endpoints
  addApiEndpoint: (endpoint: ApiEndpoint) => void;
  updateApiEndpoint: (id: string, updates: Partial<ApiEndpoint>) => void;
  deleteApiEndpoint: (id: string) => void;

  // Actions - Users
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Actions - Virtual Hosts
  addVirtualHost: (vhost: VirtualHost) => void;
  updateVirtualHost: (id: string, updates: Partial<VirtualHost>) => void;
  deleteVirtualHost: (id: string) => void;

  // Actions - Permissions
  addPermission: (permission: Permission) => void;
  updatePermission: (id: string, updates: Partial<Permission>) => void;
  deletePermission: (id: string) => void;

  // Actions - Policies
  addPolicy: (policy: Policy) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  deletePolicy: (id: string) => void;

  // Actions - Alert Rules
  addAlertRule: (rule: AlertRule) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  deleteAlertRule: (id: string) => void;
  dismissAlert: (id: string) => void;

  // Actions - Messages
  addMessage: (message: Message) => void;
  deleteMessage: (id: string) => void;

  // Actions - Refresh Settings
  setRefreshInterval: (ms: number) => void;

  // Actions - Initialization
  initializeSampleData: () => void;
  refreshData: () => void;
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useQueueManagerStore = create<QueueManagerState>()(
  persist(
    (set, get) => ({
      // Initial state
      queues: [],
      exchanges: [],
      bindings: [],
      connections: [],
      channels: [],
      consumers: [],
      virtualHosts: [{ id: 'vhost-1', name: '/', queueCount: 0, exchangeCount: 0, connectionCount: 0, tracingEnabled: false }],
      users: [{ id: 'user-1', username: 'admin', passwordHash: '', tags: ['administrator'], createdAt: new Date().toISOString() }],
      roles: [],
      policies: [],
      alerts: [],
      alertRules: [],
      events: [],
      systemMetrics: generateSystemMetrics(),
      clusterNodes: [{
        id: 'node-1',
        name: 'rabbit@localhost',
        type: 'disc',
        running: true,
        memoryUsed: 2147483648,
        diskFree: 107374182400,
        fdUsed: 150,
        uptime: 864000,
        version: '3.12.0',
      }],
      databases: [],
      loggingServices: [],
      notificationChannels: [],
      cloudBridges: [],
      authProviders: [],
      queueTemplates: [],
      automationRules: [],
      apiEndpoints: [],
      permissions: [],
      messages: [],
      liveMessages: [],
      isStreaming: false,
      refreshInterval: 5000,
      selectedQueueId: null,
      selectedExchangeId: null,
      selectedConnectionId: null,
      viewMode: 'list',
      sidebarTab: 'queues',
      timeRange: '1h',
      filters: { search: '', vhost: null, state: null, type: null },
      isRefreshing: false,
      autoRefresh: true,
      autoRefreshInterval: 5000,

      // Queue actions
      setQueues: (queues) => set({ queues }),
      addQueue: (queue) => set((state) => ({ queues: [...state.queues, queue] })),
      updateQueue: (id, updates) => set((state) => ({
        queues: state.queues.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      })),
      deleteQueue: (id) => set((state) => ({
        queues: state.queues.filter((q) => q.id !== id),
        bindings: state.bindings.filter((b) => b.destination !== state.queues.find((q) => q.id === id)?.name),
      })),
      purgeQueue: (id) => set((state) => ({
        queues: state.queues.map((q) =>
          q.id === id ? { ...q, messagesReady: 0, messagesUnacked: 0, messagesTotal: 0 } : q
        ),
      })),

      // Exchange actions
      setExchanges: (exchanges) => set({ exchanges }),
      addExchange: (exchange) => set((state) => ({ exchanges: [...state.exchanges, exchange] })),
      deleteExchange: (id) => set((state) => ({
        exchanges: state.exchanges.filter((e) => e.id !== id),
        bindings: state.bindings.filter((b) => b.source !== state.exchanges.find((e) => e.id === id)?.name),
      })),

      // Binding actions
      setBindings: (bindings) => set({ bindings }),
      addBinding: (binding) => set((state) => ({ bindings: [...state.bindings, binding] })),
      deleteBinding: (id) => set((state) => ({ bindings: state.bindings.filter((b) => b.id !== id) })),

      // Connection actions
      setConnections: (connections) => set({ connections }),
      closeConnection: (id) => set((state) => ({
        connections: state.connections.filter((c) => c.id !== id),
        consumers: state.consumers.filter((c) => c.connectionId !== id),
      })),

      // Consumer actions
      setConsumers: (consumers) => set({ consumers }),
      cancelConsumer: (id) => set((state) => ({
        consumers: state.consumers.filter((c) => c.id !== id),
      })),

      // Alert actions
      addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 100) })),
      acknowledgeAlert: (id, user) => set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === id ? { ...a, status: 'acknowledged', acknowledgedAt: new Date().toISOString(), acknowledgedBy: user } : a
        ),
      })),
      resolveAlert: (id) => set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a
        ),
      })),

      // Event actions
      addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 500) })),
      clearEvents: () => set({ events: [] }),

      // Live message actions
      addLiveMessage: (message) => set((state) => ({
        liveMessages: [message, ...state.liveMessages].slice(0, 100),
      })),
      clearLiveMessages: () => set({ liveMessages: [] }),
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),

      // UI state actions
      setSelectedQueueId: (id) => set({ selectedQueueId: id }),
      setSelectedExchangeId: (id) => set({ selectedExchangeId: id }),
      setSelectedConnectionId: (id) => set({ selectedConnectionId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setTimeRange: (range) => set({ timeRange: range }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      setAutoRefreshInterval: (ms) => set({ autoRefreshInterval: ms }),

      // Integration actions
      addDatabaseConnection: (db) => set((state) => ({ databases: [...state.databases, db] })),
      updateDatabaseConnection: (id, updates) => set((state) => ({
        databases: state.databases.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      })),
      deleteDatabaseConnection: (id) => set((state) => ({
        databases: state.databases.filter((d) => d.id !== id),
      })),
      addNotificationChannel: (channel) => set((state) => ({
        notificationChannels: [...state.notificationChannels, channel],
      })),
      deleteNotificationChannel: (id) => set((state) => ({
        notificationChannels: state.notificationChannels.filter((c) => c.id !== id),
      })),

      // API Endpoint actions
      addApiEndpoint: (endpoint) => set((state) => ({
        apiEndpoints: [...state.apiEndpoints, endpoint],
      })),
      updateApiEndpoint: (id, updates) => set((state) => ({
        apiEndpoints: state.apiEndpoints.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      })),
      deleteApiEndpoint: (id) => set((state) => ({
        apiEndpoints: state.apiEndpoints.filter((e) => e.id !== id),
      })),

      // User actions
      addUser: (user) => set((state) => ({
        users: [...state.users, user],
      })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      })),

      // Virtual Host actions
      addVirtualHost: (vhost) => set((state) => ({
        virtualHosts: [...state.virtualHosts, vhost],
      })),
      updateVirtualHost: (id, updates) => set((state) => ({
        virtualHosts: state.virtualHosts.map((v) => (v.id === id ? { ...v, ...updates } : v)),
      })),
      deleteVirtualHost: (id) => set((state) => ({
        virtualHosts: state.virtualHosts.filter((v) => v.id !== id),
      })),

      // Permission actions
      addPermission: (permission) => set((state) => ({
        permissions: [...state.permissions, permission],
      })),
      updatePermission: (id, updates) => set((state) => ({
        permissions: state.permissions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      deletePermission: (id) => set((state) => ({
        permissions: state.permissions.filter((p) => p.id !== id),
      })),

      // Policy actions
      addPolicy: (policy) => set((state) => ({
        policies: [...state.policies, policy],
      })),
      updatePolicy: (id, updates) => set((state) => ({
        policies: state.policies.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      deletePolicy: (id) => set((state) => ({
        policies: state.policies.filter((p) => p.id !== id),
      })),

      // Alert Rule actions
      addAlertRule: (rule) => set((state) => ({
        alertRules: [...state.alertRules, rule],
      })),
      updateAlertRule: (id, updates) => set((state) => ({
        alertRules: state.alertRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),
      deleteAlertRule: (id) => set((state) => ({
        alertRules: state.alertRules.filter((r) => r.id !== id),
      })),
      dismissAlert: (id) => set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
      })),

      // Message actions
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      deleteMessage: (id) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
      })),

      // Refresh settings
      setRefreshInterval: (ms) => set({ refreshInterval: ms }),

      // Initialization
      initializeSampleData: () => {
        const queues = generateSampleQueues();
        const exchanges = generateSampleExchanges();
        const bindings = generateSampleBindings();
        const connections = generateSampleConnections();
        const consumers = generateSampleConsumers();
        const alerts = generateSampleAlerts();
        const events = generateSampleEvents();
        const systemMetrics = generateSystemMetrics();

        set({
          queues,
          exchanges,
          bindings,
          connections,
          consumers,
          alerts,
          events,
          systemMetrics,
          virtualHosts: [{
            id: 'vhost-1',
            name: '/',
            queueCount: queues.length,
            exchangeCount: exchanges.length,
            connectionCount: connections.length,
            tracingEnabled: false,
          }],
        });
      },

      refreshData: () => {
        const state = get();
        // Simulate real-time updates
        set({
          queues: state.queues.map((q) => ({
            ...q,
            messagesReady: Math.max(0, q.messagesReady + Math.floor(Math.random() * 100) - 50),
            messagesUnacked: Math.max(0, q.messagesUnacked + Math.floor(Math.random() * 20) - 10),
            publishRate: Math.max(0, q.publishRate + (Math.random() - 0.5) * 100),
            deliverRate: Math.max(0, q.deliverRate + (Math.random() - 0.5) * 80),
            ackRate: Math.max(0, q.ackRate + (Math.random() - 0.5) * 75),
          })),
          systemMetrics: generateSystemMetrics(),
        });
      },
    }),
    {
      name: 'visual-queue-manager-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        timeRange: state.timeRange,
        autoRefresh: state.autoRefresh,
        autoRefreshInterval: state.autoRefreshInterval,
      }),
    }
  )
);
