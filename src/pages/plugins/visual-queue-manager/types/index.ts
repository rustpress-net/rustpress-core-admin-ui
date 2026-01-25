/**
 * Visual Queue Manager - Type Definitions
 * Complete type system for RabbitMQ-style queue management
 */

// =============================================================================
// QUEUE TYPES
// =============================================================================

export type QueueType = 'classic' | 'quorum' | 'stream';
export type QueueState = 'running' | 'idle' | 'down' | 'starting' | 'stopping';
export type Durability = 'durable' | 'transient';

export interface QueueArguments {
  'x-message-ttl'?: number;
  'x-max-length'?: number;
  'x-max-length-bytes'?: number;
  'x-overflow'?: 'drop-head' | 'reject-publish' | 'reject-publish-dlx';
  'x-dead-letter-exchange'?: string;
  'x-dead-letter-routing-key'?: string;
  'x-max-priority'?: number;
  'x-queue-master-locator'?: 'min-masters' | 'client-local' | 'random';
  'x-queue-type'?: QueueType;
}

export interface Queue {
  id: string;
  name: string;
  vhost: string;
  type: QueueType;
  state: QueueState;
  durable: boolean;
  autoDelete: boolean;
  exclusive: boolean;
  arguments: QueueArguments;

  // Stats
  messagesReady: number;
  messagesUnacked: number;
  messagesTotal: number;
  consumers: number;
  memory: number;

  // Rates
  publishRate: number;
  deliverRate: number;
  ackRate: number;
  redeliverRate: number;

  // Timestamps
  createdAt: string;
  idleSince?: string;

  // Health
  healthScore: number;
}

// =============================================================================
// EXCHANGE TYPES
// =============================================================================

export type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers' | 'x-delayed-message';

export interface Exchange {
  id: string;
  name: string;
  vhost: string;
  type: ExchangeType;
  durable: boolean;
  autoDelete: boolean;
  internal: boolean;
  arguments: Record<string, unknown>;

  // Stats
  messagesIn: number;
  messagesOut: number;
  publishRate: number;

  // Alternate exchange
  alternateExchange?: string;
}

// =============================================================================
// BINDING TYPES
// =============================================================================

export interface Binding {
  id: string;
  source: string;
  sourceType: 'exchange';
  destination: string;
  destinationType: 'queue' | 'exchange';
  routingKey: string;
  arguments: Record<string, unknown>;
  vhost: string;
}

// =============================================================================
// MESSAGE TYPES
// =============================================================================

export type DeliveryMode = 1 | 2; // 1 = non-persistent, 2 = persistent

export interface MessageProperties {
  contentType?: string;
  contentEncoding?: string;
  headers?: Record<string, unknown>;
  deliveryMode?: DeliveryMode;
  priority?: number;
  correlationId?: string;
  replyTo?: string;
  expiration?: string;
  messageId?: string;
  timestamp?: number;
  type?: string;
  userId?: string;
  appId?: string;
}

export interface Message {
  id: string;
  queueName: string;
  exchangeName: string;
  routingKey: string;
  payload: string;
  payloadBytes: number;
  payloadEncoding: 'string' | 'base64';
  properties: MessageProperties;
  redelivered: boolean;
  deliveryTag: number;
  receivedAt: string;
}

// =============================================================================
// CONNECTION TYPES
// =============================================================================

export type ConnectionState = 'running' | 'blocked' | 'blocking' | 'closing' | 'closed';
export type ConnectionProtocol = 'AMQP 0-9-1' | 'AMQP 1.0' | 'MQTT' | 'STOMP';

export interface Connection {
  id: string;
  name: string;
  vhost: string;
  user: string;
  state: ConnectionState;
  protocol: ConnectionProtocol;

  // Client info
  clientHost: string;
  clientPort: number;
  clientProperties: Record<string, unknown>;

  // Server info
  serverHost: string;
  serverPort: number;

  // SSL
  ssl: boolean;
  sslProtocol?: string;
  sslCipher?: string;

  // Stats
  channelCount: number;
  sendRate: number;
  receiveRate: number;
  sendPending: number;

  // Timestamps
  connectedAt: string;
  timeout: number;
}

// =============================================================================
// CHANNEL TYPES
// =============================================================================

export type ChannelState = 'running' | 'idle' | 'flow';

export interface Channel {
  id: string;
  connectionId: string;
  number: number;
  vhost: string;
  user: string;
  state: ChannelState;

  // Stats
  consumerCount: number;
  messagesUnacked: number;
  messagesUnconfirmed: number;
  prefetchCount: number;
  globalPrefetchCount: number;

  // Rates
  publishRate: number;
  confirmRate: number;
  deliverRate: number;
  ackRate: number;

  // Transactional
  transactional: boolean;
  confirm: boolean;
}

// =============================================================================
// CONSUMER TYPES
// =============================================================================

export interface Consumer {
  id: string;
  tag: string;
  queueName: string;
  channelId: string;
  connectionId: string;

  // Settings
  ackRequired: boolean;
  exclusive: boolean;
  prefetchCount: number;
  priority: number;

  // Stats
  messagesDelivered: number;
  messagesAcked: number;
  messagesNacked: number;
  deliverRate: number;
  ackRate: number;

  // Performance
  avgProcessingTime: number;
  isSlowConsumer: boolean;
}

// =============================================================================
// VIRTUAL HOST TYPES
// =============================================================================

export interface VirtualHost {
  id: string;
  name: string;
  description?: string;

  // Limits
  maxConnections?: number;
  maxQueues?: number;

  // Stats
  queueCount: number;
  exchangeCount: number;
  connectionCount: number;

  // Tracing
  tracingEnabled: boolean;
}

// =============================================================================
// USER & PERMISSION TYPES
// =============================================================================

export type UserTag = 'administrator' | 'monitoring' | 'policymaker' | 'management' | 'impersonator';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  tags: UserTag[];
  createdAt: string;
  lastLogin?: string;
}

export interface Permission {
  id: string;
  user: string;
  vhost: string;
  configure: string; // Regex pattern
  write: string;     // Regex pattern
  read: string;      // Regex pattern
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  tags: UserTag[];
}

// =============================================================================
// POLICY TYPES
// =============================================================================

export interface PolicyDefinition {
  'ha-mode'?: 'all' | 'exactly' | 'nodes';
  'ha-params'?: number | string[];
  'ha-sync-mode'?: 'manual' | 'automatic';
  'federation-upstream-set'?: string;
  'federation-upstream'?: string;
  'message-ttl'?: number;
  'max-length'?: number;
  'max-length-bytes'?: number;
  'overflow'?: 'drop-head' | 'reject-publish' | 'reject-publish-dlx';
  'dead-letter-exchange'?: string;
  'dead-letter-routing-key'?: string;
  'alternate-exchange'?: string;
  'queue-master-locator'?: string;
}

export interface Policy {
  id: string;
  name: string;
  vhost: string;
  pattern: string;
  applyTo: 'queues' | 'exchanges' | 'all';
  priority: number;
  definition: PolicyDefinition;
}

// =============================================================================
// METRICS TYPES
// =============================================================================

export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface QueueMetrics {
  queueId: string;
  messagesReady: MetricPoint[];
  messagesUnacked: MetricPoint[];
  publishRate: MetricPoint[];
  deliverRate: MetricPoint[];
  ackRate: MetricPoint[];
  memory: MetricPoint[];
}

export interface SystemMetrics {
  // Memory
  memoryUsed: number;
  memoryLimit: number;
  memoryAlarm: boolean;

  // Disk
  diskFree: number;
  diskLimit: number;
  diskAlarm: boolean;

  // File descriptors
  fdUsed: number;
  fdLimit: number;

  // Sockets
  socketsUsed: number;
  socketsLimit: number;

  // Erlang processes
  processesUsed: number;
  processesLimit: number;

  // Run queue
  runQueue: number;

  // Uptime
  uptime: number;
}

export interface ClusterNode {
  id: string;
  name: string;
  type: 'disc' | 'ram';
  running: boolean;
  memoryUsed: number;
  diskFree: number;
  fdUsed: number;
  uptime: number;
  version: string;
}

// =============================================================================
// ALERT TYPES
// =============================================================================

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;

  // Conditions
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds

  // Scope
  scope: 'queue' | 'exchange' | 'connection' | 'system';
  targetPattern?: string;

  // Actions
  severity: AlertSeverity;
  notificationChannels: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;

  // Details
  message: string;
  targetType: string;
  targetName: string;
  currentValue: number;
  threshold: number;

  // Timestamps
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
}

export interface SystemEvent {
  id: string;
  type: 'queue' | 'exchange' | 'connection' | 'user' | 'policy' | 'system';
  action: 'created' | 'deleted' | 'modified' | 'started' | 'stopped' | 'error';
  severity: AlertSeverity;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  user?: string;
}

// =============================================================================
// INTEGRATION TYPES
// =============================================================================

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'configuring';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  host: string;
  port: number;
  database: string;
  username: string;
  ssl: boolean;
  status: IntegrationStatus;

  // Pool settings
  poolMin: number;
  poolMax: number;

  // Stats
  activeConnections: number;
  queryCount: number;
  avgQueryTime: number;
}

export interface LoggingService {
  id: string;
  name: string;
  type: 'elasticsearch' | 'opensearch' | 'datadog' | 'splunk' | 'loki';
  endpoint: string;
  apiKey?: string;
  index?: string;
  status: IntegrationStatus;

  // Settings
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  batchSize: number;
  flushInterval: number;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'teams' | 'discord' | 'pagerduty' | 'opsgenie' | 'webhook' | 'sms';
  enabled: boolean;
  status: IntegrationStatus;

  // Config (varies by type)
  config: Record<string, unknown>;

  // Stats
  notificationsSent: number;
  lastSentAt?: string;
  failureCount: number;
}

export interface CloudBridge {
  id: string;
  name: string;
  type: 'aws-sqs' | 'azure-servicebus' | 'gcp-pubsub';
  direction: 'inbound' | 'outbound' | 'bidirectional';
  status: IntegrationStatus;

  // Config
  config: Record<string, unknown>;

  // Mapping
  sourceQueue?: string;
  destinationQueue?: string;
  transformationEnabled: boolean;

  // Stats
  messagesForwarded: number;
  messagesReceived: number;
  lastActivityAt?: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'ldap' | 'oauth2' | 'saml' | 'oidc';
  enabled: boolean;
  status: IntegrationStatus;
  priority: number;

  // Config
  config: Record<string, unknown>;

  // Stats
  authenticationsCount: number;
  lastAuthAt?: string;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export type ViewMode = 'grid' | 'list' | 'topology';
export type TimeRange = '1h' | '6h' | '12h' | '24h' | '7d' | '30d' | 'custom';

export interface TimeRangeValue {
  range: TimeRange;
  from?: Date;
  to?: Date;
}

export interface FilterState {
  search: string;
  vhost: string | null;
  state: string | null;
  type: string | null;
}

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

export interface QueueTemplate {
  id: string;
  name: string;
  description: string;
  category: string;

  // Queue config
  queueType: QueueType;
  durable: boolean;
  autoDelete: boolean;
  arguments: QueueArguments;

  // Metadata
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;

  // Trigger
  triggerType: 'schedule' | 'event' | 'threshold';
  triggerConfig: Record<string, unknown>;

  // Actions
  actions: AutomationAction[];

  // Stats
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface AutomationAction {
  type: 'create-queue' | 'delete-queue' | 'purge-queue' | 'scale-consumers' | 'notify' | 'webhook';
  config: Record<string, unknown>;
}
