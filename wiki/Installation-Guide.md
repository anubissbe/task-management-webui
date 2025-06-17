# 📦 ProjectHub-Mcp Installation Guide

<p align="center" style="color: #ff6500; font-size: 1.1em; font-weight: bold;">
🧡 Get your MCP-Enhanced Project Management Workspace up and running! 🧡
</p>

This guide covers different ways to install and run **ProjectHub-Mcp** with its signature black and orange interface.

## 🚀 Quick Installation (Recommended)

The fastest way to get started is using our pre-built release packages:

### Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM available
- 2GB+ disk space

### 🐳 Docker Installation (Recommended)
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
    image: ghcr.io/anubissbe/projecthub-mcp-backend:latest
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://projecthub:changeme123@postgres:5432/projecthub_db
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      - postgres

  frontend:
    image: ghcr.io/anubissbe/projecthub-mcp-frontend:latest
    ports:
      - "5173:80"
    environment:
      VITE_API_URL: http://localhost:3001/api

volumes:
  postgres_data:
EOF

# Start the application
docker compose up -d
```

### Verify Installation
```bash
# Check if services are running
docker compose ps

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
# Health Check: http://localhost:3001/api/health
```

## 🛠️ Development Installation

For developers who want to modify the code:

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/anubissbe/ProjectHub-Mcp.git
   cd ProjectHub-Mcp
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit environment variables (optional)
   nano .env
   ```

3. **Start Services**
   ```bash
   # Start with Docker (recommended)
   docker compose up -d
   
   # Or start PostgreSQL only and run apps locally
   docker compose up -d postgres
   ```

4. **Local Development (Optional)**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   npm run dev
   
   # In another terminal, install backend dependencies
   cd ../backend
   npm install
   npm run dev
   ```

## 🐳 Production Deployment

For production environments:

### Using Production Docker Compose
```bash
# Download production configuration
curl -L https://github.com/anubissbe/task-management-webui/releases/download/v1.0.0/task-management-webui-v1.0.0-full.tar.gz | tar -xz

# Use production compose file
docker compose -f docker-compose.prod.yml up -d
```

### Environment Configuration
Create a `.env` file with production settings:
```env
# Database
DATABASE_URL=postgresql://mcp_user:SECURE_PASSWORD@postgres:5432/mcp_learning
POSTGRES_PASSWORD=SECURE_PASSWORD

# Backend
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com

# Frontend
VITE_API_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com
```

## 🗄️ Database Setup

### Automatic Setup (Recommended)
The application automatically creates the database schema on startup.

### Manual Database Setup
If you prefer manual setup:
```bash
# Connect to PostgreSQL
docker exec -it task-management-postgres-prod psql -U mcp_user -d mcp_learning

# Run initialization scripts
\i /docker-entrypoint-initdb.d/init-db.sql
```

## 🔧 Configuration Options

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://mcp_user:mcp_secure_password_2024@localhost:5432/mcp_learning` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `3001` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:3001` |

### Docker Compose Options
```yaml
# Override default settings
version: '3.8'
services:
  backend:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=your_connection_string
    ports:
      - "3001:3001"
```

## ✅ Verification Steps

### Health Checks
```bash
# Check application health
curl http://localhost:3001/api/health

# Check database connection
curl http://localhost:3001/api/projects

# Check frontend
curl http://localhost:5173
```

### Service Logs
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :5173
lsof -i :3001

# Change ports in docker-compose.yml
```

**Database Connection Failed**
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Reset database
docker compose down -v
docker compose up -d
```

**Permission Issues**
```bash
# Fix Docker permissions (Linux/Mac)
sudo chown -R $USER:$USER .
```

### Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](Troubleshooting)
2. Review [GitHub Issues](https://github.com/anubissbe/task-management-webui/issues)
3. Create a new issue with:
   - Your operating system
   - Docker version (`docker --version`)
   - Error messages
   - Steps to reproduce

## 📦 Alternative Installation Methods

### Using npm (Frontend Only)
```bash
git clone https://github.com/anubissbe/task-management-webui.git
cd task-management-webui/frontend
npm install
npm run build
npm run preview
```

### Manual Build
```bash
# Build frontend
cd frontend
npm install
npm run build

# Build backend
cd ../backend
npm install
npm run build

# Start manually
npm start
```

---

**Next Steps**: After installation, check out the [First-Time Setup](First-Time-Setup) guide to configure your application.