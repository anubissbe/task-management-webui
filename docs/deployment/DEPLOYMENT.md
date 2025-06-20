# ProjectHub-MCP Deployment Guide

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database (local or remote)
- Node.js 18+ (for building)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

## 📦 Manual Deployment

### Building the Application

1. **Install dependencies**
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. **Build frontend**
```bash
cd frontend
npm run build
```

3. **Build backend**
```bash
cd backend
npm run build
```

### Deployment Options

#### Option 1: Using Docker

Create a production docker-compose file:

```yaml
version: '3.8'

services:
  backend:
    image: projecthub-backend:latest
    environment:
      - DATABASE_URL=postgresql://user:password@db-host:5432/projecthub
      - NODE_ENV=production
      - CORS_ORIGIN=https://your-domain.com
    ports:
      - "3001:3001"
    restart: unless-stopped

  frontend:
    image: projecthub-frontend:latest
    environment:
      - VITE_API_URL=https://your-domain.com/api
    ports:
      - "80:80"
    restart: unless-stopped
```

#### Option 2: Traditional Deployment

1. **Backend deployment**
```bash
# Copy built backend to server
scp -r backend/dist user@your-server:/path/to/app/

# On the server
cd /path/to/app
npm install --production
NODE_ENV=production node dist/index.js
```

2. **Frontend deployment**
```bash
# Copy built frontend to web server
scp -r frontend/dist/* user@your-server:/var/www/html/
```

## 🔒 Production Configuration

### Environment Variables

Create a production `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@your-db-host:5432/projecthub
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_DB=projecthub

# Application
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com

# Frontend URLs
VITE_API_URL=https://your-domain.com/api
VITE_WS_URL=wss://your-domain.com
```

### Nginx Configuration (for frontend)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/projecthub;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🚀 Production Checklist

- [ ] Set strong database passwords
- [ ] Configure HTTPS with SSL certificates
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure backup strategy
- [ ] Set up monitoring (e.g., PM2, systemd)
- [ ] Configure log rotation
- [ ] Set up health check monitoring
- [ ] Configure firewall rules
- [ ] Enable auto-restart on failure

## 📊 Monitoring

### Health Check Endpoints

- API Health: `/api/health`
- Database Status: `/api/health/db`
- WebSocket Status: `/api/health/ws`

### Using PM2 (recommended for Node.js)

```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start dist/index.js --name projecthub-api

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔄 Updates and Maintenance

### Updating the Application

1. **Pull latest changes**
```bash
git pull origin main
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. **Build and deploy**
```bash
# Rebuild containers
docker-compose build
docker-compose up -d
```

### Database Migrations

Run any new migrations:
```bash
cd backend
npm run migrate
```

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL is correct
   - Verify PostgreSQL is running
   - Check firewall rules

2. **CORS errors**
   - Ensure CORS_ORIGIN matches your frontend URL
   - Check if credentials are included in requests

3. **WebSocket connection failed**
   - Verify nginx is configured for WebSocket
   - Check firewall allows WebSocket connections

### Logs

Check logs for debugging:
```bash
# Docker logs
docker-compose logs -f

# PM2 logs
pm2 logs projecthub-api
```

## 📞 Support

For deployment issues:
- Check the [FAQ](https://github.com/anubissbe/ProjectHub-Mcp/wiki/FAQ)
- Open an [issue](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- Review [troubleshooting guide](https://github.com/anubissbe/ProjectHub-Mcp/wiki/Troubleshooting)