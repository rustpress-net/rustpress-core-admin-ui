/**
 * API Endpoints Types
 * Support for SSH, Bearer, Basic Auth, API Keys, and more
 */

export type AuthMethod = 'none' | 'basic' | 'bearer' | 'api-key' | 'ssh' | 'oauth2' | 'hmac' | 'mtls';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type EndpointStatus = 'active' | 'inactive' | 'rate-limited' | 'expired';

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface IPWhitelistConfig {
  enabled: boolean;
  allowedIPs: string[];
  allowedCIDRs: string[];
}

export interface ApiCredentials {
  // Basic Auth
  username?: string;
  passwordHash?: string;

  // Bearer Token
  token?: string;
  tokenPrefix?: string; // e.g., "Bearer", "Token"

  // API Key
  apiKey?: string;
  apiKeyHeader?: string; // e.g., "X-API-Key"

  // SSH
  sshPublicKey?: string;
  sshFingerprint?: string;

  // OAuth2
  clientId?: string;
  clientSecret?: string;
  tokenEndpoint?: string;
  scopes?: string[];

  // HMAC
  hmacSecret?: string;
  hmacAlgorithm?: 'sha256' | 'sha512';

  // mTLS
  clientCertificate?: string;
  clientCertificateFingerprint?: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;

  // Endpoint config
  path: string;
  methods: HttpMethod[];
  version: string;

  // Authentication
  authMethod: AuthMethod;
  credentials: ApiCredentials;

  // Security
  rateLimit: RateLimitConfig;
  ipWhitelist: IPWhitelistConfig;

  // Permissions
  allowedQueues: string[] | '*';
  allowedExchanges: string[] | '*';
  allowedOperations: EndpointOperation[];

  // Status
  status: EndpointStatus;
  expiresAt?: string;

  // Metadata
  createdAt: string;
  createdBy: string;
  lastUsedAt?: string;

  // Stats
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
}

export type EndpointOperation =
  | 'queue.list'
  | 'queue.get'
  | 'queue.create'
  | 'queue.delete'
  | 'queue.purge'
  | 'message.publish'
  | 'message.get'
  | 'message.ack'
  | 'message.nack'
  | 'exchange.list'
  | 'exchange.get'
  | 'exchange.create'
  | 'exchange.delete'
  | 'binding.list'
  | 'binding.create'
  | 'binding.delete'
  | 'connection.list'
  | 'connection.close'
  | 'consumer.list'
  | 'consumer.cancel'
  | 'metrics.read'
  | 'admin.full';

export interface ApiAccessLog {
  id: string;
  endpointId: string;
  timestamp: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  responseTime: number;
  clientIP: string;
  userAgent: string;
  requestBody?: string;
  responseBody?: string;
  error?: string;
}

export interface ApiKeyGeneration {
  prefix: string;
  length: number;
  expirationDays?: number;
  scopes: EndpointOperation[];
}

// Helper to generate secure tokens
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
};

// Helper to generate API key with prefix
export const generateApiKey = (prefix: string = 'vqm'): string => {
  const key = generateSecureToken(32);
  return `${prefix}_${key}`;
};

// Helper to encode credentials
export const encodeBasicAuth = (username: string, password: string): string => {
  return btoa(`${username}:${password}`);
};

// Operation groups for easier permission assignment
export const OPERATION_GROUPS = {
  readonly: [
    'queue.list', 'queue.get',
    'exchange.list', 'exchange.get',
    'binding.list',
    'connection.list',
    'consumer.list',
    'metrics.read',
  ] as EndpointOperation[],

  messaging: [
    'message.publish', 'message.get', 'message.ack', 'message.nack',
  ] as EndpointOperation[],

  management: [
    'queue.create', 'queue.delete', 'queue.purge',
    'exchange.create', 'exchange.delete',
    'binding.create', 'binding.delete',
    'connection.close',
    'consumer.cancel',
  ] as EndpointOperation[],

  admin: ['admin.full'] as EndpointOperation[],
};
