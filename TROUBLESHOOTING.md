# ProjectHub Troubleshooting Guide

This guide covers common issues and their solutions when deploying ProjectHub.

## Table of Contents
- [Authentication Issues](#authentication-issues)
- [Database Connection Issues](#database-connection-issues)
- [Docker Networking Issues](#docker-networking-issues)
- [Common Deployment Errors](#common-deployment-errors)

## Authentication Issues

### Problem: Login endpoint hangs or times out

**Symptoms:**
- `curl` to `/api/auth/login` hangs indefinitely
- Browser shows loading spinner forever
- No response from authentication endpoint

**Solution:**
```bash
# 1. Check if JWT_SECRET is set
docker exec projecthub-backend env | grep JWT_SECRET

# 2. If missing, recreate container with JWT_SECRET
docker stop projecthub-backend
docker rm projecthub-backend
docker run -d --name projecthub-backend \
  -p 3009:3010 \
  --network projecthub_projecthub-network \
  -e DATABASE_URL="postgresql://projecthub:projecthub123@projecthub-postgres:5432/projecthub" \
  -e JWT_SECRET="your-secure-jwt-secret-here" \
  -e CORS_ORIGIN="*" \
  --restart unless-stopped \
  anubissbe/projecthub:latest
```

### Problem: "Invalid credentials" error

**Symptoms:**
- Login returns 401 Unauthorized
- Correct email/password still fails

**Solution:**
```bash
# Update admin password to bcrypt hash of 'admin123'
docker exec projecthub-postgres psql -U projecthub -d projecthub -c \
  "UPDATE users SET password = '\$2a\$10\$ILQeDcYjXZBPJDIAiA.PnOgs1rqZaYecV5dVLmjKdoFViZGX1W1.W' WHERE email = 'admin@projecthub.com';"

# Test login
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projecthub.com","password":"admin123"}'
```

### Problem: Task updates return 401 Unauthorized

**Symptoms:**
- Can't update tasks even when logged in
- PUT requests to `/api/tasks/:id` fail

**Solution:**
Ensure you're including the JWT token in your requests:
```javascript
// Include Authorization header
fetch('/api/tasks/task-id', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'completed' })
});
```

## Database Connection Issues

### Problem: "connect ETIMEDOUT" error

**Symptoms:**
- Backend logs show: `Error: connect ETIMEDOUT 192.168.1.24:5434`
- Database connection fails

**Solution:**
```bash
# 1. Check if PostgreSQL is running
docker ps | grep postgres

# 2. Ensure containers are on same network
docker network ls
docker network inspect projecthub_projecthub-network

# 3. Fix DATABASE_URL to use container name
docker stop projecthub-backend
docker rm projecthub-backend
docker run -d --name projecthub-backend \
  -p 3009:3010 \
  --network projecthub_projecthub-network \
  -e DATABASE_URL="postgresql://projecthub:projecthub123@projecthub-postgres:5432/projecthub" \
  -e JWT_SECRET="your-secure-jwt-secret-here" \
  -e CORS_ORIGIN="*" \
  --restart unless-stopped \
  anubissbe/projecthub:latest
```

### Problem: "column does not exist" errors

**Symptoms:**
- Error: `column "progress" of relation "tasks" does not exist`
- Database schema mismatch

**Solution:**
```bash
# Check current schema
docker exec projecthub-postgres psql -U projecthub -d projecthub -c "\d tasks"

# If columns are missing, check init.sql was properly executed
docker logs projecthub-postgres | grep "CREATE TABLE"

# Manually add missing columns if needed
docker exec projecthub-postgres psql -U projecthub -d projecthub -c \
  "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;"
```

## Docker Networking Issues

### Problem: "Cannot link to container" error

**Symptoms:**
- Error: `Cannot link to /projecthub-postgres, as it does not belong to the default network`
- Containers can't communicate

**Solution:**
```bash
# 1. List available networks
docker network ls

# 2. Use existing projecthub network
docker run -d --name projecthub-backend \
  -p 3009:3010 \
  --network projecthub_projecthub-network \
  -e DATABASE_URL="postgresql://projecthub:projecthub123@projecthub-postgres:5432/projecthub" \
  -e JWT_SECRET="your-secure-jwt-secret-here" \
  -e CORS_ORIGIN="*" \
  --restart unless-stopped \
  anubissbe/projecthub:latest

# 3. If network doesn't exist, create it
docker network create projecthub-network
docker network connect projecthub-network projecthub-postgres
docker network connect projecthub-network projecthub-backend
docker network connect projecthub-network projecthub-frontend
```

### Problem: Frontend can't reach backend

**Symptoms:**
- API calls fail with network errors
- CORS errors in browser console

**Solution:**
```bash
# 1. Ensure CORS is properly configured
docker exec projecthub-backend env | grep CORS_ORIGIN

# 2. Check if backend is accessible
curl http://localhost:3009/health

# 3. Update frontend API URL if needed
docker stop projecthub-frontend
docker rm projecthub-frontend
docker run -d --name projecthub-frontend \
  -p 5174:80 \
  --network projecthub_projecthub-network \
  -e API_URL="http://localhost:3009" \
  --restart unless-stopped \
  anubissbe/projecthub-frontend:latest
```

## Common Deployment Errors

### Problem: Ports already in use

**Symptoms:**
- Error: `bind: address already in use`
- Can't start containers

**Solution:**
```bash
# Find what's using the ports
sudo lsof -i :3009
sudo lsof -i :5174
sudo lsof -i :5433

# Use different ports in docker-compose.yml or .env:
BACKEND_PORT=3010
FRONTEND_PORT=5175
POSTGRES_PORT=5434
```

### Problem: Container keeps restarting

**Symptoms:**
- `docker ps` shows container restarting
- Logs show repeated startup attempts

**Solution:**
```bash
# 1. Check logs for errors
docker logs projecthub-backend --tail=50

# 2. Common fixes:
# - Ensure JWT_SECRET is set
# - Check DATABASE_URL format
# - Verify PostgreSQL is healthy
docker ps | grep postgres

# 3. Remove and recreate with correct config
docker stop projecthub-backend
docker rm projecthub-backend
# Then run with proper environment variables
```

### Problem: "Invalid module" or dependency errors

**Symptoms:**
- Error: `Cannot find module 'bcryptjs'`
- Missing dependencies

**Solution:**
```bash
# Pull latest image
docker pull anubissbe/projecthub:latest

# Or rebuild locally
cd ProjectHub-Mcp
docker-compose build --no-cache
docker-compose up -d
```

## Quick Health Check Script

Save this as `check-health.sh`:

```bash
#!/bin/bash

echo "🔍 Checking ProjectHub Health..."

# Check if containers are running
echo -e "\n📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep projecthub

# Check database connection
echo -e "\n🗄️ Database Connection:"
docker exec projecthub-backend node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.log('❌ Database Error:', err.message);
  else console.log('✅ Database Connected:', res.rows[0].now);
  pool.end();
});" 2>/dev/null || echo "❌ Backend container not running"

# Check API health
echo -e "\n🌐 API Health:"
curl -s http://localhost:3009/health | jq . || echo "❌ API not responding"

# Check authentication
echo -e "\n🔐 Authentication Test:"
curl -s -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projecthub.com","password":"admin123"}' | \
  jq -r 'if .token then "✅ Authentication working" else "❌ Authentication failed: " + .error end'

echo -e "\n✨ Health check complete!"
```

Make it executable: `chmod +x check-health.sh`

## Getting Help

If you're still experiencing issues:

1. **Check logs thoroughly:**
   ```bash
   docker-compose logs -f --tail=100
   ```

2. **Verify environment variables:**
   ```bash
   docker exec projecthub-backend env | sort
   ```

3. **Open an issue on GitHub:**
   - Include full error messages
   - Share your docker-compose.yml (without secrets)
   - Describe steps to reproduce

4. **Join our community:**
   - GitHub Discussions: https://github.com/anubissbe/ProjectHub-Mcp/discussions
   - Report bugs: https://github.com/anubissbe/ProjectHub-Mcp/issues