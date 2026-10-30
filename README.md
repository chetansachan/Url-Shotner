# LinkPulse: High-Performance URL Shortener

High-concurrency URL shortener built with Go, PostgreSQL 16, Redis 7, and React + GSAP frontend.

## Quick Start

```bash
# 1. Start Backing Containers
docker compose up -d

# 2. Run Backend
cd backend
go run cmd/server/main.go

# 3. Run Frontend
cd ../frontend
pnpm install
pnpm dev
```
