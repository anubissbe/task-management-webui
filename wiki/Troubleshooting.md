# Troubleshooting Guide

This comprehensive troubleshooting guide helps you diagnose and resolve common issues with the Task Management WebUI.

## 🤔 General Troubleshooting Steps

### Before You Start
1. **Check system requirements**: Ensure you meet minimum requirements
2. **Update to latest version**: Many issues are fixed in newer releases
3. **Check logs**: Always start with application and system logs
4. **Try minimal reproduction**: Isolate the issue to specific actions

### Quick Diagnostic Commands
```bash
# Check if services are running
docker compose ps

# View logs for all services
docker compose logs

# Check specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Test API connectivity
curl http://localhost:3001/api/health

# Check database connection
docker exec -it task-management-postgres psql -U mcp_user -d mcp_learning -c "SELECT 1;"
```

## 🚀 Installation and Startup Issues

### Application Won't Start

**Symptom**: Docker containers fail to start or crash immediately

**Common Causes & Solutions**:

**1. Port Conflicts**
```bash
# Check what's using required ports
lsof -i :3001  # Backend port
lsof -i :5173  # Frontend port
lsof -i :5432  # PostgreSQL port

# Kill conflicting processes
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "3002:3001"  # Use different external port
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
docker compose down
docker compose up -d --build
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

**Solutions**:

**1. PostgreSQL Not Running**
```bash
# Check if PostgreSQL container is running
docker compose ps postgres

# Start PostgreSQL specifically
docker compose up -d postgres

# Check PostgreSQL logs
docker compose logs postgres
```

**2. Connection String Issues**
```bash
# Verify environment variables
cat .env | grep DATABASE_URL

# Test connection manually
docker exec -it task-management-postgres psql \
  -U mcp_user -d mcp_learning -c "SELECT current_database();"
```

**3. Database Initialization Problems**
```bash
# Reset database completely
docker compose down -v
docker volume rm task-management-webui_postgres_data
docker compose up -d postgres

# Check initialization logs
docker compose logs postgres | grep -i error
```

### Environment Configuration

**Symptom**: Services start but features don't work correctly

**Solutions**:

**1. Missing or Incorrect Environment Variables**
```bash
# Copy template if .env doesn't exist
cp .env.example .env

# Verify required variables
grep -E '^[^#]' .env

# Common required variables:
# DATABASE_URL=postgresql://mcp_user:mcp_secure_password_2024@postgres:5432/mcp_learning
# NODE_ENV=development
# VITE_API_URL=http://localhost:3001/api
```

**2. Network Connectivity Issues**
```bash
# Check Docker network
docker network ls
docker network inspect task-management-webui_default

# Test internal connectivity
docker exec task-management-backend curl http://postgres:5432
```

## 🌐 Frontend Issues

### Page Won't Load

**Symptom**: Browser shows "This site can't be reached" or similar

**Solutions**:

**1. Frontend Service Issues**
```bash
# Check if frontend is running
docker compose ps frontend

# Check frontend logs
docker compose logs frontend

# Restart frontend
docker compose restart frontend
```

**2. Build Issues**
```bash
# Rebuild frontend
cd frontend
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

**3. Browser Cache Issues**
```bash
# Hard refresh
Ctrl+F5 (Windows/Linux)
Cmd+Shift+R (Mac)

# Clear browser cache
# Or try incognito/private mode
```

### UI Not Loading or Broken

**Symptom**: Page loads but components are missing or broken

**Solutions**:

**1. API Connection Issues**
```bash
# Test API directly
curl http://localhost:3001/api/health
curl http://localhost:3001/api/projects

# Check browser console for errors
# F12 > Console tab
```

**2. JavaScript Errors**
```bash
# Check browser console (F12)
# Look for red error messages

# Common fixes:
# - Update VITE_API_URL in .env
# - Verify CORS settings
# - Check for ad blockers
```

**3. CSS/Styling Issues**
```bash
# Verify Tailwind CSS compilation
cd frontend
npm run build

# Check for missing dependencies
npm install

# Clear browser cache
```

### Real-time Updates Not Working

**Symptom**: Changes by other users don't appear automatically

**Solutions**:

**1. WebSocket Connection Issues**
```bash
# Check browser console for WebSocket errors
# F12 > Console > Look for "WebSocket connection failed"

# Verify WebSocket URL in .env
VITE_WS_URL=ws://localhost:3001

# Test WebSocket manually
# Browser Console:
# new WebSocket('ws://localhost:3001')
```

**2. Firewall/Proxy Issues**
```bash
# Check if WebSocket traffic is blocked
# Try disabling firewall temporarily

# For corporate networks:
# Contact IT about WebSocket support
# Use HTTPS/WSS in production
```

## 🖥️ Backend Issues

### API Errors

**Symptom**: API requests fail with 500 errors or timeouts

**Solutions**:

**1. Server Errors**
```bash
# Check backend logs
docker compose logs backend

# Look for error patterns:
# - Database connection errors
# - Unhandled exceptions
# - Memory issues
```

**2. Database Query Issues**
```bash
# Check for slow queries
docker exec -it task-management-postgres psql \
  -U mcp_user -d mcp_learning \
  -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check database connections
docker exec -it task-management-postgres psql \
  -U mcp_user -d mcp_learning \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

**3. Memory Issues**
```bash
# Check container memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

### CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solutions**:

**1. Development CORS**
```bash
# Verify CORS_ORIGIN in backend .env
CORS_ORIGIN=http://localhost:5173

# For multiple origins:
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**2. Production CORS**
```bash
# Set production domain
CORS_ORIGIN=https://yourdomain.com

# Verify in backend logs:
# "CORS enabled for: https://yourdomain.com"
```

### Authentication Issues (Future Feature)

**Note**: Authentication is not implemented in v1.0.0, but when available:

**Common Issues**:
- JWT token expiration
- Invalid credentials
- Session management

## 📊 Database Issues

### Connection Pool Exhaustion

**Symptom**: "too many clients already" errors

**Solutions**:

**1. Check Connection Usage**
```sql
-- Connect to database
docker exec -it task-management-postgres psql -U mcp_user -d mcp_learning

-- Check active connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Find long-running queries
SELECT now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

**2. Adjust Connection Limits**
```yaml
# In docker-compose.yml
services:
  postgres:
    command: postgres -c max_connections=100
    # Or increase backend pool size
  backend:
    environment:
      - DB_POOL_SIZE=20
```

### Slow Query Performance

**Symptom**: API requests are very slow

**Solutions**:

**1. Check Query Performance**
```sql
-- Enable query stats (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**2. Add Missing Indexes**
```sql
-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'project_management'
AND n_distinct > 100;

-- Example index creation
CREATE INDEX CONCURRENTLY idx_tasks_status_priority
ON project_management.tasks(status, priority);
```

### Database Corruption

**Symptom**: Data inconsistencies or corruption errors

**Solutions**:

**1. Check Database Integrity**
```sql
-- Check for corruption
SELECT datname FROM pg_database WHERE datname = 'mcp_learning';

-- Verify table integrity
SELECT schemaname, tablename FROM pg_tables
WHERE schemaname = 'project_management';
```

**2. Restore from Backup**
```bash
# Stop application
docker compose down

# Restore from backup
docker compose up -d postgres
docker exec -i task-management-postgres psql -U mcp_user -d mcp_learning < backup.sql

# Restart application
docker compose up -d
```

## 🚑 Performance Issues

### Slow Loading Times

**Symptom**: Pages take a long time to load

**Solutions**:

**1. Check Resource Usage**
```bash
# Monitor container resources
docker stats

# Check system resources
top
free -h
df -h
```

**2. Optimize Database**
```sql
-- Update table statistics
ANALYZE;

-- Vacuum database
VACUUM ANALYZE;

-- Check for bloated tables
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'project_management'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**3. Frontend Optimization**
```bash
# Check bundle size
cd frontend
npm run build
ls -la dist/assets/

# Enable gzip compression
# Already configured in production Docker setup
```

### Memory Usage Issues

**Symptom**: High memory usage or out-of-memory errors

**Solutions**:

**1. Increase Container Memory**
```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 512M
```

**2. Optimize Queries**
```bash
# Check for memory-intensive queries
docker compose logs backend | grep -i "memory\|heap"

# Limit result sets
# Add pagination to large data queries
```

## 🔒 Security Issues

### SSL/TLS Certificate Problems

**Symptom**: HTTPS not working or certificate errors

**Solutions**:

**1. Check Certificate Validity**
```bash
# Test certificate
openssl x509 -in cert.pem -text -noout

# Check expiration
openssl x509 -in cert.pem -noout -dates

# Verify certificate chain
openssl verify -CAfile ca-bundle.crt cert.pem
```

**2. Update Nginx Configuration**
```nginx
# Verify SSL configuration in nginx.conf
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/private.key;
ssl_protocols TLSv1.2 TLSv1.3;
```

### Security Header Issues

**Symptom**: Security warnings or failed security scans

**Solutions**:

**1. Verify Security Headers**
```bash
# Test headers
curl -I https://yourdomain.com

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

## 🔧 Development Issues

### Hot Reload Not Working

**Symptom**: Changes don't appear without manual refresh

**Solutions**:

**1. Check Development Server**
```bash
# Frontend hot reload
cd frontend
npm run dev

# Backend auto-restart
cd backend
npm run dev
```

**2. File Watching Issues**
```bash
# Increase file watch limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# For WSL2
echo "fs.inotify.max_user_watches=524288" >> ~/.bashrc
```

### TypeScript Errors

**Symptom**: TypeScript compilation fails

**Solutions**:

**1. Type Check Issues**
```bash
# Check TypeScript configuration
cd frontend
npx tsc --noEmit

# Update dependencies
npm update

# Clear TypeScript cache
rm -rf node_modules/.cache
```

**2. Missing Type Definitions**
```bash
# Install missing types
npm install --save-dev @types/node @types/react

# Check for type conflicts
npm ls | grep -i types
```

## 📄 Logging and Monitoring

### Enable Debug Logging

**Backend Debug Logging**:
```bash
# Add to .env
LOG_LEVEL=debug
NODE_ENV=development

# Restart backend
docker compose restart backend

# View detailed logs
docker compose logs -f backend
```

**Frontend Debug Logging**:
```typescript
// Add to frontend/.env.local
VITE_LOG_LEVEL=debug

// Check browser console for detailed logs
```

### Health Check Monitoring

**Set Up Health Monitoring**:
```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
  if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "$(date): Health check failed"
    # Add notification logic here
  fi
  sleep 60
done
EOF

chmod +x monitor.sh
./monitor.sh &
```

## 🆘 Recovery Procedures

### Complete Reset

**When All Else Fails**:
```bash
# 1. Backup data
docker exec task-management-postgres pg_dump -U mcp_user mcp_learning > backup.sql

# 2. Complete teardown
docker compose down -v
docker system prune -f
docker volume prune -f

# 3. Fresh installation
git pull origin main
docker compose up -d --build

# 4. Restore data (if needed)
docker exec -i task-management-postgres psql -U mcp_user -d mcp_learning < backup.sql
```

### Data Recovery

**Restore from Backup**:
```bash
# Stop application
docker compose down

# Start only database
docker compose up -d postgres

# Wait for database to be ready
sleep 10

# Restore backup
docker exec -i task-management-postgres psql -U mcp_user -d mcp_learning < backup.sql

# Start full application
docker compose up -d
```

## 📞 Getting Help

### Information to Collect

When seeking help, please provide:

**System Information**:
```bash
# Operating system
uname -a

# Docker version
docker --version
docker compose version

# Available resources
free -h
df -h
```

**Application Logs**:
```bash
# All service logs
docker compose logs > logs.txt

# Specific service logs
docker compose logs backend > backend-logs.txt
docker compose logs frontend > frontend-logs.txt
docker compose logs postgres > postgres-logs.txt
```

**Configuration**:
```bash
# Environment variables (remove sensitive data)
grep -v 'PASSWORD\|SECRET\|KEY' .env

# Docker compose configuration
cat docker-compose.yml
```

### Where to Get Help

1. **GitHub Issues**: [Create an issue](https://github.com/anubissbe/task-management-webui/issues)
2. **Documentation**: Check other wiki pages
3. **Community**: GitHub Discussions
4. **FAQ**: Check [Frequently Asked Questions](FAQ)

### Creating Good Bug Reports

**Include**:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or videos
- System information
- Relevant log excerpts

**Template**:
```markdown
## Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## System Information
- OS: Ubuntu 22.04
- Docker: 24.0.0
- Browser: Chrome 118

## Logs
```
Relevant log excerpts
```
```

---

**Remember**: Most issues can be resolved by checking logs, verifying configuration, and ensuring all services are running properly. When in doubt, try the "turn it off and on again" approach with Docker containers!