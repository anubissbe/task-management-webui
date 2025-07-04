# ProjectHub MCP Server - Synology Deployment Guide

## Overview
This guide provides step-by-step instructions to deploy ProjectHub MCP Server to your Synology NAS at 192.168.1.24.

## Prerequisites
- SSH access to Synology NAS (port 2222)
- Docker installed on Synology
- Sufficient disk space on /volume1

## Deployment Files
The following files are required for deployment:
- `projecthub-source.tar.gz` - Contains backend, frontend, and all source files
- `docker-compose.synology-minimal.yml` - Docker Compose configuration
- `.env.synology` - Environment configuration

## Step 1: Transfer Files to Synology

Connect to your local machine where the project files are located and run:

```bash
# From your local machine
cd /opt/projects/projects/projecthub-mcp-server

# Copy files to Synology
scp -P 2222 projecthub-source.tar.gz Bert@192.168.1.24:/tmp/
scp -P 2222 docker-compose.synology-minimal.yml Bert@192.168.1.24:/tmp/
scp -P 2222 .env.synology Bert@192.168.1.24:/tmp/
```

## Step 2: Connect to Synology and Deploy

```bash
# SSH to Synology
ssh -p 2222 Bert@192.168.1.24

# Create project directory
sudo mkdir -p /volume1/docker/projecthub
cd /volume1/docker/projecthub

# Extract source files
sudo tar -xzf /tmp/projecthub-source.tar.gz
sudo cp /tmp/docker-compose.synology-minimal.yml docker-compose.yml
sudo cp /tmp/.env.synology .env

# Clean up temporary files
sudo rm /tmp/projecthub-source.tar.gz /tmp/docker-compose.synology-minimal.yml /tmp/.env.synology

# Create PostgreSQL data directory
sudo mkdir -p postgres

# Stop any existing containers
sudo docker-compose down || true

# Start the services
sudo docker-compose up -d
```

## Step 3: Verify Deployment

Wait about 45-60 seconds for services to initialize, then check:

```bash
# Check container status
sudo docker-compose ps

# View logs
sudo docker logs projecthub-backend --tail 50
sudo docker logs projecthub-frontend --tail 50
sudo docker logs projecthub-postgres --tail 50

# Test endpoints
curl http://localhost:3007/api/health
curl http://localhost:5174
```

## Step 4: Access Your Instance

Once deployed, access ProjectHub at:
- **Frontend**: http://192.168.1.24:5174
- **Backend API**: http://192.168.1.24:3007/api
- **Health Check**: http://192.168.1.24:3007/api/health

Database connection:
- **Host**: 192.168.1.24
- **Port**: 5433
- **Database**: projecthub
- **User**: projecthub
- **Password**: projecthub_secure_2025

## Troubleshooting

### Services not starting
```bash
# Check detailed logs
sudo docker-compose logs -f

# Restart services
sudo docker-compose restart
```

### Port conflicts
If ports are already in use, edit the `.env` file and change:
- BACKEND_PORT (default: 3007)
- FRONTEND_PORT (default: 5174)
- DB_PORT (default: 5433)

### Database initialization issues
```bash
# Manually run migrations
sudo docker exec projecthub-backend sh -c "cd /app && npm run migrate"
```

### Permission issues
Ensure the docker user has proper permissions:
```bash
sudo chown -R docker:docker /volume1/docker/projecthub
```

## Maintenance

### Backup database
```bash
sudo docker exec projecthub-postgres pg_dump -U projecthub projecthub > backup.sql
```

### Update deployment
```bash
# Stop services
sudo docker-compose down

# Update files
# (copy new files as in Step 1)

# Start services
sudo docker-compose up -d
```

### View logs
```bash
# All services
sudo docker-compose logs -f

# Specific service
sudo docker logs -f projecthub-backend
```

## Security Notes

1. **Change default passwords** in production:
   - Database password in `.env`
   - JWT secrets in `.env`

2. **Configure CORS** appropriately:
   - Update `CORS_ORIGIN` in `.env` to match your domain

3. **Enable HTTPS** for production use

4. **Regular backups** of PostgreSQL database

## Quick Deploy Script

For convenience, you can use this one-liner after copying files to /tmp:

```bash
sudo bash -c 'cd /volume1/docker && mkdir -p projecthub && cd projecthub && tar -xzf /tmp/projecthub-source.tar.gz && cp /tmp/docker-compose.synology-minimal.yml docker-compose.yml && cp /tmp/.env.synology .env && mkdir -p postgres && docker-compose down 2>/dev/null; docker-compose up -d'
```