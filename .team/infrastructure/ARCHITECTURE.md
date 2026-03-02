# RustPress CMS — System Architecture Document

**Version**: 0.4.0 (MVP)
**Date**: 2026-03-02
**Author**: Infrastructure Engineer (INFRA), Full-Stack Team
**Status**: Research & Planning — Wave 2

---

## 1. System Overview

RustPress is a production-grade, WordPress-compatible CMS built in Rust (backend) with a React/TypeScript admin dashboard (frontend). The system follows a monolithic architecture with a modular crate-based internal structure, deployed as a single binary serving both the API and static assets.

### High-Level Topology

```
                         Internet
                            |
                     [Reverse Proxy]
                   Nginx / Caddy / Traefik
                   (TLS termination, HTTP/2)
                            |
                    +-----------------+
                    |   RustPress     |
                    |   (Axum :8080)  |
                    |                 |
                    | /admin/*  SPA   |
                    | /api/v1/* REST  |
                    | /health   Probe |
                    | /metrics  Prom  |
                    | /ws       WS    |
                    | /*        Theme |
                    +---------+-------+
                         |         |
                 +-------+--+  +---+------+
                 |PostgreSQL |  |  Redis   |
                 |  16 :5432 |  |  7 :6379 |
                 +----------+  +----------+
                       |
              +--------+--------+
              | Local / S3 /    |
              | Azure / GCS     |
              | (File Storage)  |
              +-----------------+
```

---

## 2. Repository Structure

### 2.1 Backend — `rustpress-core-base`

```
rustpress-core-base/
├── Cargo.toml              # Workspace definition (20 crates + 4 plugin crates)
├── Cargo.lock
├── Dockerfile              # Multi-stage build (rust:slim-bookworm → debian:bookworm-slim)
├── docker-compose.yml      # PostgreSQL 16 + Redis 7 (dev services)
├── config/
│   └── rustpress.toml      # Runtime configuration
├── deploy/
│   ├── config/default.toml # Production defaults
│   └── scripts/entrypoint.sh # Docker entrypoint (migration + seed + start)
├── migrations/             # 10 SQL migration files (00001–00030)
├── themes/                 # Theme files (rustpress-enterprise)
├── public/                 # Public static assets
├── crates/                 # 20 internal library/binary crates
│   ├── rustpress-core/     # Core types, traits, config, plugin interfaces
│   ├── rustpress-database/ # SQLx-based data access, repository, models
│   ├── rustpress-auth/     # Auth: JWT, OAuth2, RBAC, TOTP, WebAuthn, CSRF, brute-force
│   ├── rustpress-api/      # API handler layer (consumes all service crates)
│   ├── rustpress-server/   # HTTP server: Axum, routes (8036 lines), middleware, security
│   ├── rustpress-plugins/  # Plugin system: discovery, lifecycle, WASM support
│   ├── rustpress-cache/    # Cache abstraction: moka (in-memory) + Redis backends
│   ├── rustpress-storage/  # File storage: local, S3, Azure, GCS via object_store
│   ├── rustpress-jobs/     # Background job queue: scheduler, worker, handlers
│   ├── rustpress-events/   # Event bus: domain events, pub/sub
│   ├── rustpress-content/  # Content management: blocks, markdown, versioning
│   ├── rustpress-users/    # User management: CRUD, roles, validation
│   ├── rustpress-themes/   # Theme system: discovery, activation, Tera templates
│   ├── rustpress-performance/ # Performance: caching strategies, connection pooling
│   ├── rustpress-media/    # Media processing: image optimization, deduplication
│   ├── rustpress-admin/    # Admin dashboard: system info, Askama templates
│   ├── rustpress-cli/      # CLI tools: Clap-based command groups
│   ├── rustpress-health/   # Health probes: liveness, readiness, dependency checks
│   ├── rustpress-cdn/      # CDN integration: Cloudflare, BunnyCDN, signed URLs
│   └── rustpress-editor/   # Block editor: collaboration, SEO analysis
├── plugins/                # 7 plugin directories
│   ├── rustcloudflare/     # Cloudflare integration (compiled into server)
│   ├── rustbuilder/        # Visual page builder (compiled into server)
│   ├── visual-queue-manager/ # Visual queue manager (compiled into server)
│   ├── pageforge/          # Visual page builder (compiled into server)
│   ├── rustanalytics/      # Analytics (config-only, not compiled)
│   ├── rustbackup/         # Backup system (config-only, not compiled)
│   ├── rustcommerce/       # E-commerce (stub/config, not compiled)
│   └── rustpress-dbmanager/ # DB manager (config-only, not compiled)
└── scripts/                # Build and utility scripts
```

### 2.2 Frontend — `rustpress-core-admin-ui`

```
rustpress-core-admin-ui/
├── package.json            # React 18 + Vite 6 + Tailwind CSS 3.4
├── vite.config.ts          # Base: /admin/, proxy: /api → localhost:3080
├── tsconfig.json
├── src/
│   ├── App.tsx             # Route definitions (917 lines)
│   ├── api/client.ts       # Axios HTTP client with JWT interceptors
│   ├── store/*.ts          # Zustand state stores
│   ├── pages/              # 40+ admin pages
│   ├── components/         # 150+ design system components
│   └── layouts/            # EnterpriseLayout (main shell)
├── dist/                   # Built output served by Axum at /admin/*
└── .team/                  # Team planning artifacts
```

---

## 3. Crate Dependency Graph

The workspace contains 20 core crates and 4 plugin crates compiled into the server binary. Dependencies flow in a layered architecture.

### 3.1 Layer Model

```
Layer 0 (Foundation):    rustpress-core
                              |
Layer 1 (Data/Infra):    rustpress-database   rustpress-cache   rustpress-storage
                         rustpress-events     rustpress-jobs
                              |
Layer 2 (Domain):        rustpress-auth    rustpress-content   rustpress-media
                         rustpress-users   rustpress-themes    rustpress-editor
                         rustpress-plugins rustpress-performance
                         rustpress-health  rustpress-cdn
                              |
Layer 3 (Application):   rustpress-api     rustpress-admin
                              |
Layer 4 (Presentation):  rustpress-server  rustpress-cli
```

### 3.2 Detailed Dependency Map

```
rustpress-core (Layer 0)
├── No internal dependencies
├── External: tokio, serde, serde_json, toml, thiserror, anyhow,
│             tracing, uuid, chrono, bytes, url, semver, async-trait,
│             futures, reqwest (optional), config

rustpress-database (Layer 1)
├── rustpress-core
├── External: sqlx, deadpool, tokio, serde

rustpress-cache (Layer 1)
├── rustpress-core
├── External: moka (default), redis + deadpool-redis (optional)

rustpress-storage (Layer 1)
├── rustpress-core
├── External: object_store (S3/Azure/GCS optional), bytes, mime

rustpress-events (Layer 1)
├── rustpress-core
├── External: parking_lot, dashmap, tokio-stream

rustpress-jobs (Layer 1)
├── rustpress-core, rustpress-database
├── External: sqlx, parking_lot, dashmap

rustpress-auth (Layer 2)
├── rustpress-core
├── External: jsonwebtoken, argon2, rand, validator

rustpress-content (Layer 2 — standalone)
├── No workspace deps (uses own sqlx/chrono/uuid)
├── External: pulldown-cmark, ammonia, slug, image

rustpress-media (Layer 2 — standalone)
├── No workspace deps (uses own sqlx/chrono/uuid)
├── External: image, sha2, hex, mime_guess

rustpress-users (Layer 2)
├── rustpress-core
├── External: argon2, rand, jsonwebtoken, validator, regex

rustpress-themes (Layer 2)
├── rustpress-core
├── External: tera, walkdir, notify, semver

rustpress-plugins (Layer 2)
├── rustpress-core
├── External: libloading, wasmtime (optional)

rustpress-performance (Layer 2)
├── rustpress-core
├── External: redis, moka, axum, sqlx, deadpool

rustpress-health (Layer 2 — standalone)
├── No workspace deps
├── External: sqlx, redis, reqwest

rustpress-cdn (Layer 2 — standalone)
├── No workspace deps
├── External: reqwest, hmac, sha2, base64

rustpress-editor (Layer 2)
├── No workspace deps
├── External: pulldown-cmark, ammonia, regex

rustpress-admin (Layer 2 — standalone)
├── No workspace deps
├── External: sqlx, askama, sysinfo

rustpress-api (Layer 3)
├── rustpress-core, rustpress-database, rustpress-auth
├── rustpress-cache, rustpress-events, rustpress-storage
├── rustpress-jobs, rustpress-admin
├── External: axum, axum-extra, regex

rustpress-server (Layer 4 — binary)
├── rustpress-core, rustpress-database, rustpress-auth
├── rustpress-cache, rustpress-events, rustpress-storage
├── rustpress-jobs, rustpress-api, rustpress-themes
├── Plugins: rustcloudflare, rustbuilder, visual-queue-manager, pageforge
├── External: axum, tower, tower-http, hyper, tera, handlebars, lettre
│             prometheus-client, sqlx, serde, uuid, chrono, clap
│             once_cell, parking_lot, dashmap, regex

rustpress-cli (Layer 4 — binary)
├── No workspace crate deps (standalone binary)
├── External: clap, tabled, colored, indicatif, console, serde_yaml
```

### 3.3 Binary Outputs

The workspace produces 3 binaries:

| Binary | Source | Purpose |
|--------|--------|---------|
| `rustpress` | `crates/rustpress-server/src/main.rs` | Main HTTP server |
| `rustpress-cli` | `crates/rustpress-cli/src/main.rs` | CLI management tool |
| `rustpress-migrate` | (migration binary) | Database migration runner |

---

## 4. Request Flow

### 4.1 Complete HTTP Request Lifecycle

```
Client Request
    │
    ▼
[Reverse Proxy] ─── TLS termination, HTTP/2, load balancing
    │
    ▼
[TCP Listener] ─── tokio TcpListener (0.0.0.0:8080)
    │
    ▼
[Axum Router] ─── Pattern matching on path
    │
    ▼
┌─────────────────── MIDDLEWARE STACK (12 layers) ───────────────────┐
│                                                                     │
│  Execution order (outermost first):                                 │
│                                                                     │
│  1. Compression ──────── tower_http gzip/brotli                    │
│  2. Tracing ──────────── tower_http TraceLayer                     │
│  3. Request ID ───────── UUID v7 generation (x-request-id)         │
│  4. Security Audit ───── Event logging (blocked, auth, rate limit) │
│  5. Fingerprinting ───── Header hash + UA hash + timing            │
│  6. Bot Detection ────── UA analysis, timing, header anomalies     │
│  7. Request Logging ──── Structured tracing span per request       │
│  8. Security Headers ─── CSP, HSTS, X-Frame, COEP, COOP, CORP     │
│  9. Request Validation ─ SQL injection, XSS, path traversal       │
│ 10. Content Security ─── JSON depth, content-type, upload types    │
│ 11. CORS ─────────────── CorsLayer (Allow-Origin: *)               │
│ 12. Body Limit ───────── 10MB default, 100MB for uploads           │
│ 13. API Version ──────── api-version header extraction             │
│ 14. Rate Limiting ────── Per-IP, cache-backed counter              │
│ 15. Tenant ID ────────── Multi-tenancy (subdomain/header)          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    │
    ▼
[Route Handler] ─── Determined by path pattern
    │
    ├── /health/*     → Health check handlers (live/ready)
    ├── /metrics      → Prometheus metrics exporter
    ├── /admin/*      → Static file serving (SPA fallback to index.html)
    ├── /api/v1/*     → REST API handlers
    │   ├── /auth/*       → Login, register, refresh, reset
    │   ├── /users/*      → User CRUD
    │   ├── /posts/*      → Post CRUD + bulk ops
    │   ├── /pages/*      → Page CRUD
    │   ├── /media/*      → Media upload + management
    │   ├── /comments/*   → Comment CRUD + moderation
    │   ├── /settings/*   → Settings CRUD
    │   ├── /plugins/*    → Plugin management
    │   ├── /themes/*     → Theme management
    │   ├── /taxonomies/* → Categories + Tags
    │   ├── /menus/*      → Menu management
    │   ├── /widgets/*    → Widget management
    │   ├── /search/*     → Full-text search
    │   ├── /backups/*    → Backup management
    │   ├── /seo/*        → SEO settings
    │   ├── /cache/*      → Cache management
    │   ├── /cdn/*        → CDN configuration
    │   ├── /stats/*      → Statistics/analytics
    │   ├── /email/*      → Email management
    │   ├── /storage/*    → Storage management
    │   ├── /chat/*       → Real-time chat
    │   ├── /files/*      → File management
    │   ├── /git/*        → Git integration
    │   ├── /ws           → WebSocket upgrade
    │   ├── /cloudflare/* → Cloudflare plugin API
    │   ├── /rustbuilder/* → Page builder plugin API
    │   └── /pageforge/*  → PageForge plugin API
    ├── /pagebuilder/*  → PageForge visual editor UI
    └── /*              → Public frontend (theme-rendered pages)
        ├── /             → Home page
        ├── /blog         → Blog listing
        ├── /post/:slug   → Single post
        ├── /page/:slug   → Static page
        ├── /category/:slug → Category archive
        ├── /tag/:slug    → Tag archive
        ├── /author/:slug → Author archive
        ├── /search       → Search results
        ├── /feed         → RSS feed
        ├── /feed/atom    → Atom feed
        ├── /sitemap.xml  → XML sitemap
        ├── /robots.txt   → Robots file
        └── /themes/:id/* → Theme static assets
```

### 4.2 Authentication Flow

```
[Client]
    │ POST /api/v1/auth/login { email, password }
    ▼
[Rate Limit Middleware] ── Check per-IP rate limit
    │
    ▼
[Login Handler]
    │ 1. Validate input (validator crate)
    │ 2. Check brute-force lockout
    │ 3. Query user by email (sqlx → PostgreSQL)
    │ 4. Verify password (argon2 hash comparison)
    │ 5. Generate JWT access token (15min expiry)
    │ 6. Generate JWT refresh token (7d expiry)
    │ 7. Record login event (audit log)
    ▼
[Response] { access_token, refresh_token, user }

[Subsequent Requests]
    │ Authorization: Bearer <access_token>
    ▼
[AuthUser Extractor]
    │ 1. Extract Bearer token from Authorization header
    │ 2. Validate JWT signature + expiry (jsonwebtoken)
    │ 3. Parse claims: sub (user_id), role, custom fields
    │ 4. Return AuthUser { id, email, roles, claims }
    ▼
[Handler] ── Can check auth_user.is_admin(), auth_user.has_role()
```

### 4.3 Admin UI Data Flow

```
[React Component]
    │ Action (button click, form submit)
    ▼
[Zustand Store]
    │ State update + API call
    ▼
[Axios Client] ─── /api/client.ts
    │ Interceptor adds: Authorization: Bearer <token>
    │ Interceptor handles: 401 → refresh token → retry
    ▼
[Vite Dev Proxy] ─── /api → http://localhost:3080 (dev only)
    │
    ▼ (Production: direct to Axum)
[Axum /api/v1/*]
    │
    ▼
[PostgreSQL + Cache]
    │
    ▼
[JSON Response]
    │
    ▼
[Zustand Store] ─── State updated
    │
    ▼
[React Re-render] ─── UI updates
    │
    ▼
[localStorage] ─── Persistent state (Zustand persist middleware)
```

---

## 5. Data Architecture

### 5.1 Database Schema (PostgreSQL 16)

10 migration files define the following core tables:

**Migration 00001 — Initial Schema:**
- `users` — User accounts (UUID PK, email, username, password_hash, role, status, meta JSONB)
- `posts` — Content items (UUID PK, title, slug, content, status, author_id, published_at, meta JSONB)
- `pages` — Static pages (UUID PK, title, slug, content, parent_id, template, menu_order)
- `categories` — Hierarchical taxonomy (UUID PK, name, slug, parent_id)
- `tags` — Flat taxonomy (UUID PK, name, slug)
- `post_categories` — Junction table (post_id, category_id)
- `post_tags` — Junction table (post_id, tag_id)
- `media` — Media files (UUID PK, filename, mime_type, file_size, width, height, meta JSONB)
- `comments` — Threaded comments (UUID PK, post_id, parent_id, author, content, status)
- `settings` — Key-value settings (UUID PK, key, value, type, group_name)
- `themes` — Theme registry (VARCHAR PK, name, version, is_active, settings JSONB)
- `menus` — Navigation menus (UUID PK, name, slug, location)
- `menu_items` — Menu entries (UUID PK, menu_id, parent_id, title, url, menu_order)
- `widgets` — Sidebar widgets (UUID PK, sidebar, widget_type, settings JSONB, widget_order)

**Migration 00002:** `sites` — Multi-site support

**Migration 00023:** `password_reset_tokens` — Token-based password reset

**Migration 00024:** Additional columns (locale, timezone on users; options table; revisions; user_meta)

**Migration 00025:** Collaboration and chat system tables

**Migration 00026:** `storage_configurations` — Multi-backend storage config

**Migration 00027:** `user_block_preferences` — Editor block preferences

**Migration 00028:** `animations` — Animation library

**Migration 00029:** Template library system

**Migration 00030:** Enhanced media library (folders, optimization tracking)

### 5.2 Cache Architecture

```
Request → Cache Check
              │
              ├── Cache Hit → Return cached data
              │
              └── Cache Miss → Query DB → Store in cache → Return data

Cache Backends:
  ┌──────────────────┐    ┌──────────────────┐
  │  moka (default)  │    │  Redis (optional) │
  │  In-memory LRU   │    │  Distributed      │
  │  10K max entries │    │  Feature: redis   │
  │  TTL: 3600s      │    │  Cluster-ready    │
  └──────────────────┘    └──────────────────┘

Cache Key Pattern: "rustpress:{entity}:{id}" or "rate_limit:{ip}"
```

### 5.3 Storage Architecture

```
Upload Request → Content Security Middleware (type + size check)
    │
    ▼
Storage Service → Backend Selection
    │
    ├── Local Backend (default)
    │   Path: ./uploads/
    │   URL: /uploads/{filename}
    │
    ├── S3 Backend (optional)
    │   object_store with AWS features
    │
    ├── Azure Blob (optional)
    │   object_store with Azure features
    │
    └── GCS Backend (optional)
        object_store with GCP features

CDN Integration:
    Storage → CDN URL rewrite → Client
    (Cloudflare / BunnyCDN via rustpress-cdn crate)
```

---

## 6. Static Asset Serving

### 6.1 Admin SPA (`/admin/*`)

The Axum server serves the React SPA from the filesystem:

```
/admin          → Redirect to /admin (drop trailing slash)
/admin/*        → Fallback handler:
                    1. If path matches asset extension (.js, .css, .svg, .png, etc.)
                       → Read file from {ADMIN_UI_PATH}/assets/{file}
                       → Respond with appropriate Content-Type
                    2. Else (SPA route)
                       → Read {ADMIN_UI_PATH}/index.html
                       → Respond with text/html
```

- Default `ADMIN_UI_PATH`: `./admin-ui/dist`
- Configurable via environment variable

### 6.2 Theme Assets (`/themes/:theme_id/*path`)

```
/themes/{theme_id}/{path} → theme_asset_handler
    → Reads from {THEMES_PATH}/{theme_id}/{path}
    → Content-Type detection by extension
```

### 6.3 Uploaded Media (`/uploads/*`)

Served by the storage backend's `with_base_url("/uploads")` configuration:
```
/uploads/{filename} → LocalBackend reads from ./uploads/
```

### 6.4 PageForge Builder (`/pagebuilder/*`)

```
/pagebuilder/*  → Inline HTML response (embedded in routes.rs)
                  Includes CSS + JS for drag-and-drop page builder
```

---

## 7. Observability

### 7.1 Health Checks

| Endpoint | Type | Purpose |
|----------|------|---------|
| `/health` | Liveness | Basic server alive check |
| `/health/live` | Liveness | Kubernetes liveness probe |
| `/health/ready` | Readiness | DB + Redis connectivity |
| `/api/health` | Compatibility | Frontend health check |

### 7.2 Metrics

- Endpoint: `/metrics` (Prometheus format)
- Metrics collected via `prometheus-client` crate:
  - HTTP request counters (method, path, status)
  - Request latency histograms
  - Database operation counters and latencies
  - Cache hit/miss counters
  - Job queue status (queued, running, completed, failed)

### 7.3 Logging

- Framework: `tracing` + `tracing-subscriber`
- Default filter: `rustpress=info,tower_http=info,sqlx=warn`
- Configurable via `RUST_LOG` environment variable
- Per-request logging with request ID correlation
- Security audit logging (separate event stream)

---

## 8. Background Processing

### 8.1 Job Queue

```
[Scheduler] ─── Periodic job creation
    │
    ├── publish_scheduled_posts (every minute)
    └── clean_theme_previews (hourly)
    │
    ▼
[JobQueue] ─── PostgreSQL-backed queue
    │
    ▼
[Worker] ─── Processes jobs with registered handlers
    │
    ├── PublishScheduledPostsHandler
    └── CleanThemePreviewsHandler
```

- Jobs stored in PostgreSQL (not Redis)
- Configurable: workers (4), max_retries (3), retry_delay (60s), timeout (300s)

### 8.2 Event Bus

```
[Domain Event] → EventBus → [Subscribers]
    │                              │
    │                              ├── Plugin hooks
    │                              ├── Cache invalidation
    │                              └── Audit logging
```

- In-memory pub/sub via `parking_lot::RwLock` + `dashmap`
- Not distributed (single-instance only)

---

## 9. WebSocket Support

```
/api/v1/ws → websocket_handler → WebSocketHub

WebSocket Modules:
├── hub.rs          — Connection registry, broadcast
├── handler.rs      — Upgrade handler
├── message.rs      — Message types
├── chat.rs         — Chat functionality
├── collaboration.rs — Multi-user editing
└── presence.rs     — Online user tracking
```

- Used for: real-time chat, collaborative editing, presence indicators
- Hub is in-memory (single-instance only)

---

## 10. Plugin System

### 10.1 Plugin Loading

```
Startup:
    1. Scan ./plugins/ directory
    2. Parse plugin.toml for each directory
    3. Check for .disabled marker → skip
    4. Match plugin ID to registered factory
    5. Instantiate plugin via Arc::new(Plugin::new())
    6. Call plugin.activate() with AppContext
```

### 10.2 Compiled Plugins (in workspace)

| Plugin | Crate | Status | Route |
|--------|-------|--------|-------|
| rustcloudflare | `plugins/rustcloudflare` | Active | `/api/v1/cloudflare/*` |
| rustbuilder | `plugins/rustbuilder` | Compiled | `/api/v1/rustbuilder/*` |
| visual-queue-manager | `plugins/visual-queue-manager` | Active | Factory-registered |
| pageforge | `plugins/pageforge` | Active | `/api/v1/pageforge/*` |

### 10.3 Config-Only Plugins (not compiled)

| Plugin | Directory | Status |
|--------|-----------|--------|
| rustanalytics | `plugins/rustanalytics` | Config only |
| rustbackup | `plugins/rustbackup` | Config only |
| rustcommerce | `plugins/rustcommerce` | Stub/config |
| rustpress-dbmanager | `plugins/rustpress-dbmanager` | Config only |

---

## 11. Architectural Bottlenecks and Risks

### 11.1 Single Points of Failure

| Component | Impact | Mitigation |
|-----------|--------|------------|
| PostgreSQL | Total system failure — all data stored here | Read replicas, pg_basebackup, WAL shipping |
| Single binary | No horizontal scaling of API | Stateless design allows multi-instance behind LB |
| In-memory event bus | Lost events on crash, no cross-instance events | Migrate to Redis Pub/Sub for multi-instance |
| In-memory WebSocket hub | No cross-instance real-time | Migrate to Redis-backed hub |
| In-memory rate limiter | Per-instance limits, inconsistent across instances | Already using cache backend (can swap to Redis) |
| Job queue (PostgreSQL) | Coupling job processing with data | Acceptable for v1.0; Redis-backed queue for v2.0 |

### 11.2 Code-Level Bottlenecks

| Issue | Details | Severity |
|-------|---------|----------|
| routes.rs is 8,036 lines | Single file containing all route definitions, handlers, and inline HTML | High — maintainability risk |
| Repository file is 75KB | Monolithic data access layer | Medium — needs splitting by entity |
| CORS allows Any origin | `CorsLayer::new().allow_origin(Any)` | High — security risk in production |
| RUSTFLAGS suppresses warnings | 5 warning categories suppressed in Dockerfile | High — masks real bugs |
| Bot detection defaults to log-only | `block_bots: false` | Medium — no active protection |
| No Redis in docker-compose | Only PostgreSQL and Redis containers for dev; app runs outside | Low — expected for dev |
| Plugin system is compile-time only | No runtime dynamic loading despite `libloading` dep | Medium — limits extensibility |
| Some crates are standalone | `rustpress-content`, `rustpress-media`, `rustpress-health`, `rustpress-cdn`, `rustpress-editor`, `rustpress-admin` do not use workspace deps | Low — version drift risk |

### 11.3 Scalability Constraints

- **Horizontal Scaling**: Possible for stateless API requests; blocked for WebSocket and event bus (in-memory)
- **Database**: Single PostgreSQL instance; connection pool configured for 2-10 connections (configurable to 100 in production defaults)
- **File Storage**: Local backend is single-host; must switch to S3/Azure/GCS for multi-instance
- **Cache**: moka is per-instance; must enable Redis feature for shared caching across instances

---

## 12. Technology Stack Summary

### Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Rust | Edition 2021, MSRV 1.75 |
| Runtime | Tokio | 1.35 (full features) |
| HTTP Framework | Axum | 0.7 |
| Middleware | Tower + tower-http | 0.5 |
| Database | PostgreSQL via sqlx | 0.7 |
| Cache (primary) | moka | 0.12 |
| Cache (distributed) | Redis | 0.24 (optional) |
| Auth | jsonwebtoken + argon2 | 9.2 / 0.5 |
| Template Engine | Tera | 1.19 |
| Email | Lettre + Handlebars | via SMTP |
| Metrics | prometheus-client | 0.22 |
| Storage | object_store | 0.9 |
| Migrations | refinery | 0.8 |
| CLI | Clap | 4.4 |

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | TypeScript | 5.7 |
| Framework | React | 18.3 |
| Router | React Router | 6.28 |
| Build Tool | Vite | 6.0 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 11.15 |
| State | Zustand | 5.0 |
| HTTP Client | Axios | 1.7 |
| Charts | Recharts | 3.6 |
| Code Editor | Monaco Editor | 4.7 |
| Icons | Lucide React | 0.468 |

---

## 13. Configuration Hierarchy

Configuration values are resolved in this priority order (highest wins):

```
1. CLI arguments        (--port, --host)
2. Environment variables (RUSTPRESS_PORT, DATABASE_URL, JWT_SECRET, etc.)
3. Config file          (config/rustpress.toml)
4. Compiled defaults    (AppConfig::default())
```

### Key Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://localhost/rustpress` |
| `RUSTPRESS_HOST` | Bind address | `127.0.0.1` |
| `RUSTPRESS_PORT` | Bind port | `8080` |
| `JWT_SECRET` | JWT signing key | `change-me-in-production` |
| `STORAGE_PATH` | File upload directory | `./uploads` |
| `THEMES_PATH` | Theme directory | `./themes` |
| `CACHE_MAX_CAPACITY` | moka cache max entries | `10000` |
| `RUST_LOG` | Tracing filter | `rustpress=info,tower_http=info,sqlx=warn` |
| `ADMIN_UI_PATH` | Admin SPA directory | `./admin-ui/dist` |
| `RUSTPRESS_CONFIG` | Config file path | `./config/rustpress.toml` |
| `RUSTBUILDER_UI_PATH` | Page builder UI directory | `./plugins/rustbuilder/frontend/dist` |

---

*End of Architecture Document*
