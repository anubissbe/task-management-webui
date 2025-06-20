# 📦 Installation Guide

<div align="center">
<img src="https://raw.githubusercontent.com/anubissbe/ProjectHub-Mcp/main/docs/logo.svg" alt="ProjectHub-Mcp Logo" width="300" />
</div>

## 🚀 Quick Start

Get ProjectHub-Mcp running in less than 5 minutes using Docker!

## Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **PostgreSQL** 16+ (included in docker-compose or use external)
- **2GB RAM** minimum, 4GB recommended
- **Port availability**: 5173 (frontend), 3001 (backend), 5432 (PostgreSQL)

## 🐳 Docker Installation (Recommended)

### Option 1: Complete Stack with PostgreSQL
```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: changeme123
      POSTGRES_DB: projecthub_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    image: anubissbe/projecthub-mcp-backend:latest
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://projecthub:changeme123@postgres:5432/projecthub_db?schema=project_management
      NODE_ENV: production
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      - postgres

  frontend:
    image: anubissbe/projecthub-mcp-frontend:latest
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres_data:
EOF

# Start the application
docker compose up -d

# Access the application
open http://localhost:5173
```

### Option 2: Use External PostgreSQL

If you have PostgreSQL 16+ already running (e.g., on Synology NAS):

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    image: anubissbe/projecthub-mcp-backend:latest
    container_name: projecthub-backend
    network_mode: "host"  # Required for Synology
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@your-server-ip:5433/db?schema=project_management
      CORS_ORIGIN: http://your-server-ip:5173
    restart: unless-stopped

  frontend:
    image: anubissbe/projecthub-mcp-frontend:latest
    container_name: projecthub-frontend
    ports:
      - "5173:80"
    restart: unless-stopped
```

### Verify Installation
```bash
# Check running containers
docker ps

# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:5173

# View logs
docker compose logs -f
```

## 🔧 Configuration

### Required Environment Variables

#### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=project_management` |
| `NODE_ENV` | Environment mode | `production` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |
| `PORT` | Backend port (optional) | `3001` |

#### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:3001/api` |
| `VITE_WS_URL` | WebSocket endpoint | `ws://localhost:3001` |

> **Note**: Frontend variables are build-time only. Pre-built images use `http://localhost:3001`.

## 🏗️ Development Setup

For local development with hot-reload:

```bash
# 1. Clone repository
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# 2. Install dependencies
npm install -g pnpm  # Optional: use pnpm for faster installs
cd frontend && npm install
cd ../backend && npm install

# 3. Set up PostgreSQL
docker run -d \
  --name projecthub-postgres \
  -e POSTGRES_USER=projecthub \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=projecthub_db \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Configure environment
# Backend
echo "DATABASE_URL=postgresql://projecthub:devpassword@localhost:5432/projecthub_db?schema=project_management
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173" > backend/.env

# Frontend
echo "VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001" > frontend/.env

# 5. Start development servers
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Access at http://localhost:5173
```

## 🚀 Container Registries

Pre-built images are available from:

### GitHub Container Registry
```bash
docker pull ghcr.io/anubissbe/projecthub-mcp-frontend:latest
docker pull ghcr.io/anubissbe/projecthub-mcp-backend:latest
```

### Docker Hub
```bash
docker pull anubissbe/projecthub-mcp-frontend:latest
docker pull anubissbe/projecthub-mcp-backend:latest
```

## ✅ Verification

After installation, verify everything is working:

```bash
# Check running containers
docker ps

# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:5173

# View logs
docker compose logs -f
```

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Use HTTPS** with proper certificates
3. **Configure firewall** to restrict database access
4. **Set strong DATABASE_URL** credentials
5. **Use secrets management** for sensitive data

## 🆘 Common Issues

### Cannot connect to database
- Ensure PostgreSQL is version 16+
- Check network connectivity
- Verify credentials and database exists
- For Synology: use `network_mode: "host"`

### CORS errors
- Ensure `CORS_ORIGIN` matches frontend URL exactly
- Include protocol (http/https) and port

### Port conflicts
```bash
# Find what's using ports
lsof -i :5173
lsof -i :3001
lsof -i :5432

# Or change ports in docker-compose.yml
```

## 📚 Next Steps

- [User Interface Overview](User-Interface-Overview) - Learn the UI
- [Project Management](Project-Management) - Create your first project
- [Task Management](Task-Management) - Organize tasks
- [Production Deployment](Production-Deployment) - Deploy to production

---

<div align="center">

**Need help?** Create an [issue](https://github.com/anubissbe/ProjectHub-Mcp/issues) or check the [FAQ](FAQ)

</div>