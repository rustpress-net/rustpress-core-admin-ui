/**
 * Queue Manager API Tests
 * Tests for API client functionality
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import {
  queuesApi,
  exchangesApi,
  bindingsApi,
  connectionsApi,
  channelsApi,
  consumersApi,
  messagesApi,
  vhostsApi,
  queueUsersApi,
  permissionsApi,
  policiesApi,
  alertsApi,
  alertRulesApi,
  metricsApi,
  apiEndpointsApi,
  topologyApi,
} from '../../../../api/queueManagerApi';
import { queueManagerHandlers } from '../../../../mocks/queueManagerHandlers';

// Setup MSW server
const server = setupServer(...queueManagerHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Queue Manager API', () => {
  // ==========================================================================
  // QUEUES API TESTS (15 tests)
  // ==========================================================================
  describe('Queues API', () => {
    it('should fetch all queues', async () => {
      const response = await queuesApi.getAll();
      expect(response.data.data).toBeDefined();
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should fetch queues with pagination', async () => {
      const response = await queuesApi.getAll({ page: 1, pageSize: 10 });
      expect(response.data.page).toBe(1);
      expect(response.data.pageSize).toBe(10);
      expect(response.data.totalPages).toBeDefined();
    });

    it('should fetch queues filtered by vhost', async () => {
      const response = await queuesApi.getAll({ vhost: '/' });
      expect(response.data.data).toBeDefined();
    });

    it('should fetch a queue by ID', async () => {
      const allQueues = await queuesApi.getAll();
      if (allQueues.data.data.length > 0) {
        const queueId = allQueues.data.data[0].id;
        const response = await queuesApi.getById(queueId);
        expect(response.data.id).toBe(queueId);
      }
    });

    it('should return 404 for non-existent queue', async () => {
      try {
        await queuesApi.getById('non-existent-id');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should create a new queue', async () => {
      const newQueue = {
        name: 'new.test.queue',
        vhost: '/',
        type: 'classic' as const,
        durable: true,
      };
      const response = await queuesApi.create(newQueue);
      expect(response.data.name).toBe('new.test.queue');
      expect(response.status).toBe(201);
    });

    it('should update a queue', async () => {
      const allQueues = await queuesApi.getAll();
      if (allQueues.data.data.length > 0) {
        const queueId = allQueues.data.data[0].id;
        const response = await queuesApi.update(queueId, { state: 'idle' });
        expect(response.data.id).toBe(queueId);
      }
    });

    it('should delete a queue', async () => {
      const newQueue = await queuesApi.create({ name: 'to.delete' });
      const response = await queuesApi.delete(newQueue.data.id);
      expect(response.status).toBe(204);
    });

    it('should purge a queue', async () => {
      const allQueues = await queuesApi.getAll();
      if (allQueues.data.data.length > 0) {
        const queueId = allQueues.data.data[0].id;
        const response = await queuesApi.purge(queueId);
        expect(response.data.messagesDeleted).toBeDefined();
      }
    });

    it('should fetch queue messages', async () => {
      const allQueues = await queuesApi.getAll();
      if (allQueues.data.data.length > 0) {
        const queueId = allQueues.data.data[0].id;
        const response = await queuesApi.getMessages(queueId, { count: 5 });
        expect(Array.isArray(response.data)).toBe(true);
      }
    });

    it('should fetch queue consumers', async () => {
      const allQueues = await queuesApi.getAll();
      if (allQueues.data.data.length > 0) {
        const queueId = allQueues.data.data[0].id;
        const response = await queuesApi.getConsumers(queueId);
        expect(Array.isArray(response.data)).toBe(true);
      }
    });

    it('should handle empty queue list', async () => {
      server.use(
        http.get('/api/queue-manager/queues', () => {
          return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 });
        })
      );
      const response = await queuesApi.getAll();
      expect(response.data.data).toHaveLength(0);
    });

    it('should handle server error gracefully', async () => {
      server.use(
        http.get('/api/queue-manager/queues', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      try {
        await queuesApi.getAll();
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });

    it('should create queue with arguments', async () => {
      const response = await queuesApi.create({
        name: 'queue.with.args',
        arguments: { 'x-message-ttl': 60000 },
      });
      expect(response.data.name).toBe('queue.with.args');
    });

    it('should create quorum queue', async () => {
      const response = await queuesApi.create({
        name: 'quorum.queue',
        type: 'quorum',
      });
      expect(response.data.type).toBe('quorum');
    });
  });

  // ==========================================================================
  // EXCHANGES API TESTS (10 tests)
  // ==========================================================================
  describe('Exchanges API', () => {
    it('should fetch all exchanges', async () => {
      const response = await exchangesApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch exchanges filtered by type', async () => {
      const response = await exchangesApi.getAll({ type: 'direct' });
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch an exchange by ID', async () => {
      const allExchanges = await exchangesApi.getAll();
      if (allExchanges.data.length > 0) {
        const exchangeId = allExchanges.data[0].id;
        const response = await exchangesApi.getById(exchangeId);
        expect(response.data.id).toBe(exchangeId);
      }
    });

    it('should create a new exchange', async () => {
      const response = await exchangesApi.create({
        name: 'new.exchange',
        type: 'topic',
        durable: true,
      });
      expect(response.data.name).toBe('new.exchange');
      expect(response.status).toBe(201);
    });

    it('should delete an exchange', async () => {
      const newExchange = await exchangesApi.create({ name: 'to.delete.exchange' });
      const response = await exchangesApi.delete(newExchange.data.id);
      expect(response.status).toBe(204);
    });

    it('should publish a message to an exchange', async () => {
      const allExchanges = await exchangesApi.getAll();
      if (allExchanges.data.length > 0) {
        const exchangeId = allExchanges.data[0].id;
        const response = await exchangesApi.publish(exchangeId, {
          exchangeName: allExchanges.data[0].name,
          routingKey: 'test.key',
          payload: '{"test": true}',
          contentType: 'application/json',
        });
        expect(response.data.routed).toBeDefined();
      }
    });

    it('should create fanout exchange', async () => {
      const response = await exchangesApi.create({
        name: 'fanout.exchange',
        type: 'fanout',
      });
      expect(response.data.type).toBe('fanout');
    });

    it('should create headers exchange', async () => {
      const response = await exchangesApi.create({
        name: 'headers.exchange',
        type: 'headers',
      });
      expect(response.data.type).toBe('headers');
    });

    it('should create internal exchange', async () => {
      const response = await exchangesApi.create({
        name: 'internal.exchange',
        internal: true,
      });
      expect(response.data.internal).toBe(true);
    });

    it('should return 404 for non-existent exchange', async () => {
      try {
        await exchangesApi.getById('non-existent');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  // ==========================================================================
  // BINDINGS API TESTS (6 tests)
  // ==========================================================================
  describe('Bindings API', () => {
    it('should fetch all bindings', async () => {
      const response = await bindingsApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch bindings filtered by vhost', async () => {
      const response = await bindingsApi.getAll({ vhost: '/' });
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create a new binding', async () => {
      const response = await bindingsApi.create({
        source: 'test-exchange',
        destination: 'test-queue',
        routingKey: 'test.#',
      });
      expect(response.data.source).toBe('test-exchange');
      expect(response.status).toBe(201);
    });

    it('should delete a binding', async () => {
      const newBinding = await bindingsApi.create({
        source: 'ex',
        destination: 'q',
        routingKey: 'key',
      });
      const response = await bindingsApi.delete(newBinding.data.id);
      expect(response.status).toBe(204);
    });

    it('should create binding with arguments', async () => {
      const response = await bindingsApi.create({
        source: 'headers-exchange',
        destination: 'queue',
        routingKey: '',
        arguments: { 'x-match': 'all', 'type': 'report' },
      });
      expect(response.data.arguments).toHaveProperty('x-match');
    });

    it('should create exchange-to-exchange binding', async () => {
      const response = await bindingsApi.create({
        source: 'source-exchange',
        destination: 'dest-exchange',
        destinationType: 'exchange',
        routingKey: 'route',
      });
      expect(response.data.destinationType).toBe('exchange');
    });
  });

  // ==========================================================================
  // CONNECTIONS API TESTS (6 tests)
  // ==========================================================================
  describe('Connections API', () => {
    it('should fetch all connections', async () => {
      const response = await connectionsApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch a connection by ID', async () => {
      const allConnections = await connectionsApi.getAll();
      if (allConnections.data.length > 0) {
        const connId = allConnections.data[0].id;
        const response = await connectionsApi.getById(connId);
        expect(response.data.id).toBe(connId);
      }
    });

    it('should close a connection', async () => {
      const allConnections = await connectionsApi.getAll();
      if (allConnections.data.length > 0) {
        const connId = allConnections.data[0].id;
        const response = await connectionsApi.close(connId);
        expect(response.status).toBe(204);
      }
    });

    it('should return 404 for non-existent connection', async () => {
      try {
        await connectionsApi.getById('non-existent');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should handle connection list filtering', async () => {
      const response = await connectionsApi.getAll({ vhost: '/' });
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should close connection with reason', async () => {
      const allConnections = await connectionsApi.getAll();
      if (allConnections.data.length > 0) {
        const connId = allConnections.data[0].id;
        const response = await connectionsApi.close(connId, 'maintenance');
        expect(response.status).toBe(204);
      }
    });
  });

  // ==========================================================================
  // CONSUMERS API TESTS (4 tests)
  // ==========================================================================
  describe('Consumers API', () => {
    it('should fetch all consumers', async () => {
      const response = await consumersApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch consumers filtered by queue', async () => {
      const response = await consumersApi.getAll({ queueName: 'orders.processing' });
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should cancel a consumer', async () => {
      const allConsumers = await consumersApi.getAll();
      if (allConsumers.data.length > 0) {
        const consumerId = allConsumers.data[0].id;
        const response = await consumersApi.cancel(consumerId);
        expect(response.status).toBe(204);
      }
    });

    it('should return 404 for non-existent consumer', async () => {
      try {
        await consumersApi.cancel('non-existent');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  // ==========================================================================
  // MESSAGES API TESTS (4 tests)
  // ==========================================================================
  describe('Messages API', () => {
    it('should browse messages in a queue', async () => {
      const allQueues = await queuesApi.getAll();
      if (allQueues.data.data.length > 0) {
        const queueId = allQueues.data.data[0].id;
        const response = await messagesApi.browse(queueId, { count: 10 });
        expect(Array.isArray(response.data)).toBe(true);
      }
    });

    it('should publish a message', async () => {
      const response = await messagesApi.publish({
        exchangeName: 'orders',
        routingKey: 'order.created',
        payload: '{"orderId": "123"}',
        contentType: 'application/json',
      });
      expect(response.data.messageId).toBeDefined();
      expect(response.data.routed).toBe(true);
    });

    it('should publish message with headers', async () => {
      const response = await messagesApi.publish({
        exchangeName: 'orders',
        routingKey: 'order.created',
        payload: '{"data": "test"}',
        contentType: 'application/json',
        headers: { 'x-trace-id': '12345' },
      });
      expect(response.data.routed).toBe(true);
    });

    it('should browse messages with offset', async () => {
      const allQueues = await queuesApi.getAll();
      if (allQueues.data.data.length > 0) {
        const queueId = allQueues.data.data[0].id;
        const response = await messagesApi.browse(queueId, { count: 5, offset: 5 });
        expect(Array.isArray(response.data)).toBe(true);
      }
    });
  });

  // ==========================================================================
  // VIRTUAL HOSTS API TESTS (4 tests)
  // ==========================================================================
  describe('Virtual Hosts API', () => {
    it('should fetch all virtual hosts', async () => {
      const response = await vhostsApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create a virtual host', async () => {
      const response = await vhostsApi.create({ name: '/new-vhost' });
      expect(response.data.name).toBe('/new-vhost');
      expect(response.status).toBe(201);
    });

    it('should delete a virtual host', async () => {
      const newVhost = await vhostsApi.create({ name: '/to-delete' });
      const response = await vhostsApi.delete(newVhost.data.id);
      expect(response.status).toBe(204);
    });

    it('should create vhost with tracing enabled', async () => {
      const response = await vhostsApi.create({
        name: '/traced-vhost',
        tracingEnabled: true,
      });
      expect(response.data.tracingEnabled).toBe(true);
    });
  });

  // ==========================================================================
  // USERS API TESTS (4 tests)
  // ==========================================================================
  describe('Users API', () => {
    it('should fetch all users', async () => {
      const response = await queueUsersApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create a user', async () => {
      const response = await queueUsersApi.create({
        username: 'newuser',
        password: 'password123',
        tags: ['monitoring'],
      });
      expect(response.data.username).toBe('newuser');
      expect(response.status).toBe(201);
    });

    it('should delete a user', async () => {
      const newUser = await queueUsersApi.create({ username: 'todelete', password: 'pass' });
      const response = await queueUsersApi.delete(newUser.data.id);
      expect(response.status).toBe(204);
    });

    it('should create user with admin tags', async () => {
      const response = await queueUsersApi.create({
        username: 'adminuser',
        password: 'password',
        tags: ['administrator', 'monitoring', 'policymaker'],
      });
      expect(response.data.tags).toContain('administrator');
    });
  });

  // ==========================================================================
  // PERMISSIONS API TESTS (4 tests)
  // ==========================================================================
  describe('Permissions API', () => {
    it('should fetch all permissions', async () => {
      const response = await permissionsApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create a permission', async () => {
      const response = await permissionsApi.create({
        userId: 'user-1',
        vhost: '/',
        configure: '.*',
        write: '.*',
        read: '.*',
      });
      expect(response.data.configure).toBe('.*');
      expect(response.status).toBe(201);
    });

    it('should delete a permission', async () => {
      const newPerm = await permissionsApi.create({
        userId: 'user-1',
        vhost: '/test',
        configure: '',
        write: '',
        read: '.*',
      });
      const response = await permissionsApi.delete(newPerm.data.id);
      expect(response.status).toBe(204);
    });

    it('should create read-only permission', async () => {
      const response = await permissionsApi.create({
        userId: 'user-readonly',
        vhost: '/',
        configure: '',
        write: '',
        read: '.*',
      });
      expect(response.data.configure).toBe('');
      expect(response.data.write).toBe('');
    });
  });

  // ==========================================================================
  // POLICIES API TESTS (4 tests)
  // ==========================================================================
  describe('Policies API', () => {
    it('should fetch all policies', async () => {
      const response = await policiesApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create a policy', async () => {
      const response = await policiesApi.create({
        name: 'new-policy',
        pattern: '^temp\\..*',
        applyTo: 'queues',
        definition: { 'message-ttl': 3600000 },
      });
      expect(response.data.name).toBe('new-policy');
      expect(response.status).toBe(201);
    });

    it('should delete a policy', async () => {
      const newPolicy = await policiesApi.create({ name: 'to-delete-policy' });
      const response = await policiesApi.delete(newPolicy.data.id);
      expect(response.status).toBe(204);
    });

    it('should create HA policy', async () => {
      const response = await policiesApi.create({
        name: 'ha-policy',
        pattern: '.*',
        applyTo: 'queues',
        definition: { 'ha-mode': 'all', 'ha-sync-mode': 'automatic' },
      });
      expect(response.data.definition['ha-mode']).toBe('all');
    });
  });

  // ==========================================================================
  // ALERTS API TESTS (5 tests)
  // ==========================================================================
  describe('Alerts API', () => {
    it('should fetch all alerts', async () => {
      const response = await alertsApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch alerts filtered by status', async () => {
      const response = await alertsApi.getAll({ status: 'active' });
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch alerts filtered by severity', async () => {
      const response = await alertsApi.getAll({ severity: 'critical' });
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should acknowledge an alert', async () => {
      const allAlerts = await alertsApi.getAll();
      if (allAlerts.data.length > 0) {
        const alertId = allAlerts.data[0].id;
        const response = await alertsApi.acknowledge(alertId, 'admin');
        expect(response.data.status).toBe('acknowledged');
      }
    });

    it('should dismiss an alert', async () => {
      const allAlerts = await alertsApi.getAll();
      if (allAlerts.data.length > 0) {
        const alertId = allAlerts.data[0].id;
        const response = await alertsApi.dismiss(alertId);
        expect(response.status).toBe(204);
      }
    });
  });

  // ==========================================================================
  // ALERT RULES API TESTS (4 tests)
  // ==========================================================================
  describe('Alert Rules API', () => {
    it('should fetch all alert rules', async () => {
      const response = await alertRulesApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should create an alert rule', async () => {
      const response = await alertRulesApi.create({
        name: 'New Alert Rule',
        metric: 'queue_messages',
        operator: '>',
        threshold: 10000,
        severity: 'warning',
      });
      expect(response.data.name).toBe('New Alert Rule');
      expect(response.status).toBe(201);
    });

    it('should delete an alert rule', async () => {
      const newRule = await alertRulesApi.create({ name: 'To Delete Rule' });
      const response = await alertRulesApi.delete(newRule.data.id);
      expect(response.status).toBe(204);
    });

    it('should create rule with notification channels', async () => {
      const response = await alertRulesApi.create({
        name: 'Rule with Notifications',
        metric: 'memory_percent',
        threshold: 90,
        notificationChannels: ['email', 'slack', 'pagerduty'],
      });
      expect(response.data.notificationChannels).toContain('slack');
    });
  });

  // ==========================================================================
  // METRICS API TESTS (4 tests)
  // ==========================================================================
  describe('Metrics API', () => {
    it('should fetch current system metrics', async () => {
      const response = await metricsApi.getCurrent();
      expect(response.data.memoryUsed).toBeDefined();
      expect(response.data.diskFree).toBeDefined();
    });

    it('should fetch cluster nodes', async () => {
      const response = await metricsApi.getNodes();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch overview stats', async () => {
      const response = await metricsApi.getOverview();
      expect(response.data.queues).toBeDefined();
      expect(response.data.exchanges).toBeDefined();
      expect(response.data.connections).toBeDefined();
    });

    it('should include message rates in overview', async () => {
      const response = await metricsApi.getOverview();
      expect(response.data.rates).toBeDefined();
      expect(response.data.rates.publish).toBeDefined();
    });
  });

  // ==========================================================================
  // API ENDPOINTS API TESTS (8 tests)
  // ==========================================================================
  describe('API Endpoints API', () => {
    it('should fetch all API endpoints', async () => {
      const response = await apiEndpointsApi.getAll();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch an API endpoint by ID', async () => {
      const allEndpoints = await apiEndpointsApi.getAll();
      if (allEndpoints.data.length > 0) {
        const endpointId = allEndpoints.data[0].id;
        const response = await apiEndpointsApi.getById(endpointId);
        expect(response.data.id).toBe(endpointId);
      }
    });

    it('should create an API endpoint', async () => {
      const response = await apiEndpointsApi.create({
        name: 'New API Endpoint',
        path: '/api/v1/new',
        method: 'POST',
        authMethod: 'bearer',
      });
      expect(response.data.name).toBe('New API Endpoint');
      expect(response.status).toBe(201);
    });

    it('should update an API endpoint', async () => {
      const newEndpoint = await apiEndpointsApi.create({
        name: 'Endpoint to Update',
        path: '/api/v1/update',
        method: 'POST',
      });
      const response = await apiEndpointsApi.update(newEndpoint.data.id, {
        status: 'disabled',
      });
      expect(response.data.status).toBe('disabled');
    });

    it('should delete an API endpoint', async () => {
      const newEndpoint = await apiEndpointsApi.create({ name: 'To Delete' });
      const response = await apiEndpointsApi.delete(newEndpoint.data.id);
      expect(response.status).toBe(204);
    });

    it('should regenerate credentials', async () => {
      const allEndpoints = await apiEndpointsApi.getAll();
      if (allEndpoints.data.length > 0) {
        const endpointId = allEndpoints.data[0].id;
        const response = await apiEndpointsApi.regenerateCredentials(endpointId);
        expect(response.data).toBeDefined();
      }
    });

    it('should test an endpoint', async () => {
      const allEndpoints = await apiEndpointsApi.getAll();
      if (allEndpoints.data.length > 0) {
        const endpointId = allEndpoints.data[0].id;
        const response = await apiEndpointsApi.test(endpointId);
        expect(response.data.success).toBeDefined();
        expect(response.data.latency).toBeDefined();
      }
    });

    it('should create endpoint with rate limiting', async () => {
      const response = await apiEndpointsApi.create({
        name: 'Rate Limited Endpoint',
        path: '/api/v1/limited',
        method: 'POST',
        rateLimit: { requestsPerMinute: 100, burstSize: 10 },
      });
      expect(response.data.rateLimit.requestsPerMinute).toBe(100);
    });
  });

  // ==========================================================================
  // TOPOLOGY API TESTS (3 tests)
  // ==========================================================================
  describe('Topology API', () => {
    it('should fetch topology graph', async () => {
      const response = await topologyApi.getGraph('/');
      expect(response.data.exchanges).toBeDefined();
      expect(response.data.queues).toBeDefined();
      expect(response.data.bindings).toBeDefined();
    });

    it('should export topology', async () => {
      const response = await topologyApi.export('/', 'json');
      expect(response.data).toBeDefined();
    });

    it('should include all topology elements', async () => {
      const response = await topologyApi.getGraph('/');
      expect(Array.isArray(response.data.exchanges)).toBe(true);
      expect(Array.isArray(response.data.queues)).toBe(true);
      expect(Array.isArray(response.data.bindings)).toBe(true);
    });
  });
});
