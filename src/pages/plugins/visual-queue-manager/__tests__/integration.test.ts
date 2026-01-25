/**
 * Queue Manager Integration Tests
 * Tests for end-to-end functionality and data flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useQueueManagerStore } from '../stores/queueManagerStore';
import type { Queue, Exchange, Binding, Alert, AlertRule, ApiEndpoint } from '../types';

describe('Queue Manager Integration Tests', () => {
  beforeEach(() => {
    // Reset store state
    useQueueManagerStore.setState({
      queues: [],
      exchanges: [],
      bindings: [],
      connections: [],
      channels: [],
      consumers: [],
      virtualHosts: [],
      users: [],
      roles: [],
      policies: [],
      alerts: [],
      alertRules: [],
      events: [],
      apiEndpoints: [],
      permissions: [],
      messages: [],
      liveMessages: [],
      isStreaming: false,
    });
  });

  // ==========================================================================
  // QUEUE WORKFLOW TESTS (10 tests)
  // ==========================================================================
  describe('Queue Workflows', () => {
    it('should create queue and add binding', () => {
      const { addQueue, addExchange, addBinding } = useQueueManagerStore.getState();

      // Create exchange first
      const exchange: Exchange = {
        id: 'ex-1',
        name: 'orders',
        vhost: '/',
        type: 'direct',
        durable: true,
        autoDelete: false,
        internal: false,
        arguments: {},
        messagesIn: 0,
        messagesOut: 0,
        publishRate: 0,
      };
      addExchange(exchange);

      // Create queue
      const queue: Queue = {
        id: 'q-1',
        name: 'orders.processing',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
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
      addQueue(queue);

      // Create binding
      const binding: Binding = {
        id: 'b-1',
        source: 'orders',
        sourceType: 'exchange',
        destination: 'orders.processing',
        destinationType: 'queue',
        routingKey: 'order.*',
        arguments: {},
        vhost: '/',
      };
      addBinding(binding);

      const state = useQueueManagerStore.getState();
      expect(state.queues).toHaveLength(1);
      expect(state.exchanges).toHaveLength(1);
      expect(state.bindings).toHaveLength(1);
      expect(state.bindings[0].source).toBe(exchange.name);
      expect(state.bindings[0].destination).toBe(queue.name);
    });

    it('should cascade delete bindings when queue deleted', () => {
      const { addQueue, addExchange, addBinding, deleteQueue } = useQueueManagerStore.getState();

      addExchange({
        id: 'ex-1',
        name: 'orders',
        vhost: '/',
        type: 'direct',
        durable: true,
        autoDelete: false,
        internal: false,
        arguments: {},
        messagesIn: 0,
        messagesOut: 0,
        publishRate: 0,
      });

      addQueue({
        id: 'q-1',
        name: 'orders.processing',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
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
      });

      addBinding({
        id: 'b-1',
        source: 'orders',
        sourceType: 'exchange',
        destination: 'orders.processing',
        destinationType: 'queue',
        routingKey: 'order.*',
        arguments: {},
        vhost: '/',
      });

      deleteQueue('q-1');

      const state = useQueueManagerStore.getState();
      expect(state.queues).toHaveLength(0);
      expect(state.bindings).toHaveLength(0);
    });

    it('should handle queue purge workflow', () => {
      const { addQueue, updateQueue, purgeQueue } = useQueueManagerStore.getState();

      addQueue({
        id: 'q-1',
        name: 'test.queue',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
        messagesReady: 5000,
        messagesUnacked: 200,
        messagesTotal: 5200,
        consumers: 3,
        memory: 1000000,
        publishRate: 100,
        deliverRate: 80,
        ackRate: 75,
        redeliverRate: 5,
        createdAt: new Date().toISOString(),
        healthScore: 85,
      });

      purgeQueue('q-1');

      const queue = useQueueManagerStore.getState().queues[0];
      expect(queue.messagesReady).toBe(0);
      expect(queue.messagesUnacked).toBe(0);
      expect(queue.messagesTotal).toBe(0);
    });

    it('should track queue health over updates', () => {
      const { addQueue, updateQueue } = useQueueManagerStore.getState();

      addQueue({
        id: 'q-1',
        name: 'test.queue',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
        messagesReady: 0,
        messagesUnacked: 0,
        messagesTotal: 0,
        consumers: 5,
        memory: 0,
        publishRate: 0,
        deliverRate: 0,
        ackRate: 0,
        redeliverRate: 0,
        createdAt: new Date().toISOString(),
        healthScore: 100,
      });

      // Simulate growing queue (potential issue)
      updateQueue('q-1', { messagesReady: 10000, healthScore: 70 });

      expect(useQueueManagerStore.getState().queues[0].healthScore).toBe(70);
    });

    it('should handle DLQ setup workflow', () => {
      const { addQueue, addExchange, addBinding } = useQueueManagerStore.getState();

      // Create DLX exchange
      addExchange({
        id: 'dlx-1',
        name: 'dlx',
        vhost: '/',
        type: 'fanout',
        durable: true,
        autoDelete: false,
        internal: true,
        arguments: {},
        messagesIn: 0,
        messagesOut: 0,
        publishRate: 0,
      });

      // Create DLQ
      addQueue({
        id: 'dlq-1',
        name: 'orders.dlq',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
        messagesReady: 0,
        messagesUnacked: 0,
        messagesTotal: 0,
        consumers: 1,
        memory: 0,
        publishRate: 0,
        deliverRate: 0,
        ackRate: 0,
        redeliverRate: 0,
        createdAt: new Date().toISOString(),
        healthScore: 100,
      });

      // Create main queue with DLX
      addQueue({
        id: 'q-1',
        name: 'orders.processing',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: { 'x-dead-letter-exchange': 'dlx' },
        messagesReady: 0,
        messagesUnacked: 0,
        messagesTotal: 0,
        consumers: 5,
        memory: 0,
        publishRate: 0,
        deliverRate: 0,
        ackRate: 0,
        redeliverRate: 0,
        createdAt: new Date().toISOString(),
        healthScore: 100,
      });

      // Bind DLQ to DLX
      addBinding({
        id: 'b-dlq',
        source: 'dlx',
        sourceType: 'exchange',
        destination: 'orders.dlq',
        destinationType: 'queue',
        routingKey: '',
        arguments: {},
        vhost: '/',
      });

      const state = useQueueManagerStore.getState();
      expect(state.queues).toHaveLength(2);
      expect(state.exchanges[0].internal).toBe(true);
      expect(state.queues.find(q => q.name === 'orders.processing')?.arguments).toHaveProperty('x-dead-letter-exchange');
    });

    it('should handle multiple bindings per queue', () => {
      const { addQueue, addExchange, addBinding } = useQueueManagerStore.getState();

      addExchange({
        id: 'ex-1',
        name: 'orders',
        vhost: '/',
        type: 'topic',
        durable: true,
        autoDelete: false,
        internal: false,
        arguments: {},
        messagesIn: 0,
        messagesOut: 0,
        publishRate: 0,
      });

      addQueue({
        id: 'q-1',
        name: 'all.orders',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
        messagesReady: 0,
        messagesUnacked: 0,
        messagesTotal: 0,
        consumers: 1,
        memory: 0,
        publishRate: 0,
        deliverRate: 0,
        ackRate: 0,
        redeliverRate: 0,
        createdAt: new Date().toISOString(),
        healthScore: 100,
      });

      // Add multiple bindings with different routing keys
      addBinding({ id: 'b-1', source: 'orders', sourceType: 'exchange', destination: 'all.orders', destinationType: 'queue', routingKey: 'order.created', arguments: {}, vhost: '/' });
      addBinding({ id: 'b-2', source: 'orders', sourceType: 'exchange', destination: 'all.orders', destinationType: 'queue', routingKey: 'order.updated', arguments: {}, vhost: '/' });
      addBinding({ id: 'b-3', source: 'orders', sourceType: 'exchange', destination: 'all.orders', destinationType: 'queue', routingKey: 'order.deleted', arguments: {}, vhost: '/' });

      expect(useQueueManagerStore.getState().bindings).toHaveLength(3);
    });

    it('should handle quorum queue creation', () => {
      const { addQueue } = useQueueManagerStore.getState();

      addQueue({
        id: 'q-quorum',
        name: 'critical.orders',
        vhost: '/',
        type: 'quorum',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: { 'x-quorum-initial-group-size': 3 },
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
      });

      const queue = useQueueManagerStore.getState().queues[0];
      expect(queue.type).toBe('quorum');
      expect(queue.arguments).toHaveProperty('x-quorum-initial-group-size');
    });

    it('should update queue metrics in real-time simulation', () => {
      const { addQueue, updateQueue } = useQueueManagerStore.getState();

      addQueue({
        id: 'q-1',
        name: 'test.queue',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
        messagesReady: 100,
        messagesUnacked: 10,
        messagesTotal: 110,
        consumers: 5,
        memory: 50000,
        publishRate: 50,
        deliverRate: 45,
        ackRate: 40,
        redeliverRate: 5,
        createdAt: new Date().toISOString(),
        healthScore: 95,
      });

      // Simulate metric updates
      updateQueue('q-1', {
        messagesReady: 150,
        messagesUnacked: 15,
        messagesTotal: 165,
        publishRate: 75,
        deliverRate: 60,
        memory: 75000,
      });

      const queue = useQueueManagerStore.getState().queues[0];
      expect(queue.messagesReady).toBe(150);
      expect(queue.publishRate).toBe(75);
    });

    it('should handle queue selection and deselection', () => {
      const { addQueue, setSelectedQueueId } = useQueueManagerStore.getState();

      addQueue({
        id: 'q-1',
        name: 'test.queue',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
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
      });

      setSelectedQueueId('q-1');
      expect(useQueueManagerStore.getState().selectedQueueId).toBe('q-1');

      setSelectedQueueId(null);
      expect(useQueueManagerStore.getState().selectedQueueId).toBeNull();
    });

    it('should track queue state changes', () => {
      const { addQueue, updateQueue } = useQueueManagerStore.getState();

      addQueue({
        id: 'q-1',
        name: 'test.queue',
        vhost: '/',
        type: 'classic',
        state: 'running',
        durable: true,
        autoDelete: false,
        exclusive: false,
        arguments: {},
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
      });

      expect(useQueueManagerStore.getState().queues[0].state).toBe('running');

      updateQueue('q-1', { state: 'idle' });
      expect(useQueueManagerStore.getState().queues[0].state).toBe('idle');
    });
  });

  // ==========================================================================
  // ALERT WORKFLOW TESTS (8 tests)
  // ==========================================================================
  describe('Alert Workflows', () => {
    it('should create and acknowledge alert', () => {
      const { addAlert, acknowledgeAlert } = useQueueManagerStore.getState();

      const alert: Alert = {
        id: 'alert-1',
        ruleId: 'rule-1',
        ruleName: 'High Queue Depth',
        severity: 'warning',
        status: 'active',
        message: 'Queue orders.processing exceeded 5000 messages',
        targetType: 'queue',
        targetName: 'orders.processing',
        currentValue: 7500,
        threshold: 5000,
        triggeredAt: new Date().toISOString(),
      };

      addAlert(alert);
      expect(useQueueManagerStore.getState().alerts[0].status).toBe('active');

      acknowledgeAlert('alert-1', 'admin');
      const updatedAlert = useQueueManagerStore.getState().alerts[0];
      expect(updatedAlert.status).toBe('acknowledged');
      expect(updatedAlert.acknowledgedBy).toBe('admin');
    });

    it('should resolve acknowledged alert', () => {
      const { addAlert, acknowledgeAlert, resolveAlert } = useQueueManagerStore.getState();

      addAlert({
        id: 'alert-1',
        ruleId: 'rule-1',
        ruleName: 'High Queue Depth',
        severity: 'warning',
        status: 'active',
        message: 'Test alert',
        targetType: 'queue',
        targetName: 'test.queue',
        currentValue: 7500,
        threshold: 5000,
        triggeredAt: new Date().toISOString(),
      });

      acknowledgeAlert('alert-1', 'admin');
      resolveAlert('alert-1');

      const alert = useQueueManagerStore.getState().alerts[0];
      expect(alert.status).toBe('resolved');
      expect(alert.resolvedAt).toBeDefined();
    });

    it('should dismiss alert completely', () => {
      const { addAlert, dismissAlert } = useQueueManagerStore.getState();

      addAlert({
        id: 'alert-1',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        severity: 'info',
        status: 'active',
        message: 'Test alert',
        targetType: 'queue',
        targetName: 'test.queue',
        currentValue: 100,
        threshold: 50,
        triggeredAt: new Date().toISOString(),
      });

      expect(useQueueManagerStore.getState().alerts).toHaveLength(1);

      dismissAlert('alert-1');
      expect(useQueueManagerStore.getState().alerts).toHaveLength(0);
    });

    it('should handle multiple concurrent alerts', () => {
      const { addAlert } = useQueueManagerStore.getState();

      // Simulate multiple alerts triggering at once
      for (let i = 0; i < 5; i++) {
        addAlert({
          id: `alert-${i}`,
          ruleId: `rule-${i % 2}`,
          ruleName: i % 2 === 0 ? 'High Queue Depth' : 'Slow Consumer',
          severity: i === 0 ? 'critical' : 'warning',
          status: 'active',
          message: `Alert message ${i}`,
          targetType: 'queue',
          targetName: `queue-${i}`,
          currentValue: 1000 * (i + 1),
          threshold: 500,
          triggeredAt: new Date().toISOString(),
        });
      }

      expect(useQueueManagerStore.getState().alerts).toHaveLength(5);
    });

    it('should create and manage alert rules', () => {
      const { addAlertRule, updateAlertRule, deleteAlertRule } = useQueueManagerStore.getState();

      const rule: AlertRule = {
        id: 'rule-1',
        name: 'High Queue Depth',
        description: 'Alert when queue exceeds message threshold',
        enabled: true,
        metric: 'queue_messages',
        operator: '>',
        threshold: 5000,
        duration: 300,
        severity: 'warning',
        notificationChannels: ['email', 'slack'],
        target: { type: 'queue', pattern: '.*' },
      };

      addAlertRule(rule);
      expect(useQueueManagerStore.getState().alertRules).toHaveLength(1);

      updateAlertRule('rule-1', { threshold: 10000 });
      expect(useQueueManagerStore.getState().alertRules[0].threshold).toBe(10000);

      updateAlertRule('rule-1', { enabled: false });
      expect(useQueueManagerStore.getState().alertRules[0].enabled).toBe(false);

      deleteAlertRule('rule-1');
      expect(useQueueManagerStore.getState().alertRules).toHaveLength(0);
    });

    it('should link alerts to rules', () => {
      const { addAlertRule, addAlert } = useQueueManagerStore.getState();

      addAlertRule({
        id: 'rule-1',
        name: 'High Queue Depth',
        description: 'Test rule',
        enabled: true,
        metric: 'queue_messages',
        operator: '>',
        threshold: 5000,
        duration: 300,
        severity: 'warning',
        notificationChannels: ['email'],
        target: { type: 'queue', pattern: '.*' },
      });

      addAlert({
        id: 'alert-1',
        ruleId: 'rule-1',
        ruleName: 'High Queue Depth',
        severity: 'warning',
        status: 'active',
        message: 'Alert from rule',
        targetType: 'queue',
        targetName: 'test.queue',
        currentValue: 7500,
        threshold: 5000,
        triggeredAt: new Date().toISOString(),
      });

      const alert = useQueueManagerStore.getState().alerts[0];
      const rule = useQueueManagerStore.getState().alertRules[0];
      expect(alert.ruleId).toBe(rule.id);
    });

    it('should order alerts by time (newest first)', () => {
      const { addAlert } = useQueueManagerStore.getState();

      addAlert({
        id: 'alert-old',
        ruleId: 'rule-1',
        ruleName: 'Test',
        severity: 'warning',
        status: 'active',
        message: 'Old alert',
        targetType: 'queue',
        targetName: 'queue',
        currentValue: 100,
        threshold: 50,
        triggeredAt: new Date(Date.now() - 10000).toISOString(),
      });

      addAlert({
        id: 'alert-new',
        ruleId: 'rule-1',
        ruleName: 'Test',
        severity: 'warning',
        status: 'active',
        message: 'New alert',
        targetType: 'queue',
        targetName: 'queue',
        currentValue: 100,
        threshold: 50,
        triggeredAt: new Date().toISOString(),
      });

      const alerts = useQueueManagerStore.getState().alerts;
      expect(alerts[0].id).toBe('alert-new');
    });

    it('should handle alert severity levels', () => {
      const { addAlert } = useQueueManagerStore.getState();

      const severities: Array<'critical' | 'error' | 'warning' | 'info'> = ['critical', 'error', 'warning', 'info'];
      severities.forEach((severity, i) => {
        addAlert({
          id: `alert-${severity}`,
          ruleId: 'rule-1',
          ruleName: 'Test',
          severity,
          status: 'active',
          message: `${severity} alert`,
          targetType: 'queue',
          targetName: 'queue',
          currentValue: 100,
          threshold: 50,
          triggeredAt: new Date().toISOString(),
        });
      });

      const alerts = useQueueManagerStore.getState().alerts;
      expect(alerts).toHaveLength(4);
      expect(alerts.some(a => a.severity === 'critical')).toBe(true);
    });
  });

  // ==========================================================================
  // API ENDPOINT WORKFLOW TESTS (6 tests)
  // ==========================================================================
  describe('API Endpoint Workflows', () => {
    it('should create API endpoint with bearer auth', () => {
      const { addApiEndpoint } = useQueueManagerStore.getState();

      const endpoint: ApiEndpoint = {
        id: 'ep-1',
        name: 'Order Events API',
        path: '/api/v1/orders',
        method: 'POST',
        description: 'Endpoint for order events',
        authMethod: 'bearer',
        token: 'tok_test123',
        status: 'active',
        rateLimit: { requestsPerMinute: 1000, burstSize: 100 },
        permissions: ['queue:write', 'exchange:read'],
        allowedIps: [],
        createdAt: new Date().toISOString(),
        requestCount: 0,
      };

      addApiEndpoint(endpoint);
      expect(useQueueManagerStore.getState().apiEndpoints).toHaveLength(1);
      expect(useQueueManagerStore.getState().apiEndpoints[0].authMethod).toBe('bearer');
    });

    it('should update endpoint status', () => {
      const { addApiEndpoint, updateApiEndpoint } = useQueueManagerStore.getState();

      addApiEndpoint({
        id: 'ep-1',
        name: 'Test Endpoint',
        path: '/api/v1/test',
        method: 'POST',
        description: 'Test',
        authMethod: 'api-key',
        apiKey: 'ak_test',
        status: 'active',
        rateLimit: { requestsPerMinute: 100, burstSize: 10 },
        permissions: [],
        allowedIps: [],
        createdAt: new Date().toISOString(),
        requestCount: 0,
      });

      updateApiEndpoint('ep-1', { status: 'disabled' });
      expect(useQueueManagerStore.getState().apiEndpoints[0].status).toBe('disabled');
    });

    it('should delete API endpoint', () => {
      const { addApiEndpoint, deleteApiEndpoint } = useQueueManagerStore.getState();

      addApiEndpoint({
        id: 'ep-1',
        name: 'Test Endpoint',
        path: '/api/v1/test',
        method: 'GET',
        description: 'Test',
        authMethod: 'basic',
        status: 'active',
        rateLimit: { requestsPerMinute: 100, burstSize: 10 },
        permissions: ['queue:read'],
        allowedIps: [],
        createdAt: new Date().toISOString(),
        requestCount: 0,
      });

      deleteApiEndpoint('ep-1');
      expect(useQueueManagerStore.getState().apiEndpoints).toHaveLength(0);
    });

    it('should create endpoint with IP whitelist', () => {
      const { addApiEndpoint } = useQueueManagerStore.getState();

      addApiEndpoint({
        id: 'ep-1',
        name: 'Internal API',
        path: '/api/internal',
        method: 'POST',
        description: 'Internal only',
        authMethod: 'bearer',
        token: 'tok_internal',
        status: 'active',
        rateLimit: { requestsPerMinute: 10000, burstSize: 1000 },
        permissions: ['*'],
        allowedIps: ['10.0.0.0/8', '192.168.0.0/16'],
        createdAt: new Date().toISOString(),
        requestCount: 0,
      });

      const endpoint = useQueueManagerStore.getState().apiEndpoints[0];
      expect(endpoint.allowedIps).toHaveLength(2);
    });

    it('should track endpoint request counts', () => {
      const { addApiEndpoint, updateApiEndpoint } = useQueueManagerStore.getState();

      addApiEndpoint({
        id: 'ep-1',
        name: 'High Traffic API',
        path: '/api/v1/events',
        method: 'POST',
        description: 'High traffic',
        authMethod: 'api-key',
        apiKey: 'ak_events',
        status: 'active',
        rateLimit: { requestsPerMinute: 10000, burstSize: 1000 },
        permissions: ['queue:write'],
        allowedIps: [],
        createdAt: new Date().toISOString(),
        requestCount: 0,
      });

      // Simulate request count updates
      updateApiEndpoint('ep-1', { requestCount: 150000, lastUsedAt: new Date().toISOString() });

      const endpoint = useQueueManagerStore.getState().apiEndpoints[0];
      expect(endpoint.requestCount).toBe(150000);
      expect(endpoint.lastUsedAt).toBeDefined();
    });

    it('should support multiple auth methods', () => {
      const { addApiEndpoint } = useQueueManagerStore.getState();

      const authMethods: Array<'bearer' | 'api-key' | 'basic' | 'oauth2' | 'hmac'> = ['bearer', 'api-key', 'basic', 'oauth2', 'hmac'];

      authMethods.forEach((method, i) => {
        addApiEndpoint({
          id: `ep-${i}`,
          name: `${method} Endpoint`,
          path: `/api/${method}`,
          method: 'POST',
          description: `Uses ${method} auth`,
          authMethod: method,
          status: 'active',
          rateLimit: { requestsPerMinute: 100, burstSize: 10 },
          permissions: [],
          allowedIps: [],
          createdAt: new Date().toISOString(),
          requestCount: 0,
        });
      });

      expect(useQueueManagerStore.getState().apiEndpoints).toHaveLength(5);
    });
  });

  // ==========================================================================
  // USER AND PERMISSION WORKFLOW TESTS (6 tests)
  // ==========================================================================
  describe('User and Permission Workflows', () => {
    it('should create user and assign permissions', () => {
      const { addUser, addPermission, addVirtualHost } = useQueueManagerStore.getState();

      addVirtualHost({
        id: 'vh-1',
        name: '/',
        queueCount: 0,
        exchangeCount: 0,
        connectionCount: 0,
        tracingEnabled: false,
      });

      addUser({
        id: 'user-1',
        username: 'app-user',
        passwordHash: '',
        tags: ['monitoring'],
        createdAt: new Date().toISOString(),
      });

      addPermission({
        id: 'perm-1',
        userId: 'user-1',
        vhost: '/',
        configure: '',
        write: '^app\\..*',
        read: '.*',
      });

      const state = useQueueManagerStore.getState();
      expect(state.users).toHaveLength(1);
      expect(state.permissions).toHaveLength(1);
      expect(state.permissions[0].userId).toBe('user-1');
    });

    it('should update user tags', () => {
      const { addUser, updateUser } = useQueueManagerStore.getState();

      addUser({
        id: 'user-1',
        username: 'test-user',
        passwordHash: '',
        tags: ['monitoring'],
        createdAt: new Date().toISOString(),
      });

      updateUser('user-1', { tags: ['administrator', 'monitoring', 'policymaker'] });

      const user = useQueueManagerStore.getState().users[0];
      expect(user.tags).toContain('administrator');
      expect(user.tags).toHaveLength(3);
    });

    it('should delete user and clean up permissions', () => {
      const { addUser, addPermission, deleteUser, deletePermission } = useQueueManagerStore.getState();

      addUser({
        id: 'user-1',
        username: 'test-user',
        passwordHash: '',
        tags: [],
        createdAt: new Date().toISOString(),
      });

      addPermission({
        id: 'perm-1',
        userId: 'user-1',
        vhost: '/',
        configure: '.*',
        write: '.*',
        read: '.*',
      });

      deletePermission('perm-1');
      deleteUser('user-1');

      const state = useQueueManagerStore.getState();
      expect(state.users).toHaveLength(0);
      expect(state.permissions).toHaveLength(0);
    });

    it('should handle multiple vhost permissions', () => {
      const { addUser, addVirtualHost, addPermission } = useQueueManagerStore.getState();

      addUser({
        id: 'user-1',
        username: 'multi-vhost-user',
        passwordHash: '',
        tags: [],
        createdAt: new Date().toISOString(),
      });

      addVirtualHost({ id: 'vh-1', name: '/', queueCount: 0, exchangeCount: 0, connectionCount: 0, tracingEnabled: false });
      addVirtualHost({ id: 'vh-2', name: '/production', queueCount: 0, exchangeCount: 0, connectionCount: 0, tracingEnabled: false });
      addVirtualHost({ id: 'vh-3', name: '/staging', queueCount: 0, exchangeCount: 0, connectionCount: 0, tracingEnabled: false });

      addPermission({ id: 'perm-1', userId: 'user-1', vhost: '/', configure: '', write: '', read: '.*' });
      addPermission({ id: 'perm-2', userId: 'user-1', vhost: '/production', configure: '', write: '.*', read: '.*' });
      addPermission({ id: 'perm-3', userId: 'user-1', vhost: '/staging', configure: '.*', write: '.*', read: '.*' });

      expect(useQueueManagerStore.getState().permissions).toHaveLength(3);
    });

    it('should create policies for queues', () => {
      const { addPolicy, updatePolicy } = useQueueManagerStore.getState();

      addPolicy({
        id: 'policy-1',
        name: 'ha-all',
        vhost: '/',
        pattern: '.*',
        applyTo: 'queues',
        priority: 0,
        definition: { 'ha-mode': 'all', 'ha-sync-mode': 'automatic' },
      });

      expect(useQueueManagerStore.getState().policies).toHaveLength(1);

      updatePolicy('policy-1', { priority: 10 });
      expect(useQueueManagerStore.getState().policies[0].priority).toBe(10);
    });

    it('should manage virtual hosts', () => {
      const { addVirtualHost, updateVirtualHost, deleteVirtualHost } = useQueueManagerStore.getState();

      addVirtualHost({
        id: 'vh-1',
        name: '/new-vhost',
        queueCount: 0,
        exchangeCount: 0,
        connectionCount: 0,
        tracingEnabled: false,
      });

      expect(useQueueManagerStore.getState().virtualHosts).toHaveLength(1);

      updateVirtualHost('vh-1', { tracingEnabled: true, queueCount: 5 });
      expect(useQueueManagerStore.getState().virtualHosts[0].tracingEnabled).toBe(true);

      deleteVirtualHost('vh-1');
      expect(useQueueManagerStore.getState().virtualHosts).toHaveLength(0);
    });
  });
});
