# RustPress CMS — Deployment Guide

**Version**: 0.4.0 (MVP)
**Date**: 2026-03-02
**Author**: Infrastructure Engineer (INFRA), Full-Stack Team
**Status**: Research & Planning — Wave 2

---

## 1. Deployment Options

RustPress supports three deployment methods:

| Method | Complexity | Recommended For |
|--------|-----------|-----------------|
| Docker Compose | Low | Most deployments, recommended default |
| Binary Release | Medium | Bare-metal servers, custom setups |
| Build from Source | High | Development, custom patches |

---

## 2. Docker Compose Deployment (Recommended)

### 2.1 Prerequisites

- Docker Engine 24+ and Docker Compose v2
- 1 vCPU / 512MB RAM minimum
- 10GB disk space

### 2.2 Production docker-compose.yml

```yaml
version: '3.8'

services:
  rustpress:
    image: ghcr.io/rustpress/rustpress:0.4.0
    # Or build locally:
    # build:
    #   context: ./rustpress-core-base
    #   dockerfile: Dockerfile
    container_name: rustpress-app
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      # === REQUIRED ===
      DATABASE_URL: "postgres://rustpress:${DB_PASSWORD}@postgres:5432/rustpress"
      JWT_SECRET: "${JWT_SECRET}"  # Generate: openssl rand -base64 64

      # === SERVER ===
      RUSTPRESS_HOST: "0.0.0.0"
      RUSTPRESS_PORT: "8080"
      RUST_LOG: "rustpress=info,tower_http=info,sqlx=warn"

      # === STORAGE ===
      STORAGE_PATH: "/app/uploads"
      THEMES_PATH: "/app/themes"
      ADMIN_UI_PATH: "/app/admin-ui/dist"

      # === CACHE ===
      CACHE_MAX_CAPACITY: "10000"

      # === EMAIL (optional) ===
      # SMTP_HOST: "smtp.example.com"
      # SMTP_PORT: "587"
      # SMTP_USERNAME: "user@example.com"
      # SMTP_PASSWORD: "${SMTP_PASSWORD}"
      # EMAIL_FROM: "noreply@example.com"

      # === ADMIN SEED ===
      ADMIN_EMAIL: "${ADMIN_EMAIL:-admin@localhost}"
      ADMIN_USERNAME: "${ADMIN_USERNAME:-admin}"
      ADMIN_PASSWORD: "${ADMIN_PASSWORD}"  # Will be auto-generated if not set

    volumes:
      - rustpress_uploads:/app/uploads
      - rustpress_themes:/app/themes
      - rustpress_logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      start_period: 10s
      retries: 3
    # Security: run as non-root (add to Dockerfile too)
    # user: "1000:1000"

  postgres:
    image: postgres:16-alpine
    container_name: rustpress-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: rustpress
      POSTGRES_PASSWORD: "${DB_PASSWORD}"
      POSTGRES_DB: rustpress
    ports:
      - "127.0.0.1:5432:5432"  # Only expose locally
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rustpress"]
      interval: 5s
      timeout: 5s
      retries: 5
    # Performance tuning
    command: >
      postgres
      -c shared_buffers=128MB
      -c effective_cache_size=384MB
      -c work_mem=4MB
      -c maintenance_work_mem=64MB
      -c max_connections=100
      -c wal_buffers=4MB
      -c checkpoint_completion_target=0.9
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c min_wal_size=1GB
      -c max_wal_size=4GB

  redis:
    image: redis:7-alpine
    container_name: rustpress-cache
    restart: unless-stopped
    ports:
      - "127.0.0.1:6379:6379"  # Only expose locally
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    command: >
      redis-server
      --maxmemory 128mb
      --maxmemory-policy allkeys-lru
      --save 60 1000
      --appendonly yes

volumes:
  postgres_data:
  redis_data:
  rustpress_uploads:
  rustpress_themes:
  rustpress_logs:
```

### 2.3 Environment File (.env)

Create a `.env` file in the same directory as `docker-compose.yml`:

```bash
# === REQUIRED ===
DB_PASSWORD=your-strong-database-password-here
JWT_SECRET=generate-with-openssl-rand-base64-64

# === ADMIN CREDENTIALS ===
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-initial-admin-password

# === OPTIONAL ===
# SMTP_PASSWORD=your-smtp-password
```

Generate secure values:
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate database password
openssl rand -base64 32

# Generate admin password
openssl rand -base64 16
```

### 2.4 Startup Sequence

```bash
# 1. Create .env file with secrets
cp .env.example .env
# Edit .env with your values

# 2. Start all services
docker compose up -d

# 3. Verify health
docker compose ps
curl http://localhost:8080/health

# 4. View logs
docker compose logs -f rustpress

# 5. Access admin panel
# Open: http://localhost:8080/admin
```

### 2.5 Startup Flow (Internal)

```
docker compose up
    │
    ├── postgres starts → healthcheck passes
    ├── redis starts → healthcheck passes
    │
    └── rustpress starts
        │
        ├── entrypoint.sh
        │   ├── Wait for PostgreSQL (30 attempts, 2s interval)
        │   ├── Run SQL migrations (00001–00030)
        │   ├── Seed admin user (if no users exist)
        │   └── Seed default site options (if none exist)
        │
        └── rustpress binary
            ├── Load config (file → env override → CLI override)
            ├── Connect to PostgreSQL (pool: 2-10 connections)
            ├── Initialize moka cache (10K entries, 1hr TTL)
            ├── Initialize event bus
            ├── Initialize job queue
            ├── Initialize local storage (/app/uploads)
            ├── Initialize JWT manager
            ├── Build AppState
            ├── Load plugins from /app/plugins/
            ├── Scan themes from /app/themes/
            ├── Discover apps from /app/apps/
            ├── Bind TCP listener on 0.0.0.0:8080
            └── Serve requests
```

---

## 3. Binary Deployment

### 3.1 Prerequisites

- PostgreSQL 16 (installed and running)
- Redis 7 (optional but recommended)
- Linux x86_64 (or build from source for other platforms)

### 3.2 Steps

```bash
# 1. Download release binary
wget https://github.com/rustpress-net/core/releases/download/v0.4.0/rustpress-linux-x86_64.tar.gz
tar xzf rustpress-linux-x86_64.tar.gz

# 2. Create directory structure
mkdir -p /opt/rustpress/{config,themes,uploads,logs,migrations,admin-ui,plugins}

# 3. Copy binaries
cp rustpress /opt/rustpress/
cp rustpress-cli /opt/rustpress/
cp rustpress-migrate /opt/rustpress/

# 4. Copy assets
cp -r admin-ui/dist /opt/rustpress/admin-ui/
cp -r themes/* /opt/rustpress/themes/
cp -r migrations/* /opt/rustpress/migrations/
cp -r plugins/* /opt/rustpress/plugins/

# 5. Create config file
cat > /opt/rustpress/config/rustpress.toml << 'EOF'
[database]
database_url = "postgres://rustpress:password@localhost:5432/rustpress"

[server]
host = "0.0.0.0"
port = 8080

[auth]
jwt_secret = "YOUR-64-CHAR-SECRET-HERE"
EOF

# 6. Create database
sudo -u postgres psql -c "CREATE USER rustpress WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE rustpress OWNER rustpress;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rustpress TO rustpress;"

# 7. Run migrations
cd /opt/rustpress
DATABASE_URL="postgres://rustpress:password@localhost:5432/rustpress" ./rustpress-migrate

# 8. Start server
cd /opt/rustpress
./rustpress --host 0.0.0.0 --port 8080
```

### 3.3 Systemd Service

```ini
# /etc/systemd/system/rustpress.service
[Unit]
Description=RustPress CMS
Documentation=https://rustpress.net/docs
After=network.target postgresql.service redis.service
Requires=postgresql.service
Wants=redis.service

[Service]
Type=simple
User=rustpress
Group=rustpress
WorkingDirectory=/opt/rustpress
ExecStart=/opt/rustpress/rustpress
Restart=always
RestartSec=5
TimeoutStopSec=30

# Environment
Environment=DATABASE_URL=postgres://rustpress:password@localhost:5432/rustpress
Environment=JWT_SECRET=YOUR-SECRET-HERE
Environment=RUST_LOG=rustpress=info,tower_http=info,sqlx=warn
Environment=STORAGE_PATH=/opt/rustpress/uploads
Environment=THEMES_PATH=/opt/rustpress/themes
Environment=ADMIN_UI_PATH=/opt/rustpress/admin-ui/dist

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/rustpress/uploads /opt/rustpress/logs
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictSUIDSGID=true
MemoryDenyWriteExecute=true

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable rustpress
sudo systemctl start rustpress
sudo systemctl status rustpress
```

---

## 4. Build from Source

### 4.1 Prerequisites

- Rust 1.75+ (via rustup)
- Node.js 18+ and npm
- PostgreSQL 16 (dev instance)
- pkg-config, libssl-dev (Linux)

### 4.2 Backend Build

```bash
cd rustpress-core-base

# Install Rust toolchain
rustup install 1.75
rustup default 1.75

# Build release (takes 5-15 minutes first time)
cargo build --release

# Binaries at:
# target/release/rustpress
# target/release/rustpress-cli
# target/release/rustpress-migrate
```

### 4.3 Frontend Build

```bash
cd rustpress-core-admin-ui

# Install dependencies
npm install

# Build for production
npm run build

# Output at: dist/
# Copy to backend:
cp -r dist/ ../rustpress-core-base/admin-ui/dist/
```

### 4.4 Docker Build

```bash
cd rustpress-core-base

# Build Docker image
docker build -t rustpress:local .

# Image should be < 100MB (target KPI)
docker images rustpress:local
```

---

## 5. Reverse Proxy Configuration

### 5.1 Nginx Configuration

```nginx
# /etc/nginx/sites-available/rustpress
server {
    listen 80;
    server_name cms.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cms.yourdomain.com;

    # === TLS Configuration ===
    ssl_certificate     /etc/letsencrypt/live/cms.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.yourdomain.com/privkey.pem;

    # Modern TLS only
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # SSL session caching
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # === Client Settings ===
    client_max_body_size 100M;  # Match media upload limit

    # === Static Asset Caching ===
    location /admin/assets/ {
        proxy_pass http://127.0.0.1:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /themes/ {
        proxy_pass http://127.0.0.1:8080;
        expires 7d;
        add_header Cache-Control "public";
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8080;
        expires 30d;
        add_header Cache-Control "public";
    }

    # === WebSocket Support ===
    location /api/v1/ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # === API and Admin ===
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # === Health check (no logging) ===
    location /health {
        proxy_pass http://127.0.0.1:8080;
        access_log off;
    }

    # === Deny access to sensitive files ===
    location ~ /\. {
        deny all;
        return 404;
    }

    location ~ /config/ {
        deny all;
        return 404;
    }
}
```

### 5.2 Caddy Configuration (Auto-TLS)

```
# /etc/caddy/Caddyfile
cms.yourdomain.com {
    # Automatic TLS via Let's Encrypt

    # Static assets with long cache
    @static path /admin/assets/* /themes/* /uploads/*
    header @static Cache-Control "public, max-age=86400"

    # WebSocket
    @websocket {
        path /api/v1/ws
        header Connection *Upgrade*
        header Upgrade websocket
    }

    # Health checks (no log)
    @health path /health /health/*
    log @health {
        output discard
    }

    # Client body size limit
    request_body {
        max_size 100MB
    }

    # Proxy everything to RustPress
    reverse_proxy localhost:8080 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}

        # Health check for load balancing
        health_uri /health
        health_interval 30s
    }
}
```

---

## 6. Database Setup and Migration

### 6.1 PostgreSQL Configuration

```sql
-- Create user and database
CREATE USER rustpress WITH PASSWORD 'strong-password-here' CREATEDB;
CREATE DATABASE rustpress OWNER rustpress;

-- Required extensions
\c rustpress
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE rustpress TO rustpress;
GRANT ALL ON SCHEMA public TO rustpress;
```

### 6.2 PostgreSQL Performance Tuning

For a server with 4GB RAM:

```ini
# postgresql.conf additions
shared_buffers = 1GB              # 25% of RAM
effective_cache_size = 3GB        # 75% of RAM
work_mem = 16MB                   # Per-operation
maintenance_work_mem = 256MB      # For VACUUM, CREATE INDEX

max_connections = 100
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# For SSD storage
random_page_cost = 1.1
effective_io_concurrency = 200

# WAL settings
wal_level = replica               # For backups
max_wal_size = 4GB
min_wal_size = 1GB

# Logging
log_min_duration_statement = 200  # Log slow queries (>200ms)
log_checkpoints = on
log_connections = on
log_disconnections = on
```

### 6.3 Migration Management

The system has 10 migration files:

| File | Tables/Changes |
|------|---------------|
| 00001_initial_schema.sql | users, posts, pages, categories, tags, media, comments, settings, themes, menus, menu_items, widgets + indexes |
| 00002_sites_table.sql | sites (multi-site) |
| 00023_create_password_reset_tokens.sql | password_reset_tokens |
| 00024_add_missing_schema.sql | Additional columns, options table, revisions, user_meta |
| 00025_collaboration_and_chat.sql | Real-time collaboration tables |
| 00026_storage_configuration.sql | storage_configurations |
| 00027_block_library.sql | user_block_preferences |
| 00028_animations.sql | animations library |
| 00029_templates.sql | Template library system |
| 00030_media_library.sql | Media folders and optimization tracking |

**Migration execution:**
```bash
# Via entrypoint.sh (automatic in Docker)
# Tracks applied migrations in schema_migrations table

# Manual migration
DATABASE_URL="postgres://rustpress:pass@localhost:5432/rustpress" \
  ./rustpress-migrate
```

**Note**: Migration numbering has gaps (00002 to 00023). Ensure sequential execution is maintained.

---

## 7. Redis Configuration

### 7.1 Production Redis Config

```ini
# /etc/redis/redis.conf additions

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Security
requirepass your-redis-password
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""

# Network
bind 127.0.0.1
protected-mode yes
tcp-keepalive 300

# Logging
loglevel notice
```

### 7.2 Current Redis Usage in RustPress

Currently, Redis is **optional**. The default cache backend is `moka` (in-memory). To enable Redis:

1. Enable the `redis` feature in `rustpress-cache`:
   ```toml
   rustpress-cache = { path = "...", features = ["redis"] }
   ```
2. Set the Redis URL in configuration:
   ```toml
   [cache]
   backend = "redis"
   redis_url = "redis://localhost:6379"
   ```

**Note**: As of v0.4.0, the rate limiter uses the cache backend (moka by default), and the job queue uses PostgreSQL. Redis is not strictly required but is recommended for distributed caching in multi-instance deployments.

---

## 8. TLS/SSL Setup

### 8.1 Let's Encrypt with Certbot (for Nginx)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d cms.yourdomain.com

# Auto-renewal (cron)
sudo certbot renew --dry-run
# Certbot auto-installs renewal cron
```

### 8.2 Caddy (Automatic TLS)

Caddy handles TLS automatically. No additional setup required beyond the Caddyfile.

### 8.3 Self-Signed (Development/Testing)

```bash
# Generate self-signed cert
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout rustpress.key \
  -out rustpress.crt \
  -subj "/C=US/ST=State/L=City/O=RustPress/CN=localhost"
```

---

## 9. Backup Strategy

### 9.1 PostgreSQL Backup

```bash
# === Daily Full Backup ===
#!/bin/bash
# /opt/rustpress/scripts/backup.sh

BACKUP_DIR="/opt/backups/rustpress"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Full database dump (compressed)
pg_dump -U rustpress -Fc rustpress > $BACKUP_DIR/db_$DATE.dump

# Upload directory backup
tar czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/rustpress/uploads/

# Theme backup
tar czf $BACKUP_DIR/themes_$DATE.tar.gz /opt/rustpress/themes/

# Config backup (encrypt sensitive data)
tar czf $BACKUP_DIR/config_$DATE.tar.gz /opt/rustpress/config/

# Clean old backups
find $BACKUP_DIR -name "*.dump" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

```bash
# Crontab entry (daily at 2 AM)
0 2 * * * /opt/rustpress/scripts/backup.sh >> /var/log/rustpress-backup.log 2>&1
```

### 9.2 PostgreSQL WAL Archiving (Point-in-Time Recovery)

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /opt/backups/wal/%f'
```

### 9.3 Restore Procedure

```bash
# 1. Stop RustPress
sudo systemctl stop rustpress

# 2. Restore database
pg_restore -U rustpress -d rustpress --clean /opt/backups/rustpress/db_YYYYMMDD_HHMMSS.dump

# 3. Restore uploads
tar xzf /opt/backups/rustpress/uploads_YYYYMMDD_HHMMSS.tar.gz -C /

# 4. Restore themes
tar xzf /opt/backups/rustpress/themes_YYYYMMDD_HHMMSS.tar.gz -C /

# 5. Start RustPress
sudo systemctl start rustpress
```

### 9.4 Docker Backup

```bash
# Database dump from container
docker exec rustpress-db pg_dump -U rustpress rustpress > backup.sql

# Volume backup
docker run --rm -v rustpress_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads.tar.gz -C /data .
```

---

## 10. Scaling Considerations

### 10.1 Single Instance (Most Deployments)

- Adequate for sites with < 1,000 concurrent users
- All components on one server
- Simplest to manage

### 10.2 Horizontal Scaling

```
                [Load Balancer]
               /       |       \
          [RP-1]    [RP-2]    [RP-3]
              \       |       /
               [PostgreSQL]
                    |
              [Redis Cluster]
                    |
            [Shared Storage]
            (S3/NFS/EFS)
```

Requirements for horizontal scaling:
1. **Switch cache to Redis** — Shared state across instances
2. **Switch storage to S3/Cloud** — Shared file storage
3. **Add session store to Redis** — Sticky sessions or shared sessions
4. **Use Redis for WebSocket hub** — Cross-instance real-time
5. **Use Redis for event bus** — Cross-instance events
6. **Use Redis for rate limiting** — Consistent limits across instances
7. **PostgreSQL read replicas** — Scale read-heavy workloads

### 10.3 Database Scaling

| Level | Strategy | When |
|-------|----------|------|
| 1 | Connection pooling (already done: 2-100 connections) | Default |
| 2 | PostgreSQL tuning (shared_buffers, work_mem) | > 100 concurrent users |
| 3 | Read replicas (via Patroni or RDS) | > 1,000 concurrent users |
| 4 | Connection pooler (PgBouncer) | > 500 concurrent connections |
| 5 | Partitioning (posts by date, media by type) | > 10M rows |

---

## 11. Production Deployment Checklist

### Pre-Deployment

- [ ] Generate strong JWT secret (64+ chars, `openssl rand -base64 64`)
- [ ] Generate strong database password (32+ chars)
- [ ] Set up PostgreSQL 16 with production tuning
- [ ] Configure Redis with password and memory limits
- [ ] Set up reverse proxy (Nginx or Caddy) with TLS
- [ ] Create non-root system user for RustPress
- [ ] Set file permissions (uploads writable, config readable only by app user)

### Deployment

- [ ] Deploy Docker Compose stack (or binary + systemd service)
- [ ] Verify migrations run successfully
- [ ] Verify health endpoints respond: `/health`, `/health/live`, `/health/ready`
- [ ] Verify admin UI loads at `/admin`
- [ ] Log in with seed admin credentials
- [ ] Change admin password immediately
- [ ] Configure email settings (if using transactional email)
- [ ] Install and activate desired theme
- [ ] Configure site settings (name, URL, timezone)

### Post-Deployment

- [ ] Set up automated backups (daily DB + uploads)
- [ ] Set up log rotation
- [ ] Set up monitoring (Prometheus + Grafana or similar)
- [ ] Configure alerting (health check failures, high error rates)
- [ ] Run security scan (OWASP ZAP)
- [ ] Verify HTTPS works correctly (testssl.sh)
- [ ] Test backup restore procedure
- [ ] Document recovery procedures for team

### Ongoing

- [ ] Apply OS security patches monthly
- [ ] Run `cargo audit` / `npm audit` on each release
- [ ] Review access logs for anomalies weekly
- [ ] Test backup restore quarterly
- [ ] Rotate JWT secret annually (or on suspected compromise)
- [ ] Review and rotate database credentials annually

---

## 12. Resource Requirements

### 12.1 Minimum (Small Personal Site)

| Resource | Specification |
|----------|--------------|
| CPU | 1 vCPU |
| RAM | 512MB (256MB RustPress + 128MB PostgreSQL + 64MB Redis + OS) |
| Disk | 10GB SSD (OS + app + small media library) |
| Network | 100Mbps |
| Target | < 100 daily visitors, < 10 posts |

### 12.2 Recommended (Medium Business Site)

| Resource | Specification |
|----------|--------------|
| CPU | 2 vCPU |
| RAM | 2GB (512MB RustPress + 1GB PostgreSQL + 256MB Redis + OS) |
| Disk | 50GB SSD (OS + app + media library + backups) |
| Network | 1Gbps |
| Target | < 10,000 daily visitors, < 1,000 posts |

### 12.3 Production (High-Traffic Site)

| Resource | Specification |
|----------|--------------|
| CPU | 4 vCPU |
| RAM | 8GB (1GB RustPress + 4GB PostgreSQL + 1GB Redis + OS) |
| Disk | 200GB SSD (OS + app + large media library + backups) |
| Network | 1Gbps |
| Target | < 100,000 daily visitors, 10,000+ posts |

---

## 13. Monitoring Setup

### 13.1 Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'rustpress'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
```

### 13.2 Key Metrics to Alert On

| Metric | Warning | Critical |
|--------|---------|----------|
| HTTP 5xx rate | > 1% of requests | > 5% of requests |
| Request latency P95 | > 200ms | > 500ms |
| DB connection pool utilization | > 80% | > 95% |
| Disk usage | > 80% | > 90% |
| Memory usage | > 80% | > 95% |
| Health check failures | 1 consecutive | 3 consecutive |

### 13.3 Log Aggregation

```bash
# Structured JSON logging
RUST_LOG=rustpress=info,tower_http=info,sqlx=warn

# Example log line:
# {"timestamp":"2026-03-02T12:00:00Z","level":"INFO","target":"rustpress","request_id":"01234567-89ab-cdef","method":"GET","uri":"/api/v1/posts","status":200,"duration_ms":12}
```

---

## 14. Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "Database connection failed" | PostgreSQL not running or wrong URL | Check `DATABASE_URL`, verify PostgreSQL is accepting connections |
| "Admin UI not found" | Missing `admin-ui/dist` directory | Build frontend and copy to `ADMIN_UI_PATH` |
| "JWT validation failed" | Secret mismatch between server restarts | Ensure `JWT_SECRET` is consistent across restarts |
| "Migration failed" | Missing UUID extension | Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` |
| "Port already in use" | Another service on port 8080 | Change `RUSTPRESS_PORT` or stop conflicting service |
| Container restarts in loop | Database not ready | Check `depends_on` conditions and health checks |
| Slow queries | Missing indexes or poor tuning | Check `log_min_duration_statement` and add indexes |
| File upload fails | Body size limit or permissions | Check `max_upload_size` config and directory permissions |

---

*End of Deployment Guide*
