/**
 * Queue Manager Utility Tests
 * Tests for utility functions, helpers, and type validations
 */

import { describe, it, expect } from 'vitest';
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
} from '../types';
import type { ApiEndpoint, AuthMethod } from '../types/api-endpoints';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatRate(rate: number): string {
  if (rate < 1) return `${(rate * 1000).toFixed(0)}/s`;
  if (rate >= 1000) return `${(rate / 1000).toFixed(1)}k/s`;
  return `${rate.toFixed(0)}/s`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function parseRoutingKey(key: string): { segments: string[], hasWildcard: boolean } {
  const segments = key.split('.');
  const hasWildcard = segments.some(s => s === '*' || s === '#');
  return { segments, hasWildcard };
}

function matchRoutingKey(pattern: string, key: string): boolean {
  const patternParts = pattern.split('.');
  const keyParts = key.split('.');

  let pi = 0, ki = 0;
  while (pi < patternParts.length && ki < keyParts.length) {
    if (patternParts[pi] === '#') {
      if (pi === patternParts.length - 1) return true;
      pi++;
      while (ki < keyParts.length && keyParts[ki] !== patternParts[pi]) ki++;
    } else if (patternParts[pi] === '*' || patternParts[pi] === keyParts[ki]) {
      pi++;
      ki++;
    } else {
      return false;
    }
  }
  return pi === patternParts.length && ki === keyParts.length;
}

function calculateHealthScore(queue: Partial<Queue>): number {
  let score = 100;

  // Deduct for high message count
  if ((queue.messagesReady || 0) > 10000) score -= 20;
  else if ((queue.messagesReady || 0) > 5000) score -= 10;

  // Deduct for high unacked messages
  if ((queue.messagesUnacked || 0) > 1000) score -= 15;
  else if ((queue.messagesUnacked || 0) > 500) score -= 5;

  // Deduct for no consumers
  if ((queue.consumers || 0) === 0) score -= 25;

  // Deduct for imbalanced rates
  if ((queue.publishRate || 0) > (queue.deliverRate || 0) * 2) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function validateQueueName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Queue name is required' };
  }
  if (name.length > 255) {
    return { valid: false, error: 'Queue name must be 255 characters or less' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return { valid: false, error: 'Queue name contains invalid characters' };
  }
  return { valid: true };
}

function validateExchangeName(name: string): { valid: boolean; error?: string } {
  if (name.startsWith('amq.') && !['amq.direct', 'amq.fanout', 'amq.topic', 'amq.headers'].includes(name)) {
    return { valid: false, error: 'Exchange names starting with "amq." are reserved' };
  }
  if (name.length > 255) {
    return { valid: false, error: 'Exchange name must be 255 characters or less' };
  }
  return { valid: true };
}

function generateRoutingKeyPattern(exchangeType: string, baseKey: string): string {
  switch (exchangeType) {
    case 'direct':
      return baseKey;
    case 'topic':
      return `${baseKey}.#`;
    case 'fanout':
      return '';
    case 'headers':
      return '';
    default:
      return baseKey;
  }
}

function calculateMemoryPercentage(metrics: Partial<SystemMetrics>): number {
  if (!metrics.memoryUsed || !metrics.memoryLimit) return 0;
  return (metrics.memoryUsed / metrics.memoryLimit) * 100;
}

function isSlowConsumer(consumer: Partial<Consumer>): boolean {
  const ackRate = consumer.ackRate || 0;
  const deliverRate = consumer.deliverRate || 0;
  const avgProcessingTime = consumer.avgProcessingTime || 0;

  if (avgProcessingTime > 1000) return true;
  if (deliverRate > 0 && ackRate < deliverRate * 0.7) return true;
  return false;
}

function parseMessagePayload(payload: string, contentType: string): unknown {
  try {
    if (contentType === 'application/json') {
      return JSON.parse(payload);
    }
    return payload;
  } catch {
    return payload;
  }
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'ak_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'tok_';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function isValidIPRange(ip: string): boolean {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return cidrRegex.test(ip) || ipRegex.test(ip);
}

function calculateRateLimit(requestsPerMinute: number, burstSize: number): { tokensPerSecond: number; maxBurst: number } {
  return {
    tokensPerSecond: requestsPerMinute / 60,
    maxBurst: burstSize,
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe('Queue Manager Utilities', () => {
  // ==========================================================================
  // FORMAT UTILITIES (10 tests)
  // ==========================================================================
  describe('Format Utilities', () => {
    describe('formatBytes', () => {
      it('should format 0 bytes', () => {
        expect(formatBytes(0)).toBe('0 B');
      });

      it('should format bytes', () => {
        expect(formatBytes(500)).toBe('500 B');
      });

      it('should format kilobytes', () => {
        expect(formatBytes(1024)).toBe('1 KB');
      });

      it('should format megabytes', () => {
        expect(formatBytes(1048576)).toBe('1 MB');
      });

      it('should format gigabytes', () => {
        expect(formatBytes(1073741824)).toBe('1 GB');
      });

      it('should format with decimals', () => {
        expect(formatBytes(1536)).toBe('1.5 KB');
      });
    });

    describe('formatRate', () => {
      it('should format low rates', () => {
        expect(formatRate(0.5)).toBe('500/s');
      });

      it('should format normal rates', () => {
        expect(formatRate(100)).toBe('100/s');
      });

      it('should format high rates', () => {
        expect(formatRate(5000)).toBe('5k/s');
      });
    });

    describe('formatUptime', () => {
      it('should format minutes', () => {
        expect(formatUptime(300)).toBe('5m');
      });

      it('should format hours', () => {
        expect(formatUptime(7200)).toBe('2h 0m');
      });

      it('should format days', () => {
        expect(formatUptime(172800)).toBe('2d 0h');
      });
    });
  });

  // ==========================================================================
  // ROUTING KEY UTILITIES (8 tests)
  // ==========================================================================
  describe('Routing Key Utilities', () => {
    describe('parseRoutingKey', () => {
      it('should parse simple key', () => {
        const result = parseRoutingKey('order.created');
        expect(result.segments).toHaveLength(2);
        expect(result.hasWildcard).toBe(false);
      });

      it('should detect * wildcard', () => {
        const result = parseRoutingKey('order.*');
        expect(result.hasWildcard).toBe(true);
      });

      it('should detect # wildcard', () => {
        const result = parseRoutingKey('order.#');
        expect(result.hasWildcard).toBe(true);
      });

      it('should parse multi-segment key', () => {
        const result = parseRoutingKey('app.order.created.v1');
        expect(result.segments).toHaveLength(4);
      });
    });

    describe('matchRoutingKey', () => {
      it('should match exact keys', () => {
        expect(matchRoutingKey('order.created', 'order.created')).toBe(true);
      });

      it('should not match different keys', () => {
        expect(matchRoutingKey('order.created', 'order.deleted')).toBe(false);
      });

      it('should match * wildcard', () => {
        expect(matchRoutingKey('order.*', 'order.created')).toBe(true);
      });

      it('should match # wildcard', () => {
        expect(matchRoutingKey('order.#', 'order.created.v1.test')).toBe(true);
      });
    });

    describe('generateRoutingKeyPattern', () => {
      it('should generate direct pattern', () => {
        expect(generateRoutingKeyPattern('direct', 'key')).toBe('key');
      });

      it('should generate topic pattern', () => {
        expect(generateRoutingKeyPattern('topic', 'key')).toBe('key.#');
      });

      it('should generate empty fanout pattern', () => {
        expect(generateRoutingKeyPattern('fanout', 'key')).toBe('');
      });
    });
  });

  // ==========================================================================
  // VALIDATION UTILITIES (12 tests)
  // ==========================================================================
  describe('Validation Utilities', () => {
    describe('validateQueueName', () => {
      it('should validate correct name', () => {
        expect(validateQueueName('orders.processing')).toEqual({ valid: true });
      });

      it('should reject empty name', () => {
        const result = validateQueueName('');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('required');
      });

      it('should reject name with spaces', () => {
        const result = validateQueueName('invalid name');
        expect(result.valid).toBe(false);
      });

      it('should accept name with dots', () => {
        expect(validateQueueName('app.orders.created')).toEqual({ valid: true });
      });

      it('should accept name with hyphens', () => {
        expect(validateQueueName('order-queue')).toEqual({ valid: true });
      });

      it('should accept name with underscores', () => {
        expect(validateQueueName('order_queue')).toEqual({ valid: true });
      });
    });

    describe('validateExchangeName', () => {
      it('should validate correct name', () => {
        expect(validateExchangeName('orders')).toEqual({ valid: true });
      });

      it('should allow reserved amq. names', () => {
        expect(validateExchangeName('amq.direct')).toEqual({ valid: true });
      });

      it('should reject custom amq. names', () => {
        const result = validateExchangeName('amq.custom');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('reserved');
      });
    });

    describe('isValidIPRange', () => {
      it('should validate IP address', () => {
        expect(isValidIPRange('192.168.1.1')).toBe(true);
      });

      it('should validate CIDR range', () => {
        expect(isValidIPRange('10.0.0.0/8')).toBe(true);
      });

      it('should reject invalid IP', () => {
        expect(isValidIPRange('invalid')).toBe(false);
      });
    });
  });

  // ==========================================================================
  // HEALTH SCORE UTILITIES (6 tests)
  // ==========================================================================
  describe('Health Score Utilities', () => {
    describe('calculateHealthScore', () => {
      it('should return 100 for healthy queue', () => {
        const score = calculateHealthScore({
          messagesReady: 100,
          messagesUnacked: 10,
          consumers: 5,
          publishRate: 50,
          deliverRate: 50,
        });
        expect(score).toBe(100);
      });

      it('should deduct for high message count', () => {
        const score = calculateHealthScore({
          messagesReady: 12000,
          consumers: 5,
        });
        expect(score).toBeLessThan(100);
      });

      it('should deduct for no consumers', () => {
        const score = calculateHealthScore({
          messagesReady: 100,
          consumers: 0,
        });
        expect(score).toBeLessThan(100);
      });

      it('should deduct for high unacked messages', () => {
        const score = calculateHealthScore({
          messagesUnacked: 1500,
          consumers: 5,
        });
        expect(score).toBeLessThan(100);
      });

      it('should never go below 0', () => {
        const score = calculateHealthScore({
          messagesReady: 100000,
          messagesUnacked: 10000,
          consumers: 0,
          publishRate: 10000,
          deliverRate: 10,
        });
        expect(score).toBeGreaterThanOrEqual(0);
      });

      it('should never exceed 100', () => {
        const score = calculateHealthScore({
          messagesReady: 0,
          messagesUnacked: 0,
          consumers: 100,
        });
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  // ==========================================================================
  // CONSUMER UTILITIES (4 tests)
  // ==========================================================================
  describe('Consumer Utilities', () => {
    describe('isSlowConsumer', () => {
      it('should detect slow consumer by processing time', () => {
        expect(isSlowConsumer({ avgProcessingTime: 2000 })).toBe(true);
      });

      it('should detect slow consumer by ack rate', () => {
        expect(isSlowConsumer({ ackRate: 10, deliverRate: 100 })).toBe(true);
      });

      it('should not flag healthy consumer', () => {
        expect(isSlowConsumer({ ackRate: 95, deliverRate: 100, avgProcessingTime: 50 })).toBe(false);
      });

      it('should handle zero rates', () => {
        expect(isSlowConsumer({ ackRate: 0, deliverRate: 0, avgProcessingTime: 0 })).toBe(false);
      });
    });
  });

  // ==========================================================================
  // METRICS UTILITIES (4 tests)
  // ==========================================================================
  describe('Metrics Utilities', () => {
    describe('calculateMemoryPercentage', () => {
      it('should calculate percentage correctly', () => {
        expect(calculateMemoryPercentage({
          memoryUsed: 500000000,
          memoryLimit: 1000000000,
        })).toBe(50);
      });

      it('should return 0 for missing data', () => {
        expect(calculateMemoryPercentage({})).toBe(0);
      });

      it('should handle full memory', () => {
        expect(calculateMemoryPercentage({
          memoryUsed: 1000000000,
          memoryLimit: 1000000000,
        })).toBe(100);
      });

      it('should handle empty memory', () => {
        expect(calculateMemoryPercentage({
          memoryUsed: 0,
          memoryLimit: 1000000000,
        })).toBe(0);
      });
    });
  });

  // ==========================================================================
  // MESSAGE UTILITIES (4 tests)
  // ==========================================================================
  describe('Message Utilities', () => {
    describe('parseMessagePayload', () => {
      it('should parse JSON payload', () => {
        const result = parseMessagePayload('{"key":"value"}', 'application/json');
        expect(result).toEqual({ key: 'value' });
      });

      it('should return string for plain text', () => {
        const result = parseMessagePayload('Hello World', 'text/plain');
        expect(result).toBe('Hello World');
      });

      it('should handle invalid JSON gracefully', () => {
        const result = parseMessagePayload('not json', 'application/json');
        expect(result).toBe('not json');
      });

      it('should handle empty payload', () => {
        const result = parseMessagePayload('', 'application/json');
        expect(result).toBe('');
      });
    });
  });

  // ==========================================================================
  // API KEY UTILITIES (6 tests)
  // ==========================================================================
  describe('API Key Utilities', () => {
    describe('generateApiKey', () => {
      it('should start with ak_ prefix', () => {
        const key = generateApiKey();
        expect(key.startsWith('ak_')).toBe(true);
      });

      it('should be 35 characters long', () => {
        const key = generateApiKey();
        expect(key.length).toBe(35); // 'ak_' + 32 chars
      });

      it('should generate unique keys', () => {
        const keys = new Set<string>();
        for (let i = 0; i < 100; i++) {
          keys.add(generateApiKey());
        }
        expect(keys.size).toBe(100);
      });
    });

    describe('generateToken', () => {
      it('should start with tok_ prefix', () => {
        const token = generateToken();
        expect(token.startsWith('tok_')).toBe(true);
      });

      it('should be 52 characters long', () => {
        const token = generateToken();
        expect(token.length).toBe(52); // 'tok_' + 48 chars
      });

      it('should generate unique tokens', () => {
        const tokens = new Set<string>();
        for (let i = 0; i < 100; i++) {
          tokens.add(generateToken());
        }
        expect(tokens.size).toBe(100);
      });
    });
  });

  // ==========================================================================
  // RATE LIMIT UTILITIES (4 tests)
  // ==========================================================================
  describe('Rate Limit Utilities', () => {
    describe('calculateRateLimit', () => {
      it('should calculate tokens per second', () => {
        const result = calculateRateLimit(600, 10);
        expect(result.tokensPerSecond).toBe(10);
      });

      it('should preserve burst size', () => {
        const result = calculateRateLimit(1000, 100);
        expect(result.maxBurst).toBe(100);
      });

      it('should handle high rates', () => {
        const result = calculateRateLimit(60000, 1000);
        expect(result.tokensPerSecond).toBe(1000);
      });

      it('should handle low rates', () => {
        const result = calculateRateLimit(6, 1);
        expect(result.tokensPerSecond).toBe(0.1);
      });
    });
  });

  // ==========================================================================
  // TYPE VALIDATION TESTS (12 tests)
  // ==========================================================================
  describe('Type Validations', () => {
    describe('Queue Type', () => {
      it('should accept valid queue object', () => {
        const queue: Queue = {
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
        };
        expect(queue.type).toBe('classic');
      });

      it('should accept quorum type', () => {
        const queue: Queue = {
          id: 'q-1',
          name: 'test.queue',
          vhost: '/',
          type: 'quorum',
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
        expect(queue.type).toBe('quorum');
      });
    });

    describe('Exchange Type', () => {
      it('should accept valid exchange types', () => {
        const types: Exchange['type'][] = ['direct', 'fanout', 'topic', 'headers'];
        types.forEach((type) => {
          const exchange: Exchange = {
            id: 'ex-1',
            name: 'test',
            vhost: '/',
            type,
            durable: true,
            autoDelete: false,
            internal: false,
            arguments: {},
            messagesIn: 0,
            messagesOut: 0,
            publishRate: 0,
          };
          expect(exchange.type).toBe(type);
        });
      });
    });

    describe('Alert Severity', () => {
      it('should accept valid severity levels', () => {
        const severities: Alert['severity'][] = ['critical', 'error', 'warning', 'info'];
        severities.forEach((severity) => {
          const alert: Alert = {
            id: 'a-1',
            ruleId: 'r-1',
            ruleName: 'Test',
            severity,
            status: 'active',
            message: 'Test',
            targetType: 'queue',
            targetName: 'test',
            currentValue: 0,
            threshold: 0,
            triggeredAt: new Date().toISOString(),
          };
          expect(alert.severity).toBe(severity);
        });
      });
    });

    describe('Auth Methods', () => {
      it('should accept valid auth methods', () => {
        const methods: AuthMethod[] = ['bearer', 'api-key', 'basic', 'ssh', 'oauth2', 'hmac', 'mtls'];
        methods.forEach((method) => {
          const endpoint: ApiEndpoint = {
            id: 'ep-1',
            name: 'Test',
            path: '/api/test',
            method: 'POST',
            description: '',
            authMethod: method,
            status: 'active',
            rateLimit: { requestsPerMinute: 100, burstSize: 10 },
            permissions: [],
            allowedIps: [],
            createdAt: new Date().toISOString(),
            requestCount: 0,
          };
          expect(endpoint.authMethod).toBe(method);
        });
      });
    });

    describe('Connection State', () => {
      it('should accept running state', () => {
        const conn: Partial<Connection> = { state: 'running' };
        expect(conn.state).toBe('running');
      });

      it('should accept blocked state', () => {
        const conn: Partial<Connection> = { state: 'blocked' };
        expect(conn.state).toBe('blocked');
      });
    });

    describe('Binding Types', () => {
      it('should accept queue destination', () => {
        const binding: Binding = {
          id: 'b-1',
          source: 'exchange',
          sourceType: 'exchange',
          destination: 'queue',
          destinationType: 'queue',
          routingKey: '',
          arguments: {},
          vhost: '/',
        };
        expect(binding.destinationType).toBe('queue');
      });

      it('should accept exchange destination', () => {
        const binding: Binding = {
          id: 'b-1',
          source: 'exchange1',
          sourceType: 'exchange',
          destination: 'exchange2',
          destinationType: 'exchange',
          routingKey: '',
          arguments: {},
          vhost: '/',
        };
        expect(binding.destinationType).toBe('exchange');
      });
    });

    describe('ClusterNode Type', () => {
      it('should accept disc node type', () => {
        const node: ClusterNode = {
          id: 'n-1',
          name: 'rabbit@node1',
          type: 'disc',
          running: true,
          memoryUsed: 0,
          diskFree: 0,
          fdUsed: 0,
          uptime: 0,
          version: '3.12.0',
        };
        expect(node.type).toBe('disc');
      });

      it('should accept ram node type', () => {
        const node: ClusterNode = {
          id: 'n-1',
          name: 'rabbit@node1',
          type: 'ram',
          running: true,
          memoryUsed: 0,
          diskFree: 0,
          fdUsed: 0,
          uptime: 0,
          version: '3.12.0',
        };
        expect(node.type).toBe('ram');
      });
    });
  });
});
