# 🐳 ProjectHub-Mcp on Synology NAS

This guide helps you deploy ProjectHub-Mcp on a Synology NAS with PostgreSQL.

## Prerequisites

- Synology DSM 7.0+
- Docker package installed
- PostgreSQL 16 package installed
- Container Manager (or Docker via SSH)

## Quick Setup

### 1. Prepare PostgreSQL

First, ensure your PostgreSQL has the required database and user:

```sql
-- Connect to PostgreSQL (via phpPgAdmin or psql)
CREATE DATABASE mcp_learning;  -- Or use existing database
GRANT ALL PRIVILEGES ON DATABASE mcp_learning TO app_user;
```

### 2. Deploy via Container Manager UI

#### Backend Container:
- **Image**: `anubissbe/projecthub-mcp-backend:latest`
- **Network**: Use host network (important!)
- **Environment Variables**:
  ```
  NODE_ENV=production
  DATABASE_URL=postgresql://app_user:app_secure_2024@localhost:5433/mcp_learning?schema=project_management
  CORS_ORIGIN=http://192.168.1.24:5173
  ```
- **Port**: Not needed with host network

#### Frontend Container:
- **Image**: `anubissbe/projecthub-mcp-frontend:latest`
- **Network**: Bridge
- **Port Mapping**: Local Port 5173 → Container Port 80

### 3. Deploy via SSH (Recommended)

```bash
# SSH into your Synology
ssh admin@your-synology-ip

# Deploy backend with host network
sudo docker run -d \
  --name projecthub-backend \
  --network host \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://app_user:app_secure_2024@localhost:5433/mcp_learning?schema=project_management" \
  -e CORS_ORIGIN="http://192.168.1.24:5173" \
  --restart unless-stopped \
  anubissbe/projecthub-mcp-backend:latest

# Deploy frontend
sudo docker run -d \
  --name projecthub-frontend \
  -p 5173:80 \
  --restart unless-stopped \
  anubissbe/projecthub-mcp-frontend:latest
```

### 4. Using Docker Compose

Create `/volume1/docker/projecthub/docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: anubissbe/projecthub-mcp-backend:latest
    container_name: projecthub-backend
    network_mode: "host"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://app_user:app_secure_2024@localhost:5433/mcp_learning?schema=project_management
      CORS_ORIGIN: http://192.168.1.24:5173
    restart: unless-stopped

  frontend:
    image: anubissbe/projecthub-mcp-frontend:latest
    container_name: projecthub-frontend
    ports:
      - "5173:80"
    restart: unless-stopped
```

Then run:
```bash
cd /volume1/docker/projecthub
sudo docker-compose up -d
```

## Troubleshooting

### Backend can't connect to PostgreSQL

1. **Check PostgreSQL is running**:
   ```bash
   sudo netstat -tlnp | grep 5433
   ```

2. **Test connection**:
   ```bash
   sudo docker exec projecthub-backend sh -c 'apt-get update && apt-get install -y postgresql-client && psql $DATABASE_URL -c "SELECT version();"'
   ```

3. **Check logs**:
   ```bash
   sudo docker logs projecthub-backend
   ```

### Frontend shows connection errors

The frontend is pre-built to connect to `http://localhost:3001/api`. Solutions:

1. **Access via localhost** (if on same network):
   - Use `http://localhost:5173` instead of IP address

2. **Use reverse proxy** (recommended):
   ```nginx
   # Add to Synology reverse proxy
   location /api {
       proxy_pass http://localhost:3001/api;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

3. **Build custom frontend** with correct API URL

### Database Connection String Examples

```bash
# Standard Synology PostgreSQL 16
postgresql://username:password@localhost:5433/database?schema=project_management

# With specific schema
postgresql://app_user:app_secure_2024@localhost:5433/mcp_learning?schema=project_management

# If PostgreSQL is in Docker
postgresql://username:password@postgres_container:5432/database?schema=project_management
```

## Security Considerations

1. **Change default passwords** in production
2. **Use firewall rules** to restrict access
3. **Enable HTTPS** with reverse proxy
4. **Regular backups** of PostgreSQL data

## Support

- GitHub Issues: https://github.com/anubissbe/ProjectHub-Mcp/issues
- Documentation: https://github.com/anubissbe/ProjectHub-Mcp/wiki