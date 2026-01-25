/**
 * Queue Manager API Client
 * Complete API interface for RabbitMQ-style queue management
 */

import { apiClient } from './client';
import type {
  Queue,
  Exchange,
  Binding,
  Connection,
  Channel,
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
// RESPONSE TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueueStats {
  queueId: string;
  messagesReady: number;
  messagesUnacked: number;
  publishRate: number;
  deliverRate: number;
  ackRate: number;
  timestamp: string;
}

export interface ExchangeStats {
  exchangeId: string;
  messagesIn: number;
  messagesOut: number;
  publishRate: number;
  timestamp: string;
}

export interface ConnectionStats {
  connectionId: string;
  sendRate: number;
  receiveRate: number;
  channelCount: number;
  timestamp: string;
}

export interface PublishMessageRequest {
  exchangeName: string;
  routingKey: string;
  payload: string;
  contentType: string;
  headers?: Record<string, string>;
  properties?: {
    deliveryMode?: 1 | 2;
    priority?: number;
    correlationId?: string;
    replyTo?: string;
    expiration?: string;
    messageId?: string;
    timestamp?: number;
    type?: string;
    userId?: string;
    appId?: string;
  };
}

export interface MessageAckRequest {
  messageId: string;
  queueName: string;
  ack: boolean;
  requeue?: boolean;
}

// =============================================================================
// QUEUES API
// =============================================================================

export const queuesApi = {
  // List all queues
  getAll: (params?: { vhost?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<Queue>>('/queue-manager/queues', { params }),

  // Get queue by ID
  getById: (id: string) =>
    apiClient.get<Queue>(`/queue-manager/queues/${id}`),

  // Get queue by name
  getByName: (name: string, vhost: string = '/') =>
    apiClient.get<Queue>('/queue-manager/queues/by-name', { params: { name, vhost } }),

  // Create queue
  create: (data: Partial<Queue>) =>
    apiClient.post<Queue>('/queue-manager/queues', data),

  // Update queue
  update: (id: string, data: Partial<Queue>) =>
    apiClient.put<Queue>(`/queue-manager/queues/${id}`, data),

  // Delete queue
  delete: (id: string, options?: { ifUnused?: boolean; ifEmpty?: boolean }) =>
    apiClient.delete(`/queue-manager/queues/${id}`, { params: options }),

  // Purge queue
  purge: (id: string) =>
    apiClient.post<{ messagesDeleted: number }>(`/queue-manager/queues/${id}/purge`),

  // Get queue messages
  getMessages: (id: string, params?: { count?: number; ackMode?: 'peek' | 'get' }) =>
    apiClient.get<Message[]>(`/queue-manager/queues/${id}/messages`, { params }),

  // Get queue stats
  getStats: (id: string, params?: { timeRange?: string }) =>
    apiClient.get<QueueStats[]>(`/queue-manager/queues/${id}/stats`, { params }),

  // Get queue consumers
  getConsumers: (id: string) =>
    apiClient.get<Consumer[]>(`/queue-manager/queues/${id}/consumers`),

  // Get queue bindings
  getBindings: (id: string) =>
    apiClient.get<Binding[]>(`/queue-manager/queues/${id}/bindings`),

  // Move messages to another queue
  moveMessages: (id: string, targetQueue: string, count?: number) =>
    apiClient.post<{ messagesMoved: number }>(`/queue-manager/queues/${id}/move`, { targetQueue, count }),
};

// =============================================================================
// EXCHANGES API
// =============================================================================

export const exchangesApi = {
  // List all exchanges
  getAll: (params?: { vhost?: string; type?: string }) =>
    apiClient.get<Exchange[]>('/queue-manager/exchanges', { params }),

  // Get exchange by ID
  getById: (id: string) =>
    apiClient.get<Exchange>(`/queue-manager/exchanges/${id}`),

  // Get exchange by name
  getByName: (name: string, vhost: string = '/') =>
    apiClient.get<Exchange>('/queue-manager/exchanges/by-name', { params: { name, vhost } }),

  // Create exchange
  create: (data: Partial<Exchange>) =>
    apiClient.post<Exchange>('/queue-manager/exchanges', data),

  // Delete exchange
  delete: (id: string, options?: { ifUnused?: boolean }) =>
    apiClient.delete(`/queue-manager/exchanges/${id}`, { params: options }),

  // Get exchange bindings (source)
  getSourceBindings: (id: string) =>
    apiClient.get<Binding[]>(`/queue-manager/exchanges/${id}/bindings/source`),

  // Get exchange bindings (destination)
  getDestinationBindings: (id: string) =>
    apiClient.get<Binding[]>(`/queue-manager/exchanges/${id}/bindings/destination`),

  // Get exchange stats
  getStats: (id: string, params?: { timeRange?: string }) =>
    apiClient.get<ExchangeStats[]>(`/queue-manager/exchanges/${id}/stats`, { params }),

  // Publish message to exchange
  publish: (id: string, message: PublishMessageRequest) =>
    apiClient.post<{ routed: boolean }>(`/queue-manager/exchanges/${id}/publish`, message),
};

// =============================================================================
// BINDINGS API
// =============================================================================

export const bindingsApi = {
  // List all bindings
  getAll: (params?: { vhost?: string }) =>
    apiClient.get<Binding[]>('/queue-manager/bindings', { params }),

  // Get binding by ID
  getById: (id: string) =>
    apiClient.get<Binding>(`/queue-manager/bindings/${id}`),

  // Create binding
  create: (data: Partial<Binding>) =>
    apiClient.post<Binding>('/queue-manager/bindings', data),

  // Delete binding
  delete: (id: string) =>
    apiClient.delete(`/queue-manager/bindings/${id}`),

  // Get bindings between exchange and queue
  getBetween: (source: string, destination: string, vhost: string = '/') =>
    apiClient.get<Binding[]>('/queue-manager/bindings/between', {
      params: { source, destination, vhost },
    }),
};

// =============================================================================
// CONNECTIONS API
// =============================================================================

export const connectionsApi = {
  // List all connections
  getAll: (params?: { vhost?: string }) =>
    apiClient.get<Connection[]>('/queue-manager/connections', { params }),

  // Get connection by ID
  getById: (id: string) =>
    apiClient.get<Connection>(`/queue-manager/connections/${id}`),

  // Close connection
  close: (id: string, reason?: string) =>
    apiClient.delete(`/queue-manager/connections/${id}`, { data: { reason } }),

  // Get connection channels
  getChannels: (id: string) =>
    apiClient.get<Channel[]>(`/queue-manager/connections/${id}/channels`),

  // Get connection stats
  getStats: (id: string, params?: { timeRange?: string }) =>
    apiClient.get<ConnectionStats[]>(`/queue-manager/connections/${id}/stats`, { params }),

  // Block connection
  block: (id: string, reason?: string) =>
    apiClient.post(`/queue-manager/connections/${id}/block`, { reason }),

  // Unblock connection
  unblock: (id: string) =>
    apiClient.post(`/queue-manager/connections/${id}/unblock`),
};

// =============================================================================
// CHANNELS API
// =============================================================================

export const channelsApi = {
  // List all channels
  getAll: (params?: { vhost?: string; connectionId?: string }) =>
    apiClient.get<Channel[]>('/queue-manager/channels', { params }),

  // Get channel by ID
  getById: (id: string) =>
    apiClient.get<Channel>(`/queue-manager/channels/${id}`),

  // Close channel
  close: (id: string) =>
    apiClient.delete(`/queue-manager/channels/${id}`),
};

// =============================================================================
// CONSUMERS API
// =============================================================================

export const consumersApi = {
  // List all consumers
  getAll: (params?: { queueName?: string }) =>
    apiClient.get<Consumer[]>('/queue-manager/consumers', { params }),

  // Get consumer by ID
  getById: (id: string) =>
    apiClient.get<Consumer>(`/queue-manager/consumers/${id}`),

  // Cancel consumer
  cancel: (id: string) =>
    apiClient.delete(`/queue-manager/consumers/${id}`),
};

// =============================================================================
// MESSAGES API
// =============================================================================

export const messagesApi = {
  // Browse messages in a queue
  browse: (queueId: string, params?: { count?: number; offset?: number }) =>
    apiClient.get<Message[]>(`/queue-manager/messages/browse/${queueId}`, { params }),

  // Publish message
  publish: (message: PublishMessageRequest) =>
    apiClient.post<{ messageId: string; routed: boolean }>('/queue-manager/messages/publish', message),

  // Get message by ID
  getById: (id: string) =>
    apiClient.get<Message>(`/queue-manager/messages/${id}`),

  // Acknowledge message
  ack: (id: string, queueName: string) =>
    apiClient.post(`/queue-manager/messages/${id}/ack`, { queueName }),

  // Negative acknowledge message
  nack: (id: string, queueName: string, requeue?: boolean) =>
    apiClient.post(`/queue-manager/messages/${id}/nack`, { queueName, requeue }),

  // Reject message
  reject: (id: string, queueName: string, requeue?: boolean) =>
    apiClient.post(`/queue-manager/messages/${id}/reject`, { queueName, requeue }),

  // Move message to another queue
  move: (id: string, sourceQueue: string, targetQueue: string) =>
    apiClient.post(`/queue-manager/messages/${id}/move`, { sourceQueue, targetQueue }),

  // Delete message
  delete: (id: string, queueName: string) =>
    apiClient.delete(`/queue-manager/messages/${id}`, { params: { queueName } }),
};

// =============================================================================
// VIRTUAL HOSTS API
// =============================================================================

export const vhostsApi = {
  // List all virtual hosts
  getAll: () =>
    apiClient.get<VirtualHost[]>('/queue-manager/vhosts'),

  // Get virtual host by ID
  getById: (id: string) =>
    apiClient.get<VirtualHost>(`/queue-manager/vhosts/${id}`),

  // Create virtual host
  create: (data: Partial<VirtualHost>) =>
    apiClient.post<VirtualHost>('/queue-manager/vhosts', data),

  // Update virtual host
  update: (id: string, data: Partial<VirtualHost>) =>
    apiClient.put<VirtualHost>(`/queue-manager/vhosts/${id}`, data),

  // Delete virtual host
  delete: (id: string) =>
    apiClient.delete(`/queue-manager/vhosts/${id}`),

  // Get virtual host permissions
  getPermissions: (id: string) =>
    apiClient.get<Permission[]>(`/queue-manager/vhosts/${id}/permissions`),
};

// =============================================================================
// USERS API
// =============================================================================

export const queueUsersApi = {
  // List all users
  getAll: () =>
    apiClient.get<User[]>('/queue-manager/users'),

  // Get user by ID
  getById: (id: string) =>
    apiClient.get<User>(`/queue-manager/users/${id}`),

  // Create user
  create: (data: Partial<User> & { password: string }) =>
    apiClient.post<User>('/queue-manager/users', data),

  // Update user
  update: (id: string, data: Partial<User>) =>
    apiClient.put<User>(`/queue-manager/users/${id}`, data),

  // Delete user
  delete: (id: string) =>
    apiClient.delete(`/queue-manager/users/${id}`),

  // Update user password
  updatePassword: (id: string, password: string) =>
    apiClient.put(`/queue-manager/users/${id}/password`, { password }),

  // Get user permissions
  getPermissions: (id: string) =>
    apiClient.get<Permission[]>(`/queue-manager/users/${id}/permissions`),

  // Set user permission for vhost
  setPermission: (userId: string, vhost: string, permission: Partial<Permission>) =>
    apiClient.put(`/queue-manager/users/${userId}/permissions/${encodeURIComponent(vhost)}`, permission),

  // Delete user permission for vhost
  deletePermission: (userId: string, vhost: string) =>
    apiClient.delete(`/queue-manager/users/${userId}/permissions/${encodeURIComponent(vhost)}`),
};

// =============================================================================
// PERMISSIONS API
// =============================================================================

export const permissionsApi = {
  // List all permissions
  getAll: (params?: { vhost?: string; user?: string }) =>
    apiClient.get<Permission[]>('/queue-manager/permissions', { params }),

  // Get permission by ID
  getById: (id: string) =>
    apiClient.get<Permission>(`/queue-manager/permissions/${id}`),

  // Create permission
  create: (data: Partial<Permission>) =>
    apiClient.post<Permission>('/queue-manager/permissions', data),

  // Update permission
  update: (id: string, data: Partial<Permission>) =>
    apiClient.put<Permission>(`/queue-manager/permissions/${id}`, data),

  // Delete permission
  delete: (id: string) =>
    apiClient.delete(`/queue-manager/permissions/${id}`),
};

// =============================================================================
// POLICIES API
// =============================================================================

export const policiesApi = {
  // List all policies
  getAll: (params?: { vhost?: string }) =>
    apiClient.get<Policy[]>('/queue-manager/policies', { params }),

  // Get policy by ID
  getById: (id: string) =>
    apiClient.get<Policy>(`/queue-manager/policies/${id}`),

  // Create policy
  create: (data: Partial<Policy>) =>
    apiClient.post<Policy>('/queue-manager/policies', data),

  // Update policy
  update: (id: string, data: Partial<Policy>) =>
    apiClient.put<Policy>(`/queue-manager/policies/${id}`, data),

  // Delete policy
  delete: (id: string) =>
    apiClient.delete(`/queue-manager/policies/${id}`),
};

// =============================================================================
// ALERTS API
// =============================================================================

export const alertsApi = {
  // List all alerts
  getAll: (params?: { status?: 'active' | 'acknowledged' | 'resolved'; severity?: string }) =>
    apiClient.get<Alert[]>('/queue-manager/alerts', { params }),

  // Get alert by ID
  getById: (id: string) =>
    apiClient.get<Alert>(`/queue-manager/alerts/${id}`),

  // Acknowledge alert
  acknowledge: (id: string, user: string, note?: string) =>
    apiClient.post(`/queue-manager/alerts/${id}/acknowledge`, { user, note }),

  // Resolve alert
  resolve: (id: string, note?: string) =>
    apiClient.post(`/queue-manager/alerts/${id}/resolve`, { note }),

  // Dismiss alert
  dismiss: (id: string) =>
    apiClient.delete(`/queue-manager/alerts/${id}`),
};

// =============================================================================
// ALERT RULES API
// =============================================================================

export const alertRulesApi = {
  // List all alert rules
  getAll: () =>
    apiClient.get<AlertRule[]>('/queue-manager/alert-rules'),

  // Get alert rule by ID
  getById: (id: string) =>
    apiClient.get<AlertRule>(`/queue-manager/alert-rules/${id}`),

  // Create alert rule
  create: (data: Partial<AlertRule>) =>
    apiClient.post<AlertRule>('/queue-manager/alert-rules', data),

  // Update alert rule
  update: (id: string, data: Partial<AlertRule>) =>
    apiClient.put<AlertRule>(`/queue-manager/alert-rules/${id}`, data),

  // Delete alert rule
  delete: (id: string) =>
    apiClient.delete(`/queue-manager/alert-rules/${id}`),

  // Enable/disable alert rule
  setEnabled: (id: string, enabled: boolean) =>
    apiClient.put(`/queue-manager/alert-rules/${id}/enabled`, { enabled }),
};

// =============================================================================
// SYSTEM METRICS API
// =============================================================================

export const metricsApi = {
  // Get current system metrics
  getCurrent: () =>
    apiClient.get<SystemMetrics>('/queue-manager/metrics'),

  // Get historical metrics
  getHistory: (params?: { timeRange?: string; interval?: string }) =>
    apiClient.get<SystemMetrics[]>('/queue-manager/metrics/history', { params }),

  // Get cluster nodes
  getNodes: () =>
    apiClient.get<ClusterNode[]>('/queue-manager/metrics/nodes'),

  // Get node by ID
  getNode: (id: string) =>
    apiClient.get<ClusterNode>(`/queue-manager/metrics/nodes/${id}`),

  // Get overview stats
  getOverview: () =>
    apiClient.get<{
      queues: { total: number; running: number; idle: number };
      exchanges: { total: number; byType: Record<string, number> };
      connections: { total: number; active: number; blocked: number };
      consumers: { total: number };
      messages: { ready: number; unacked: number; total: number };
      rates: { publish: number; deliver: number; ack: number };
    }>('/queue-manager/metrics/overview'),
};

// =============================================================================
// API ENDPOINTS API
// =============================================================================

export const apiEndpointsApi = {
  // List all API endpoints
  getAll: (params?: { status?: string }) =>
    apiClient.get<ApiEndpoint[]>('/queue-manager/api-endpoints', { params }),

  // Get API endpoint by ID
  getById: (id: string) =>
    apiClient.get<ApiEndpoint>(`/queue-manager/api-endpoints/${id}`),

  // Create API endpoint
  create: (data: Partial<ApiEndpoint>) =>
    apiClient.post<ApiEndpoint>('/queue-manager/api-endpoints', data),

  // Update API endpoint
  update: (id: string, data: Partial<ApiEndpoint>) =>
    apiClient.put<ApiEndpoint>(`/queue-manager/api-endpoints/${id}`, data),

  // Delete API endpoint
  delete: (id: string) =>
    apiClient.delete(`/queue-manager/api-endpoints/${id}`),

  // Enable/disable API endpoint
  setEnabled: (id: string, enabled: boolean) =>
    apiClient.put(`/queue-manager/api-endpoints/${id}/enabled`, { enabled }),

  // Regenerate token/key
  regenerateCredentials: (id: string) =>
    apiClient.post<{ token?: string; apiKey?: string }>(`/queue-manager/api-endpoints/${id}/regenerate`),

  // Get endpoint stats
  getStats: (id: string, params?: { timeRange?: string }) =>
    apiClient.get<{
      totalRequests: number;
      successRate: number;
      avgLatency: number;
      requestsByHour: { hour: string; count: number }[];
    }>(`/queue-manager/api-endpoints/${id}/stats`, { params }),

  // Test endpoint
  test: (id: string) =>
    apiClient.post<{ success: boolean; latency: number; response?: unknown; error?: string }>(
      `/queue-manager/api-endpoints/${id}/test`
    ),
};

// =============================================================================
// TOPOLOGY API
// =============================================================================

export const topologyApi = {
  // Get full topology graph
  getGraph: (vhost: string = '/') =>
    apiClient.get<{
      exchanges: Exchange[];
      queues: Queue[];
      bindings: Binding[];
    }>('/queue-manager/topology', { params: { vhost } }),

  // Export topology
  export: (vhost: string = '/', format: 'json' | 'definitions') =>
    apiClient.get<unknown>('/queue-manager/topology/export', { params: { vhost, format } }),

  // Import topology
  import: (data: unknown, options?: { overwrite?: boolean }) =>
    apiClient.post<{ imported: { queues: number; exchanges: number; bindings: number } }>(
      '/queue-manager/topology/import',
      { data, ...options }
    ),
};

// =============================================================================
// WEBSOCKET CONNECTIONS
// =============================================================================

export interface WebSocketConfig {
  onMessage?: (message: Message) => void;
  onMetrics?: (metrics: SystemMetrics) => void;
  onAlert?: (alert: Alert) => void;
  onConnectionChange?: (connection: Connection, action: 'connected' | 'disconnected') => void;
  onError?: (error: Error) => void;
}

export function createQueueManagerWebSocket(config: WebSocketConfig): WebSocket | null {
  const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws/queue-manager`;

  try {
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message':
            config.onMessage?.(data.payload);
            break;
          case 'metrics':
            config.onMetrics?.(data.payload);
            break;
          case 'alert':
            config.onAlert?.(data.payload);
            break;
          case 'connection':
            config.onConnectionChange?.(data.payload.connection, data.payload.action);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (event) => {
      config.onError?.(new Error('WebSocket error'));
    };

    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    return null;
  }
}

// =============================================================================
// EXPORT ALL
// =============================================================================

export const queueManagerApi = {
  queues: queuesApi,
  exchanges: exchangesApi,
  bindings: bindingsApi,
  connections: connectionsApi,
  channels: channelsApi,
  consumers: consumersApi,
  messages: messagesApi,
  vhosts: vhostsApi,
  users: queueUsersApi,
  permissions: permissionsApi,
  policies: policiesApi,
  alerts: alertsApi,
  alertRules: alertRulesApi,
  metrics: metricsApi,
  apiEndpoints: apiEndpointsApi,
  topology: topologyApi,
  createWebSocket: createQueueManagerWebSocket,
};

export default queueManagerApi;
