# RustPress CMS — Infrastructure Cost Estimate

**Version**: 0.4.0 (MVP)
**Date**: 2026-03-02
**Author**: Infrastructure Engineer (INFRA), Full-Stack Team
**Status**: Research & Planning — Wave 2

---

## 1. Overview

This document estimates infrastructure costs for hosting RustPress CMS at three scale levels. All costs are monthly unless otherwise stated. RustPress is designed as a self-hosted CMS, so there are no SaaS fees or license costs. The application is open-source under MIT/Apache-2.0 dual license.

**Cost advantage of RustPress over WordPress**: Rust's low memory footprint (< 50MB idle) and high throughput (5K req/s target) means RustPress can handle significantly more traffic on smaller hardware than a comparable WordPress + PHP-FPM + MySQL stack.

---

## 2. Traffic Tiers

| Tier | Description | Daily Visitors | Posts | Media Storage | Concurrent Users |
|------|-------------|---------------|-------|---------------|------------------|
| Small | Personal blog, portfolio | < 500 | < 100 | < 1GB | < 10 |
| Medium | Business site, agency client | 500 - 10,000 | 100 - 5,000 | 1 - 20GB | 10 - 100 |
| Large | High-traffic content site | 10,000 - 100,000 | 5,000+ | 20 - 200GB | 100 - 1,000 |

---

## 3. Self-Hosted (Bare Metal / VPS)

### 3.1 Minimum Hardware Requirements

| Component | Small | Medium | Large |
|-----------|-------|--------|-------|
| CPU | 1 vCPU | 2 vCPU | 4+ vCPU |
| RAM | 512MB | 2GB | 8GB |
| Disk | 10GB SSD | 50GB SSD | 200GB SSD |
| Network | 100Mbps | 1Gbps | 1Gbps |

### 3.2 Resource Breakdown by Component

| Component | RAM (Small) | RAM (Medium) | RAM (Large) |
|-----------|------------|-------------|------------|
| RustPress binary | ~30MB idle | ~100MB loaded | ~256MB loaded |
| PostgreSQL | ~128MB | ~1GB | ~4GB |
| Redis | ~16MB | ~128MB | ~512MB |
| OS overhead | ~128MB | ~256MB | ~256MB |
| **Total** | **~302MB** | **~1.5GB** | **~5GB** |

---

## 4. Cloud Hosting Cost Comparison

### 4.1 Hetzner Cloud (Best Value)

Hetzner offers the best price-performance ratio for European and US hosting.

| Resource | Small | Medium | Large |
|----------|-------|--------|-------|
| Server | CX22 (2 vCPU, 4GB) | CX32 (4 vCPU, 8GB) | CX42 (8 vCPU, 16GB) |
| Server Cost | $4.49/mo | $8.49/mo | $16.49/mo |
| Disk (included) | 40GB SSD | 80GB SSD | 160GB SSD |
| Additional Disk | $0 | $0 | $4.80/mo (100GB volume) |
| Backups (20% addon) | $0.90/mo | $1.70/mo | $3.30/mo |
| IPv4 Address | Included | Included | Included |
| Bandwidth | 20TB included | 20TB included | 20TB included |
| **Monthly Total** | **$5.39** | **$10.19** | **$24.59** |
| **Annual Total** | **$64.68** | **$122.28** | **$295.08** |

**Managed Database addon** (optional):
- PostgreSQL: CPX11 (2 vCPU, 2GB) = $14.90/mo

### 4.2 DigitalOcean

| Resource | Small | Medium | Large |
|----------|-------|--------|-------|
| Droplet | Basic 1 vCPU, 1GB | Basic 2 vCPU, 2GB | Basic 4 vCPU, 8GB |
| Droplet Cost | $6/mo | $18/mo | $48/mo |
| Disk | 25GB SSD | 60GB SSD | 160GB SSD |
| Additional Disk | $0 | $0 | $10/mo (100GB block) |
| Backups (20%) | $1.20/mo | $3.60/mo | $9.60/mo |
| Bandwidth | 1TB | 3TB | 5TB |
| **Monthly Total** | **$7.20** | **$21.60** | **$67.60** |
| **Annual Total** | **$86.40** | **$259.20** | **$811.20** |

**Managed Database** (optional):
- PostgreSQL: 1 vCPU, 1GB = $15/mo
- Redis: 1 vCPU, 1GB = $15/mo

### 4.3 AWS (EC2 + RDS)

| Resource | Small | Medium | Large |
|----------|-------|--------|-------|
| EC2 Instance | t3.micro (1 vCPU, 1GB) | t3.small (2 vCPU, 2GB) | t3.medium (2 vCPU, 4GB) |
| EC2 Cost | $7.59/mo (reserved) | $15.18/mo (reserved) | $30.37/mo (reserved) |
| EBS (gp3) | $8/mo (100GB) | $8/mo (100GB) | $16/mo (200GB) |
| RDS PostgreSQL | N/A (use EC2) | db.t3.micro ($14.40/mo) | db.t3.small ($28.80/mo) |
| ElastiCache Redis | N/A (use EC2) | N/A (use EC2) | cache.t3.micro ($12.24/mo) |
| Data Transfer | 100GB free | $0 (within VPC) | $9/mo (est.) |
| **Monthly Total** | **$15.59** | **$37.58** | **$96.41** |
| **Annual Total** | **$187.08** | **$450.96** | **$1,156.92** |

Notes:
- Prices assume US East (N. Virginia) region
- Reserved instances (1-year, no upfront) provide ~25% savings
- On-demand is ~33% more expensive

### 4.4 Vultr

| Resource | Small | Medium | Large |
|----------|-------|--------|-------|
| Server | VC2 1 vCPU, 1GB | VC2 2 vCPU, 4GB | VC2 4 vCPU, 8GB |
| Server Cost | $6/mo | $24/mo | $48/mo |
| Disk | 25GB SSD | 80GB SSD | 160GB SSD |
| Bandwidth | 2TB | 3TB | 4TB |
| Backups | $1.20/mo | $4.80/mo | $9.60/mo |
| **Monthly Total** | **$7.20** | **$28.80** | **$57.60** |
| **Annual Total** | **$86.40** | **$345.60** | **$691.20** |

---

## 5. Comparison Table

### Monthly Cost Summary

| Provider | Small Site | Medium Site | Large Site |
|----------|-----------|-------------|------------|
| **Hetzner** | **$5.39** | **$10.19** | **$24.59** |
| Vultr | $7.20 | $28.80 | $57.60 |
| DigitalOcean | $7.20 | $21.60 | $67.60 |
| AWS (self-managed) | $15.59 | $37.58 | $96.41 |
| AWS (managed DB) | $15.59 | $37.58 | $96.41 |

### Annual Cost Summary

| Provider | Small Site | Medium Site | Large Site |
|----------|-----------|-------------|------------|
| **Hetzner** | **$64.68** | **$122.28** | **$295.08** |
| Vultr | $86.40 | $345.60 | $691.20 |
| DigitalOcean | $86.40 | $259.20 | $811.20 |
| AWS (self-managed) | $187.08 | $450.96 | $1,156.92 |

### vs. Equivalent WordPress Hosting

For comparison, equivalent WordPress hosting costs:

| Provider | Small Site | Medium Site | Large Site |
|----------|-----------|-------------|------------|
| Shared hosting (WP) | $5-10/mo | N/A (too slow) | N/A |
| Managed WP (Kinsta) | $35/mo | $70/mo | $300/mo |
| Managed WP (WP Engine) | $30/mo | $60/mo | $290/mo |
| Self-hosted WP (equiv. server) | $10-15/mo | $30-40/mo | $80-120/mo |

**Conclusion**: RustPress on Hetzner costs 50-80% less than equivalent WordPress managed hosting, while delivering significantly better performance due to Rust's efficiency.

---

## 6. Database Hosting Options

### 6.1 Self-Hosted PostgreSQL (Recommended for Most)

Running PostgreSQL on the same server or a dedicated server.

| Aspect | Cost | Notes |
|--------|------|-------|
| Software | $0 | Open source |
| Backup storage | $1-5/mo | Depends on data volume |
| Management | Your time | Updates, monitoring, backup |

### 6.2 Managed PostgreSQL

| Provider | Smallest Plan | Notes |
|----------|--------------|-------|
| Hetzner Managed DB | $14.90/mo | 2 vCPU, 2GB, backups included |
| DigitalOcean Managed DB | $15/mo | 1 vCPU, 1GB, daily backups |
| AWS RDS | $14.40/mo | db.t3.micro, reserved |
| Neon (serverless) | Free tier → $19/mo | Good for low-traffic sites |
| Supabase | Free tier → $25/mo | Includes auth, but RustPress has its own |

**Recommendation**: Self-hosted for cost-sensitive deployments. Managed for teams that want automated backups, failover, and maintenance.

### 6.3 Database-as-a-Service Comparison

| Feature | Self-Hosted | Hetzner Managed | DigitalOcean | AWS RDS |
|---------|------------|-----------------|--------------|---------|
| Auto backups | Manual | Daily | Daily | Daily |
| Point-in-time recovery | WAL setup | Included | Included | Included |
| Failover | Manual | Manual | Included (HA) | Multi-AZ |
| Scaling | Manual | Manual | Resize | Resize |
| Monitoring | DIY | Basic | Basic | CloudWatch |
| Cost (min) | $0 | $14.90/mo | $15/mo | $14.40/mo |

---

## 7. CDN Costs

### 7.1 Cloudflare (Recommended)

| Plan | Cost | Features |
|------|------|----------|
| Free | $0 | DNS, basic CDN, DDoS protection, SSL |
| Pro | $20/mo | WAF, image optimization, analytics |
| Business | $200/mo | Custom WAF rules, SLA |

**Recommendation**: Cloudflare Free tier is sufficient for most RustPress deployments. It provides free SSL, CDN caching, and DDoS protection.

### 7.2 BunnyCDN

| Usage | Cost | Notes |
|-------|------|-------|
| < 1TB/mo | ~$10/mo | Pay-per-use, $0.01/GB (NA/EU) |
| 1-10TB/mo | ~$50-100/mo | Volume pricing |
| Storage | $0.01/GB/mo | For stored assets |

### 7.3 AWS CloudFront

| Usage | Cost | Notes |
|-------|------|-------|
| < 1TB/mo | ~$8.50 | First 10TB: $0.085/GB |
| 1-10TB/mo | $85-425 | Decreasing per-GB |
| Free tier (first year) | 1TB free | 50GB storage |

### 7.4 CDN Comparison

| CDN | Small Site | Medium Site | Large Site |
|-----|-----------|-------------|------------|
| **Cloudflare Free** | **$0** | **$0** | **$0** |
| BunnyCDN | $1-5 | $10-30 | $50-100 |
| CloudFront | $0 (free tier) | $8-40 | $85-200 |
| No CDN | $0 | $0 | $0 (not recommended) |

---

## 8. Additional Cost Considerations

### 8.1 Domain Registration

| Registrar | .com | .dev | .io |
|-----------|------|------|-----|
| Cloudflare Registrar | $10/yr | $12/yr | $34/yr |
| Namecheap | $9/yr | $13/yr | $33/yr |
| Google Domains | $12/yr | $12/yr | $60/yr |

### 8.2 Email Service (Transactional)

| Provider | Free Tier | Paid |
|----------|-----------|------|
| Resend | 3,000 emails/mo | $20/mo (50K emails) |
| SendGrid | 100 emails/day | $15/mo (50K emails) |
| Mailgun | 1,000 emails/mo (trial) | $35/mo (50K emails) |
| Amazon SES | 62,000/mo (from EC2) | $0.10/1000 emails |
| Self-hosted (Postfix) | Unlimited | $0 + server cost |

**Recommendation**: Amazon SES ($0.10/1000 emails) or Resend free tier for most deployments.

### 8.3 Monitoring and Observability

| Tool | Free Tier | Paid |
|------|-----------|------|
| Prometheus + Grafana (self-hosted) | $0 | Server resources |
| Grafana Cloud | 10K metrics, 50GB logs | $29/mo |
| Datadog | N/A | $15/host/mo |
| UptimeRobot | 50 monitors | $7/mo |
| Better Stack | 10 monitors | $24/mo |

**Recommendation**: Self-hosted Prometheus + Grafana ($0) with UptimeRobot free tier for uptime monitoring.

### 8.4 SSL/TLS Certificates

| Provider | Cost |
|----------|------|
| Let's Encrypt (via Certbot/Caddy) | **$0** |
| Cloudflare (via proxy) | $0 |
| Commercial (DigiCert, Sectigo) | $50-500/yr |

**Recommendation**: Let's Encrypt or Cloudflare. Never pay for SSL certificates for a CMS.

### 8.5 Object Storage (Media Backups)

| Provider | Cost per GB/mo | Notes |
|----------|---------------|-------|
| Hetzner Object Storage | $0.0052 | S3-compatible |
| Backblaze B2 | $0.005 | 10GB free |
| Wasabi | $0.0059 | No egress fees |
| AWS S3 | $0.023 | Most popular |
| DigitalOcean Spaces | $5/mo flat (250GB) | Simple pricing |

---

## 9. Total Cost of Ownership

### 9.1 Small Site (Personal Blog)

Optimized for lowest cost while maintaining reliability.

| Item | Monthly | Annual |
|------|---------|--------|
| Hetzner CX22 (2 vCPU, 4GB) | $4.49 | $53.88 |
| Hetzner Backups | $0.90 | $10.80 |
| Cloudflare (free) | $0 | $0 |
| Let's Encrypt | $0 | $0 |
| Domain (.com) | $0.83 | $10 |
| Email (SES / free tier) | $0 | $0 |
| Monitoring (self-hosted) | $0 | $0 |
| **Total** | **$6.22** | **$74.68** |

### 9.2 Medium Site (Business / Agency)

Balanced cost and reliability with managed services.

| Item | Monthly | Annual |
|------|---------|--------|
| Hetzner CX32 (4 vCPU, 8GB) | $8.49 | $101.88 |
| Hetzner Backups | $1.70 | $20.40 |
| Cloudflare Pro | $20 | $240 |
| Let's Encrypt | $0 | $0 |
| Domain (.com) | $0.83 | $10 |
| Transactional email (Resend) | $0 (free tier) | $0 |
| UptimeRobot (free) | $0 | $0 |
| Offsite backup (Backblaze 50GB) | $0.25 | $3 |
| **Total** | **$31.27** | **$375.28** |

### 9.3 Large Site (High-Traffic Content)

Performance and reliability optimized with redundancy.

| Item | Monthly | Annual |
|------|---------|--------|
| Hetzner CX42 (8 vCPU, 16GB) | $16.49 | $197.88 |
| Hetzner additional volume (100GB) | $4.80 | $57.60 |
| Hetzner Backups | $3.30 | $39.60 |
| Hetzner Managed PostgreSQL | $14.90 | $178.80 |
| Cloudflare Pro | $20 | $240 |
| Let's Encrypt | $0 | $0 |
| Domain (.com) | $0.83 | $10 |
| Transactional email (SES) | $5 | $60 |
| Monitoring (Grafana Cloud) | $29 | $348 |
| Offsite backup (Backblaze 200GB) | $1 | $12 |
| **Total** | **$95.32** | **$1,143.88** |

---

## 10. Cost Optimization Tips

1. **Use Hetzner for best value** — 50-75% cheaper than AWS/DigitalOcean for equivalent specs
2. **Use Cloudflare free tier** — Free CDN, DDoS protection, and SSL
3. **Self-host PostgreSQL** — Managed DB adds $15-30/mo; self-hosted is $0
4. **Skip Redis initially** — moka in-memory cache is sufficient for single-instance deployments
5. **Use Caddy for auto-TLS** — Zero config TLS, no renewal scripts needed
6. **Compress media on upload** — RustPress has built-in WebP/AVIF conversion (rustpress-media)
7. **Enable Cloudflare caching** — Reduces server load and bandwidth costs
8. **Use reserved instances on AWS** — 25-40% savings vs on-demand
9. **Monitor resource usage** — Downsize if CPU/RAM consistently underutilized
10. **Batch backup uploads** — Upload daily to cold storage instead of continuous sync

---

## 11. Cost Comparison: RustPress vs WordPress

### For a Medium Business Site (~5,000 daily visitors)

| Component | WordPress (Managed) | WordPress (Self-hosted) | RustPress |
|-----------|-------------------|------------------------|-----------|
| Hosting | $70/mo (Kinsta) | $18/mo (DO 2vCPU/2GB) | $10.19/mo (Hetzner) |
| PHP-FPM workers | Included | Needs tuning | N/A (Rust async) |
| MySQL/MariaDB | Included | Same server | PostgreSQL (same) |
| Redis (page cache) | Included | $0 (self-managed) | $0 (moka default) |
| CDN | Included (Kinsta CDN) | $0 (Cloudflare free) | $0 (Cloudflare free) |
| SSL | Included | $0 (Let's Encrypt) | $0 (Let's Encrypt) |
| Plugin licenses | $50-200/mo | $50-200/mo | $0 (open source) |
| Security (Wordfence/Sucuri) | $10-25/mo | $10-25/mo | $0 (built-in) |
| Backups | Included | $0-5/mo (manual) | $1.70/mo |
| **Monthly Total** | **$130-295** | **$78-248** | **$11.89** |
| **Annual Total** | **$1,560-3,540** | **$936-2,976** | **$142.68** |

**RustPress saves**: 90-96% vs managed WordPress, 85-95% vs self-hosted WordPress.

The savings come from:
- No PHP runtime overhead (Rust binary is more efficient)
- No plugin licensing costs
- No separate security plugin costs
- Smaller server required due to lower resource usage
- Built-in caching eliminates Redis requirement for basic setups

---

*End of Cost Estimate*
