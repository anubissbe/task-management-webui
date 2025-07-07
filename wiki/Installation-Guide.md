# 📦 Installation Guide

## 🚀 Quick Start

Get ProjectHub-MCP v5.0.0 running in less than 5 minutes using Docker!

## Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **4GB RAM** minimum
- **Ports available**: 5174 (frontend), 3009 (backend), 5433 (PostgreSQL)

## 🐳 Docker Installation (Recommended)

### Complete Stack Installation

```bash
# 1. Clone the repository
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# 2. Create secure environment file
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "POSTGRES_PASSWORD=projecthub123" >> .env

# 3. Start all services
docker-compose up -d

# 4. Wait for services to initialize
sleep 15

# 5. Verify deployment
docker-compose ps
curl http://localhost:3009/health
```

**Access Points:**
- 🌐 **Frontend**: http://localhost:5174
- 🔧 **Backend API**: http://localhost:3009
- 📊 **Health Check**: http://localhost:3009/health

**Default Login:**
- **Email**: admin@projecthub.com
- **Password**: admin123

### Production Quick Deploy

For production deployment with pre-built images:

```bash
# Create production environment file
cat > .env.production << EOF
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
EOF

# Pull latest images
docker pull anubissbe/projecthub-backend:latest
docker pull anubissbe/projecthub-frontend:latest

# Deploy with production config
docker-compose --env-file .env.production up -d

# Wait for database to initialize
sleep 15

# Verify deployment
curl http://localhost:3009/health
```

## 🔧 Configuration

### Required Environment Variables

```env
# Required
JWT_SECRET=your-secure-jwt-secret-here
POSTGRES_PASSWORD=your-secure-db-password

# Optional
CORS_ORIGIN=http://localhost:5174
NODE_ENV=production
BACKEND_PORT=3009
FRONTEND_PORT=5174
```

### Docker Compose Configuration

The provided `docker-compose.yml` includes:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: projecthub
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-projecthub123}
    ports:
      - "${POSTGRES_PORT:-5433}:5432"

  backend:
    image: anubissbe/projecthub-backend:latest
    environment:
      JWT_SECRET: ${JWT_SECRET:?JWT_SECRET environment variable is required}
      DATABASE_URL: postgresql://projecthub:${POSTGRES_PASSWORD:-projecthub123}@postgres:5432/projecthub
    ports:
      - "${BACKEND_PORT:-3009}:3010"

  frontend:
    image: anubissbe/projecthub-frontend:latest
    ports:
      - "${FRONTEND_PORT:-5174}:80"
```

## 🏗️ Development Setup

For local development with hot-reload:

```bash
# 1. Clone repository
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# 2. Start only database for development
docker-compose up -d postgres

# 3. Install backend dependencies
cd backend-fix
npm install

# 4. Configure backend environment
echo "JWT_SECRET=dev-secret-key" > .env
echo "DATABASE_URL=postgresql://projecthub:projecthub123@localhost:5433/projecthub" >> .env
echo "NODE_ENV=development" >> .env
echo "PORT=3009" >> .env

# 5. Start backend in development mode
npm run dev

# 6. In another terminal, start frontend
cd ../frontend
# Frontend uses live Alpine.js - just serve files
python -m http.server 5174
# Or use any static file server
```

## ✅ Verification

After installation, verify everything is working:

```bash
# Check container status
docker-compose ps

# Check backend health
curl http://localhost:3009/health
# Expected: {"status":"healthy","timestamp":"...","uptime":...}

# Check database connectivity
curl http://localhost:3009/api/health/db
# Expected: {"status":"connected","database":"projecthub"}

# Check frontend
curl http://localhost:5174
# Expected: HTML content of the application

# Test authentication
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projecthub.com","password":"admin123"}'
# Expected: {"token":"...", "user":{"email":"admin@projecthub.com"}}

# View logs
docker-compose logs -f
```

## 🔒 Security Configuration

### JWT Secret

**CRITICAL**: Always set a secure JWT_SECRET:

```bash
# Generate secure JWT secret
export JWT_SECRET="$(openssl rand -base64 32)"

# Or add to .env file
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
```

### Database Security

1. **Change default password**:
   ```bash
   export POSTGRES_PASSWORD="$(openssl rand -base64 16)"
   ```

2. **Restrict database access**:
   - Use Docker networks (included in compose)
   - Don't expose PostgreSQL port in production
   - Use strong passwords

### CORS Configuration

Set `CORS_ORIGIN` to your actual domain:

```bash
# Development
CORS_ORIGIN=http://localhost:5174

# Production
CORS_ORIGIN=https://your-domain.com
```

## 🆘 Troubleshooting

### Common Issues

**1. Container won't start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check if ports are in use
sudo lsof -i :3009
sudo lsof -i :5174
sudo lsof -i :5433
```

**2. Database connection errors**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test database connectivity
docker exec projecthub-postgres pg_isready -U projecthub

# Reset database (destructive!)
docker-compose down -v
docker-compose up -d
```

**3. Frontend shows 'Cannot connect to server'**
```bash
# Check backend is responding
curl http://localhost:3009/health

# Check CORS configuration
curl -H "Origin: http://localhost:5174" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:3009/api/auth/login
```

**4. Authentication issues**
```bash
# Check if admin user exists
docker exec projecthub-postgres psql -U projecthub -d projecthub \
  -c "SELECT email, created_at FROM users WHERE email = 'admin@projecthub.com';"

# Reset admin password (if needed)
docker exec projecthub-postgres psql -U projecthub -d projecthub \
  -c "UPDATE users SET password = '\$2a\$10\$ILQeDcYjXZBPJDIAiA.PnOgs1rqZaYecV5dVLmjKdoFViZGX1W1.W' WHERE email = 'admin@projecthub.com';"
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase memory if needed
# Edit docker-compose.yml to add:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

### Network Issues

```bash
# Check Docker networks
docker network ls

# Inspect project network
docker network inspect projecthub_projecthub-network

# Restart networking
docker-compose down
docker-compose up -d
```

## 📚 Next Steps

Once installation is complete:

1. **[User Interface Overview](User-Interface-Overview)** - Learn the interface
2. **[Project Management](Project-Management)** - Create your first project
3. **[Task Management](Task-Management)** - Set up kanban boards
4. **[AI Integration Setup](AI-Integration-Setup)** - Connect AI assistants
5. **[Production Deployment](Production-Deployment)** - Deploy to production

## 🔗 Container Images

Pre-built images are available:

- **Docker Hub**: 
  - `anubissbe/projecthub-backend:latest`
  - `anubissbe/projecthub-frontend:latest`

- **Automatic Updates**: Images are automatically built from the main branch

---

**Need help?** Create an [issue](https://github.com/anubissbe/ProjectHub-Mcp/issues) or check the [Troubleshooting](Troubleshooting) guide.