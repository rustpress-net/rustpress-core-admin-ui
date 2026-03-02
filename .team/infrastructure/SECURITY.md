# RustPress CMS — Security Audit Plan

**Version**: 0.4.0 (MVP)
**Date**: 2026-03-02
**Author**: Infrastructure Engineer (INFRA), Full-Stack Team
**Status**: Research & Planning — Wave 2

---

## 1. Executive Summary

This document provides a comprehensive security analysis of the RustPress CMS codebase, enumerating all existing security layers, identifying gaps, and proposing an OWASP Top 10 hardening checklist. The analysis covers both the backend (Rust/Axum) and frontend (React/TypeScript) codebases.

---

## 2. Existing Security Layers

### 2.1 Middleware Stack (12+ security-relevant layers)

The middleware stack in `crates/rustpress-server/src/app.rs` applies security layers in a specific order. The execution order (outermost to innermost):

| Order | Layer | File | Purpose |
|-------|-------|------|---------|
| 1 | Compression | `middleware.rs` | Response compression (gzip/brotli) |
| 2 | Tracing | tower-http | Request/response tracing |
| 3 | Request ID | `middleware.rs` | UUID v7 per-request correlation |
| 4 | Security Audit | `security/security_audit.rs` | Security event logging |
| 5 | Fingerprinting | `security/fingerprint.rs` | Client behavior tracking |
| 6 | Bot Detection | `security/bot_detection.rs` | Automated traffic detection |
| 7 | Request Logging | `middleware.rs` | Structured request/response logging |
| 8 | Security Headers | `middleware.rs` | HTTP security headers |
| 9 | Request Validation | `security/request_validation.rs` | Injection/XSS/traversal detection |
| 10 | Content Security | `security/content_security.rs` | JSON depth, content-type validation |
| 11 | CORS | `middleware.rs` | Cross-Origin Resource Sharing |
| 12 | Body Limit | `middleware.rs` | Request body size limit |
| 13 | API Version | `middleware.rs` | API versioning header |
| 14 | Rate Limiting | `middleware.rs` | Per-IP rate limiting |
| 15 | Tenant ID | `middleware.rs` | Multi-tenancy identification |

### 2.2 Security Headers

Implemented in `middleware.rs` via `security_headers()`:

| Header | Value | Status |
|--------|-------|--------|
| `X-Content-Type-Options` | `nosniff` | Implemented |
| `X-XSS-Protection` | `1; mode=block` | Implemented |
| `X-Frame-Options` | `SAMEORIGIN` | Implemented |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Implemented |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Implemented (enabled by default) |
| `Content-Security-Policy` | Complex policy (see below) | Implemented |
| `Permissions-Policy` | Restrictive (no camera, mic, etc.) | Implemented |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Implemented |
| `Cross-Origin-Opener-Policy` | `same-origin` | Implemented |
| `Cross-Origin-Resource-Policy` | `same-origin` | Implemented |
| `X-DNS-Prefetch-Control` | `off` | Implemented |
| `X-Download-Options` | `noopen` | Implemented |
| `X-Permitted-Cross-Domain-Policies` | `none` | Implemented |

**CSP Policy (current):**
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
img-src 'self' data: https:;
font-src 'self' data: https://cdn.jsdelivr.net;
connect-src 'self' ws: wss: https://cdn.jsdelivr.net;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
worker-src 'self' blob:
```

### 2.3 Authentication System

Located in `crates/rustpress-auth/src/`:

| Module | File | Functionality |
|--------|------|---------------|
| JWT Auth | `jwt.rs` | Access tokens (15min) + refresh tokens (7d) |
| Password | `password.rs` | Argon2id hashing |
| Refresh Tokens | `refresh_token.rs` | Secure rotation with family tracking |
| Sessions | `session.rs` | Server-side session management |
| OAuth2 Provider | `oauth2_provider.rs` | Authorization server for third-party apps |
| OAuth2 Client | `oauth2_client.rs` | Social login (Google, GitHub) |
| RBAC | `permission.rs` | Role-Based Access Control |
| Auth Middleware | `middleware.rs` | Route-level authentication |
| TOTP 2FA | `totp.rs` | Time-based OTP with recovery codes |
| WebAuthn | `webauthn.rs` | FIDO2 passwordless authentication |
| API Keys | `api_key.rs` | Machine-to-machine auth with scopes |
| Brute Force | `brute_force.rs` | Login attempt limiting (5 attempts, 15min lockout) |
| CSRF | `csrf.rs` | Token-based CSRF protection |
| IP Filter | `ip_filter.rs` | Allowlist/blocklist with CIDR support |
| Rate Limiting | `rate_limit.rs` | Per-user/IP rate limiting |
| Audit Log | `audit.rs` | Auth event logging |
| Impersonation | `impersonation.rs` | Admin impersonation with audit trail |
| Tokens | `tokens.rs` | Generic token generation/validation |

### 2.4 Request Validation

Located in `security/request_validation.rs`:

- **SQL Injection Detection**: Regex-based pattern matching on URL paths and query strings
- **XSS Detection**: Script tag and event handler pattern matching
- **Path Traversal Detection**: `../` and encoded traversal pattern blocking
- **Command Injection Detection**: Shell command pattern matching
- **Configurable**: Can block or log-only; path exclusions supported
- **Default**: All detections enabled, blocking mode enabled

### 2.5 Bot Detection

Located in `security/bot_detection.rs`:

- **User-Agent Analysis**: Pattern matching for known bot UAs
- **Timing Analysis**: Request interval tracking per IP
- **Header Anomaly Detection**: Missing/unusual header patterns
- **Allowed Bots**: Googlebot, Bingbot, DuckDuckBot, Yahoo Slurp, social crawlers
- **Suspicious Patterns**: curl, wget, python-requests, Go-http-client, Scrapy
- **Scoring**: 0-100 bot score, threshold at 70
- **Default**: Logging only (`block_bots: false`)

### 2.6 Content Security

Located in `security/content_security.rs`:

- **JSON Depth Limiting**: Max 32 levels (DoS prevention)
- **JSON Key Limiting**: Max 1000 keys per document
- **String Length Limiting**: Max 1MB per JSON string
- **Content-Type Enforcement**: Validates content-type matches body
- **Route-Specific Body Limits**: 100MB for media uploads, 10MB for API
- **Upload Type Validation**: Allowlist of MIME types (images, PDFs, video, audio)
- **Magic Byte Validation**: File content verification against declared type

### 2.7 Security Audit Logging

Located in `security/security_audit.rs`:

- **Events tracked**: Blocked requests, auth failures, authorization denials, rate limit violations, suspicious patterns, bot detections, brute force attempts, session anomalies, IP blocks, CSRF failures
- **Storage**: In-memory VecDeque (not persisted)
- **Severity levels**: Critical, High, Medium, Low, Info

### 2.8 Request Fingerprinting

Located in `security/fingerprint.rs`:

- **Header Hash**: Order and names of HTTP headers
- **Accept Hash**: Accept-* header patterns
- **User-Agent Hash**: UA string fingerprint
- **Combined Hash**: All signals merged
- **Purpose**: Client tracking, anomaly detection, session correlation

---

## 3. Security Gap Analysis

### 3.1 CRITICAL Gaps

| # | Gap | Details | Risk Level |
|---|-----|---------|------------|
| 1 | **CORS allows Any origin** | `CorsLayer::new().allow_origin(Any)` in `middleware.rs` line 199. This allows any website to make authenticated requests to the API. | CRITICAL |
| 2 | **Default JWT secret is weak** | `jwt_secret: "change-me-in-production"` in `config.rs` line 224. If unchanged, all tokens are predictable. | CRITICAL |
| 3 | **Security audit log is in-memory only** | `VecDeque` in `security_audit.rs`. Security events are lost on server restart. No persistent storage, no alerting. | HIGH |
| 4 | **Bot detection is log-only by default** | `block_bots: false` in `bot_detection.rs`. Automated attacks are logged but not blocked. | HIGH |
| 5 | **Compiler warnings suppressed in Docker** | `RUSTFLAGS="-Aunused -Amismatched_lifetime_syntaxes -Adependency_on_unit_never_type_fallback -Aunused_comparisons"` may mask security-relevant warnings. | HIGH |

### 3.2 HIGH Gaps

| # | Gap | Details | Risk Level |
|---|-----|---------|------------|
| 6 | **No CSRF token validation in middleware** | CSRF module exists in `rustpress-auth` but is not wired into the middleware stack in `app.rs`. State-changing requests (POST/PUT/DELETE) can be forged. | HIGH |
| 7 | **CSP allows unsafe-inline and unsafe-eval** | `script-src 'self' 'unsafe-inline' 'unsafe-eval'` negates much of CSP's XSS protection. Required by some dependencies but should be scoped. | HIGH |
| 8 | **No TLS in the application** | TLS config fields exist (`tls_enabled`, `tls_cert_path`, `tls_key_path`) but the `App::run()` method uses plain TCP. TLS termination must be handled by reverse proxy. | HIGH |
| 9 | **Rate limiter uses cache backend** | Rate limit counters stored in moka cache. Per-instance only, easily circumvented in multi-instance deployments. Window is fixed at 60s regardless of `window_secs` config. | HIGH |
| 10 | **Entrypoint script uses bcrypt, not Argon2** | `entrypoint.sh` line 119 uses Python bcrypt for admin seed password, while the application uses Argon2id. Hash format mismatch may prevent first login. | HIGH |

### 3.3 MEDIUM Gaps

| # | Gap | Details | Risk Level |
|---|-----|---------|------------|
| 11 | **No request timeout middleware applied** | `request_timeout()` function exists in `middleware.rs` but is not in the middleware stack in `app.rs`. Slow requests can hold connections indefinitely. | MEDIUM |
| 12 | **Admin password logged to stdout** | `entrypoint.sh` line 142: `log_info "Password: ${ADMIN_PASSWORD}"`. Sensitive data visible in container logs. | MEDIUM |
| 13 | **HSTS preload not enabled** | `hsts_preload: false` by default. Sites cannot be added to browser HSTS preload lists. | MEDIUM |
| 14 | **Cross-Origin policies may break CDN** | `cross-origin-embedder-policy: require-corp` and `cross-origin-resource-policy: same-origin` will block loading resources from CDN origins. | MEDIUM |
| 15 | **IP extraction trusts X-Forwarded-For** | Rate limiter uses `X-Forwarded-For` header directly (`middleware.rs` line 126). Easily spoofed without proper reverse proxy configuration. | MEDIUM |
| 16 | **No input sanitization on chat messages** | Chat routes in `routes.rs` accept user content for real-time messaging. Stored XSS risk if content is rendered unsanitized. | MEDIUM |
| 17 | **File system operations in route handlers** | Admin routes read files directly from disk (`tokio::fs::read`). Path validation may be insufficient for edge cases. | MEDIUM |

### 3.4 LOW Gaps

| # | Gap | Details | Risk Level |
|---|-----|---------|------------|
| 18 | **Config file readable by all** | `config/rustpress.toml` contains JWT secret in plaintext on disk. | LOW |
| 19 | **No Content-Type on error responses** | Some error responses return plain text without explicit Content-Type headers. | LOW |
| 20 | **Git routes exposed in API** | `/api/v1/git/*` routes (status, init) could expose repository information. | LOW |
| 21 | **File management routes** | `/api/v1/files/*` routes (list, read, write, create, delete, rename) provide filesystem access that should be admin-only and carefully scoped. | LOW |

---

## 4. TLS/SSL Configuration Analysis

### Current State

- **Application-level TLS**: Not implemented. The `ServerConfig` struct has `tls_enabled`, `tls_cert_path`, and `tls_key_path` fields, but the `App::run()` method only binds a plain TCP listener.
- **Expected approach**: TLS termination at the reverse proxy layer (Nginx/Caddy/Traefik).
- **HSTS**: Enabled by default with 1-year max-age and `includeSubDomains`.

### Recommendations

1. **Do NOT implement application-level TLS** — reverse proxy termination is the correct pattern for this architecture
2. **Ensure HSTS is only sent over HTTPS** — currently sent unconditionally (including HTTP)
3. **Add `Strict-Transport-Security` only when behind TLS proxy** — detect via `X-Forwarded-Proto` header
4. **Consider enabling HSTS preload** for production deployments

---

## 5. Authentication Middleware Flow (Detailed)

### 5.1 JWT Authentication Extraction

```
Request
  │
  ▼
AuthUser Extractor (extract.rs)
  │ 1. Get AppState from request state
  │ 2. Extract Authorization header
  │ 3. Parse "Bearer {token}" format
  │ 4. Call jwt.validate_access_token(token)
  │     → Verify signature (HMAC-SHA256)
  │     → Check expiry (exp claim)
  │     → Check issuer (iss == "rustpress")
  │ 5. Parse user_id from sub claim (UUID)
  │ 6. Parse email from custom claims
  │ 7. Parse roles from role claim
  │ 8. Return AuthUser { id, email, roles, claims }
  │
  ▼
Handler has access to authenticated user
```

### 5.2 Permission Checking

```
Handler
  │ auth_user.is_admin()      → checks for "administrator" role
  │ auth_user.has_role(role)   → checks role membership
  │
  │ Note: PermissionChecker exists in AppState but
  │       is initialized with default() — full RBAC
  │       enforcement depends on implementation in
  │       permission.rs
  │
  ▼
Business Logic
```

### 5.3 Security Concerns in Auth Flow

| Concern | Status | Details |
|---------|--------|---------|
| Token stored in request extension | OK | Extracted per-request, not cached |
| Claims parsed from token only | OK | No DB lookup on every request (performance) |
| No token revocation check | GAP | Compromised tokens valid until expiry |
| Role from token, not DB | RISK | Role changes not reflected until token refresh |
| No audience (aud) claim validation | GAP | Token could be used across services |

---

## 6. OWASP Top 10 (2021) Hardening Checklist

### A01:2021 — Broken Access Control

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A01.1 | CORS policy restricts origins | FAIL | Replace `Any` with explicit allowed origins |
| A01.2 | CSRF protection on state-changing endpoints | FAIL | Wire CSRF middleware into stack |
| A01.3 | Rate limiting on auth endpoints | PARTIAL | Rate limiter exists but uses per-instance cache |
| A01.4 | File access validates against path traversal | PASS | `request_validation.rs` detects `../` patterns |
| A01.5 | Admin endpoints require authentication | VERIFY | Audit all `/api/v1/*` routes for `AuthUser` extractor |
| A01.6 | Role-based access on destructive operations | VERIFY | Check RBAC enforcement on delete/update handlers |
| A01.7 | File/git API routes restricted to admin | VERIFY | Check auth requirements on `/api/v1/files/*` and `/api/v1/git/*` |
| A01.8 | Forced browsing protection | PASS | SPA returns index.html for unknown routes |

### A02:2021 — Cryptographic Failures

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A02.1 | Passwords hashed with Argon2id | PASS | `argon2 = "0.5"` in dependencies |
| A02.2 | JWT secret sufficiently strong | WARN | Default is weak; production value is 64-char random |
| A02.3 | TLS in transit | PARTIAL | Requires reverse proxy (no app-level TLS) |
| A02.4 | Sensitive data not in logs | FAIL | Admin password logged in entrypoint.sh |
| A02.5 | Secrets not in source code | PASS | JWT secret via config/env, not hardcoded |
| A02.6 | Password reset tokens are time-limited | VERIFY | `password_reset_tokens` table exists; verify TTL enforcement |
| A02.7 | Refresh token rotation implemented | PASS | Module exists with family tracking |

### A03:2021 — Injection

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A03.1 | SQL injection prevention | PASS | SQLx parameterized queries only |
| A03.2 | SQL injection detection middleware | PASS | `request_validation.rs` with regex detection |
| A03.3 | XSS prevention on output | VERIFY | Check if theme rendering sanitizes content |
| A03.4 | XSS detection middleware | PASS | `request_validation.rs` with pattern detection |
| A03.5 | Command injection prevention | PASS | Detection middleware + no shell exec in handlers |
| A03.6 | Template injection prevention | VERIFY | Tera templates — verify auto-escaping is enabled |
| A03.7 | Path traversal prevention | PASS | Middleware detection + file path validation |

### A04:2021 — Insecure Design

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A04.1 | Threat modeling completed | FAIL | No threat model document exists |
| A04.2 | Security test coverage | FAIL | No security-specific tests |
| A04.3 | Secure defaults | PARTIAL | Most defaults are secure; CORS and bot detection are not |
| A04.4 | Defense in depth | PASS | Multiple security layers in middleware stack |
| A04.5 | Principle of least privilege | VERIFY | Audit RBAC role definitions and defaults |

### A05:2021 — Security Misconfiguration

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A05.1 | Default credentials documented | PARTIAL | Entrypoint generates random password |
| A05.2 | Error messages don't leak internals | VERIFY | Audit error response format |
| A05.3 | Security headers comprehensive | PASS | Excellent header coverage |
| A05.4 | Unnecessary features disabled | WARN | Git/file routes should be configurable |
| A05.5 | Debug features disabled in production | VERIFY | Check for debug endpoints |
| A05.6 | Docker image runs as non-root | FAIL | Dockerfile does not set USER |

### A06:2021 — Vulnerable and Outdated Components

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A06.1 | `cargo audit` passes | VERIFY | Run `cargo audit` and fix findings |
| A06.2 | `npm audit` passes | VERIFY | Run `npm audit` and fix findings |
| A06.3 | Dependency versions up to date | PARTIAL | Some crates use workspace deps, some pin old versions |
| A06.4 | No known CVEs in dependencies | VERIFY | Cross-reference with RustSec advisory DB |

### A07:2021 — Identification and Authentication Failures

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A07.1 | Brute force protection | PASS | 5 attempts, 15-minute lockout |
| A07.2 | Password strength requirements | PASS | Min 8 chars, uppercase, lowercase, digit required |
| A07.3 | Multi-factor authentication | PASS | TOTP + WebAuthn modules exist |
| A07.4 | Session timeout configured | PASS | 24-hour default |
| A07.5 | Token refresh implemented | PASS | Rotation with family tracking |
| A07.6 | Account lockout notification | VERIFY | Check if lockout events trigger email |

### A08:2021 — Software and Data Integrity Failures

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A08.1 | CI/CD pipeline security | VERIFY | Check GitHub Actions workflows |
| A08.2 | Dependency integrity verification | PASS | Cargo.lock pins exact versions |
| A08.3 | Plugin integrity verification | FAIL | No signature verification on plugins |
| A08.4 | Upload integrity validation | PASS | Magic byte validation enabled |
| A08.5 | Database migration integrity | PARTIAL | Migrations tracked but no checksums |

### A09:2021 — Security Logging and Monitoring Failures

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A09.1 | Security events logged | PASS | Comprehensive event types defined |
| A09.2 | Logs persisted to durable storage | FAIL | In-memory VecDeque only |
| A09.3 | Log tampering prevention | FAIL | No log integrity protection |
| A09.4 | Alerting on security events | FAIL | No alerting mechanism |
| A09.5 | Audit trail for admin actions | PARTIAL | Auth audit exists; need broader coverage |
| A09.6 | Prometheus metrics for security | PARTIAL | Request metrics yes; security-specific metrics limited |

### A10:2021 — Server-Side Request Forgery (SSRF)

| # | Check | Status | Action Required |
|---|-------|--------|-----------------|
| A10.1 | URL validation on external requests | VERIFY | Check CDN and OAuth2 callback handling |
| A10.2 | SSRF in media URL fetching | VERIFY | Check if media accepts URLs for remote fetch |
| A10.3 | Webhook URL validation | VERIFY | Check webhook/notification URL handling |
| A10.4 | DNS rebinding protection | FAIL | No explicit DNS rebinding prevention |

---

## 7. Priority Remediation Plan

### Immediate (Before Production)

1. **Replace CORS `Any` with explicit origins** — `middleware.rs` line 199
   - Use `cors_origins` from `ApiConfig` instead of `Any`
   - Allow configuration via environment variable

2. **Wire CSRF middleware into stack** — `app.rs`
   - Import CSRF module from `rustpress-auth`
   - Add as middleware layer for POST/PUT/DELETE routes

3. **Fix entrypoint.sh password hashing** — Use Argon2 instead of bcrypt, or use the CLI tool
   - Remove password logging from stdout

4. **Enable bot blocking** — Change default `block_bots: true` or make configurable

5. **Add Docker USER directive** — Run container as non-root user

### Short-term (Wave 5 — Production Hardening)

6. **Persist security audit logs** — Write to PostgreSQL table or log file
7. **Add request timeout to middleware stack** — Wire existing `request_timeout()` function
8. **Restrict CSP** — Remove `unsafe-inline` and `unsafe-eval` where possible; use nonces
9. **Fix rate limiter** — Use Redis backend for distributed rate limiting; respect `window_secs` config
10. **Restrict file/git API routes** — Require admin role; make configurable to disable

### Medium-term (v1.0 Release)

11. **Run `cargo audit`** — Fix all CRITICAL/HIGH findings
12. **Run `npm audit`** — Fix all CRITICAL/HIGH findings
13. **Add token revocation** — Blacklist on logout; check on validation
14. **Validate audience claim in JWT** — Prevent cross-service token reuse
15. **Create threat model document** — Document attack surfaces and mitigations
16. **Add security-specific tests** — OWASP ZAP scan, injection tests, auth bypass tests

---

## 8. Security Testing Plan

### Automated Testing

| Test Type | Tool | Target | Frequency |
|-----------|------|--------|-----------|
| Dependency audit | `cargo audit` | Backend | Every CI run |
| Dependency audit | `npm audit` | Frontend | Every CI run |
| DAST scan | OWASP ZAP | Running instance | Weekly / pre-release |
| SQL injection | sqlmap | API endpoints | Pre-release |
| XSS scanning | ZAP + custom | All input fields | Pre-release |
| TLS configuration | testssl.sh | Production URL | Monthly |
| Header analysis | SecurityHeaders.com | Production URL | Monthly |
| Container scan | Trivy | Docker image | Every build |

### Manual Testing

| Test | Description | Priority |
|------|-------------|----------|
| Auth bypass | Attempt to access admin APIs without valid JWT | P0 |
| Privilege escalation | Attempt to perform admin actions with subscriber JWT | P0 |
| IDOR | Attempt to access other users' data by manipulating UUIDs | P0 |
| File upload abuse | Upload executable, oversized, or type-spoofed files | P1 |
| Rate limit bypass | Test with spoofed X-Forwarded-For | P1 |
| Session fixation | Attempt to hijack sessions | P1 |
| CORS exploitation | Test cross-origin API calls from malicious domain | P0 |

---

*End of Security Audit Plan*
