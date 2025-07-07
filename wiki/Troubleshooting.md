# 🔧 Troubleshooting Guide

This comprehensive troubleshooting guide helps you diagnose and resolve common issues with **ProjectHub-MCP v5.0.0**.

## 🤔 General Troubleshooting Steps

### Before You Start
1. **Check system requirements**: Docker 20.10+, 4GB RAM minimum
2. **Update to latest version**: Many issues are fixed in newer releases  
3. **Check logs**: Always start with application and system logs
4. **Try minimal reproduction**: Isolate the issue to specific actions

### Quick Diagnostic Commands
```bash
# Check if services are running
docker-compose ps

# View logs for all services
docker-compose logs

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Test API connectivity
curl http://localhost:3009/health

# Check database connection
docker exec projecthub-postgres pg_isready -U projecthub
```

## 🚀 Installation and Startup Issues

### Application Won't Start

**Symptom**: Docker containers fail to start or crash immediately

**1. Port Conflicts**
```bash
# Check what's using required ports
sudo lsof -i :3009  # Backend port
sudo lsof -i :5174  # Frontend port
sudo lsof -i :5433  # PostgreSQL port

# Kill conflicting processes
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "3010:3010"  # Use different external port
```

**2. Docker Issues**
```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check Docker resources
docker system df
docker system prune -f  # Clean up unused resources

# Rebuild containers
docker-compose down -v
docker-compose up -d --build
```

**3. Permission Issues**
```bash
# Fix file permissions (Linux/Mac)
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

**4. Insufficient Resources**
```bash
# Check available memory
free -h

# Check disk space
df -h

# Increase Docker memory limits in Docker Desktop
# Settings > Resources > Memory: 4GB minimum
```

### Database Connection Issues

**Symptom**: "Database connection failed" or timeout errors

**1. PostgreSQL Not Running**
```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Start PostgreSQL specifically
docker-compose up -d postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

**2. JWT Secret Missing**
```bash
# Check if JWT_SECRET is set
grep JWT_SECRET .env

# Generate and set JWT secret
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Restart backend
docker-compose restart backend
```

**3. Database Initialization Problems**
```bash
# Reset database completely (DESTRUCTIVE!)
docker-compose down -v
docker volume rm projecthub_projecthub-db
docker-compose up -d

# Check initialization logs
docker-compose logs postgres | grep -i error
```

## 🌐 Frontend Issues

### Page Won't Load

**Symptom**: Browser shows "This site can't be reached" or similar

**1. Frontend Service Issues**
```bash
# Check if frontend is running
docker-compose ps frontend

# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

**2. Network Issues**
```bash
# Check Docker networks
docker network ls
docker network inspect projecthub_projecthub-network

# Restart networking
docker-compose down
docker-compose up -d
```

**3. Browser Cache Issues**
```bash
# Hard refresh
Ctrl+F5 (Windows/Linux)
Cmd+Shift+R (Mac)

# Clear browser cache or try incognito/private mode
```

### Kanban Board Not Updating (FIXED in v5.0.0)

**Symptom**: Tasks don't update when switching between projects

**This was a major bug fixed in v5.0.0. If you're still experiencing this:**

```bash
# 1. Update to latest frontend image
docker pull anubissbe/projecthub-frontend:latest

# 2. Restart frontend container
docker-compose down frontend
docker-compose up -d frontend

# 3. Clear browser cache
Ctrl+F5 or Cmd+Shift+R

# 4. Verify fix worked
# Navigate to Board view, select different projects
# Tasks should update correctly
```

### UI Not Loading or Broken

**Symptom**: Page loads but components are missing or broken

**1. API Connection Issues**
```bash
# Test API directly
curl http://localhost:3009/health
curl http://localhost:3009/api/projects

# Check browser console for errors (F12 > Console)
```

**2. CORS Configuration Issues**
```bash
# Verify CORS_ORIGIN in .env
echo "CORS_ORIGIN=http://localhost:5174" >> .env

# Restart backend
docker-compose restart backend

# Test CORS
curl -H "Origin: http://localhost:5174" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:3009/api/auth/login
```

## 🖥️ Backend Issues

### API Errors

**Symptom**: API requests fail with 500 errors or timeouts

**1. Server Errors**
```bash
# Check backend logs for errors
docker-compose logs backend | grep -i error

# Common error patterns:
# - "JWT_SECRET is required"
# - "Database connection failed"
# - "ECONNREFUSED"
```

**2. Task Update Errors (FIXED in v5.0.0)**

**This was a major bug fixed in v5.0.0. If you're still getting "Internal Server Error" when updating tasks:**

```bash
# 1. Update to latest backend image
docker pull anubissbe/projecthub-backend:latest

# 2. Restart backend container
docker-compose restart backend

# 3. Test task update
curl -X PUT http://localhost:3009/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated Task"}'
```

**3. Authentication Issues**
```bash
# Check if admin user exists
docker exec projecthub-postgres psql -U projecthub -d projecthub \
  -c "SELECT email, created_at FROM users WHERE email = 'admin@projecthub.com';"

# Reset admin password if needed
docker exec projecthub-postgres psql -U projecthub -d projecthub \
  -c "UPDATE users SET password = '\$2a\$10\$ILQeDcYjXZBPJDIAiA.PnOgs1rqZaYecV5dVLmjKdoFViZGX1W1.W' WHERE email = 'admin@projecthub.com';"

# Test login
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projecthub.com","password":"admin123"}'
```

## 📊 Database Issues

### Connection Pool Exhaustion

**Symptom**: "too many clients already" errors

**1. Check Connection Usage**
```sql
-- Connect to database
docker exec -it projecthub-postgres psql -U projecthub -d projecthub

-- Check active connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Find long-running queries
SELECT now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

**2. Restart Database**
```bash
# Quick fix - restart PostgreSQL
docker-compose restart postgres

# Wait for it to be ready
sleep 10
docker exec projecthub-postgres pg_isready -U projecthub
```

### Slow Query Performance

**Symptom**: API requests are very slow

**1. Check Query Performance**
```sql
-- Connect to database
docker exec -it projecthub-postgres psql -U projecthub -d projecthub

-- Check for slow queries (requires pg_stat_statements extension)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Update table statistics
ANALYZE;

-- Vacuum database
VACUUM ANALYZE;
```

### Data Inconsistency

**Symptom**: Analytics show wrong data or inconsistent counts

**This was improved in v5.0.0 with real-time calculations:**

```bash
# 1. Check if using latest backend
docker-compose logs backend | head -5

# 2. Refresh analytics data
curl http://localhost:3009/api/analytics

# 3. Restart backend to clear cache
docker-compose restart backend
```

## 🚑 Performance Issues

### Slow Loading Times

**Symptom**: Pages take a long time to load

**1. Check Resource Usage**
```bash
# Monitor container resources
docker stats

# Check system resources
htop  # or top
free -h
df -h
```

**2. Optimize Database**
```sql
-- Connect to database
docker exec -it projecthub-postgres psql -U projecthub -d projecthub

-- Update table statistics
ANALYZE;

-- Vacuum database
VACUUM ANALYZE;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**3. Container Resource Limits**
```yaml
# Add to docker-compose.yml if needed
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 512M
```

## 🔒 Security Issues

### JWT Token Issues

**Symptom**: "Invalid token" or authentication fails

**1. Check JWT Configuration**
```bash
# Verify JWT_SECRET is set
grep JWT_SECRET .env

# Generate new secret if missing
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Restart backend
docker-compose restart backend
```

**2. Token Expiry**
```bash
# Check token expiry in browser console
# Tokens expire after 24 hours by default

# Clear browser storage and re-login
# F12 > Application > Storage > Clear storage
```

## 🆘 Emergency Recovery

### Complete Reset (Last Resort)

**When all else fails:**

```bash
# 1. Backup data (if possible)
docker exec projecthub-postgres pg_dump -U projecthub projecthub > backup_$(date +%Y%m%d).sql

# 2. Complete teardown
docker-compose down -v
docker system prune -af
docker volume prune -f

# 3. Fresh installation
git pull origin main
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "POSTGRES_PASSWORD=projecthub123" >> .env
docker-compose up -d

# 4. Wait for initialization
sleep 30

# 5. Verify health
curl http://localhost:3009/health
```

### Restore from Backup

```bash
# Stop application
docker-compose down

# Start only database
docker-compose up -d postgres

# Wait for database to be ready
sleep 10

# Restore backup
docker exec -i projecthub-postgres psql -U projecthub -d projecthub < backup.sql

# Start full application
docker-compose up -d
```

## 📄 Getting Help

### Information to Collect

When seeking help, please provide:

**System Information**:
```bash
# Operating system
uname -a

# Docker version
docker --version
docker-compose --version

# Available resources
free -h
df -h
```

**Application Logs**:
```bash
# All service logs
docker-compose logs > logs.txt

# Recent logs with timestamps
docker-compose logs --since 1h --timestamps > recent-logs.txt
```

**Configuration** (remove sensitive data):
```bash
# Environment variables
grep -v 'PASSWORD\|SECRET\|KEY' .env

# Docker status
docker-compose ps
```

### Where to Get Help

1. **GitHub Issues**: [Create an issue](https://github.com/anubissbe/ProjectHub-Mcp/issues)
2. **GitHub Discussions**: [Community support](https://github.com/anubissbe/ProjectHub-Mcp/discussions)  
3. **Documentation**: Check other wiki pages
4. **FAQ**: Common questions and answers

### Creating Good Bug Reports

**Include**:
- Clear description of the problem
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or videos if applicable
- System information and logs
- Version information (v5.0.0)

**Template**:
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## System Information
- OS: Ubuntu 22.04
- Docker: 24.0.0
- Browser: Chrome 120

## Logs
```
# Paste relevant log excerpts here
```

## Error Screenshots
[Attach screenshots if applicable]
```

---

## 🎯 Known Issues Fixed in v5.0.0

- ✅ **Kanban Board**: Project switching now works correctly
- ✅ **Task Updates**: No more "Internal Server Error" when updating tasks  
- ✅ **Analytics**: Real-time data calculation (no more mock data)
- ✅ **Security**: Improved JWT handling and bcrypt encryption
- ✅ **Docker**: Better health checks and container stability

**Remember**: Most issues can be resolved by checking logs, verifying configuration, and ensuring all services are running properly. The "turn it off and on again" approach often works with Docker containers!