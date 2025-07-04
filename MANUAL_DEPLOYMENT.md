# Manual Deployment Guide for Webhook Fix

Since the GitHub Actions are not building the correct containers, here's how to manually deploy the webhook fix:

## Option 1: Build and Deploy Locally

### 1. Build the containers locally:
```bash
cd /opt/projects/projects/projecthub-mcp-server

# Build backend with webhook fix
docker build -t projecthub-backend:webhook-fix ./backend-fix/

# Build frontend
docker build -t projecthub-frontend:webhook-fix ./frontend/
```

### 2. Tag for your registry (if using Docker Hub):
```bash
# Replace 'yourusername' with your Docker Hub username
docker tag projecthub-backend:webhook-fix yourusername/projecthub-backend:latest
docker tag projecthub-frontend:webhook-fix yourusername/projecthub-frontend:latest
```

### 3. Push to registry:
```bash
docker push yourusername/projecthub-backend:latest
docker push yourusername/projecthub-frontend:latest
```

### 4. Deploy on Synology:
```bash
ssh -p 2222 Bert@192.168.1.24
cd /volume1/docker/projecthub-mcp-server
docker-compose pull
docker-compose up -d
```

## Option 2: Build Directly on Synology

### 1. SSH to Synology and pull latest code:
```bash
ssh -p 2222 Bert@192.168.1.24
cd /volume1/docker/projecthub-mcp-server
git pull origin main
```

### 2. Update docker-compose.yml to build locally:
Edit `docker-compose.yml` and change:
```yaml
backend:
  # Comment out the image line
  # image: telkombe/projecthub-backend:latest
  build:
    context: ./backend-fix
    dockerfile: Dockerfile
```

Do the same for frontend:
```yaml
frontend:
  # Comment out the image line  
  # image: telkombe/projecthub-frontend:latest
  build:
    context: ./frontend
    dockerfile: Dockerfile
```

### 3. Build and start:
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Option 3: Use Pre-built Images with Volume Mounts

If you can't rebuild the images, you can mount the fixed files:

### 1. Create a docker-compose.override.yml:
```yaml
version: '3.8'

services:
  backend:
    volumes:
      - ./backend-fix/complete_backend.js:/app/complete_backend.js:ro
    command: ["node", "/app/complete_backend.js"]
    
  frontend:
    volumes:
      - ./frontend/app.js:/usr/share/nginx/html/app.js:ro
```

### 2. Deploy:
```bash
docker-compose up -d
```

## Verification

After deployment, verify the webhook fix:

1. **Check backend is running**:
   ```bash
   curl http://192.168.1.24:3007/api/webhooks
   ```

2. **Access frontend**:
   - Open http://192.168.1.24:5174
   - Go to Settings > Webhooks
   - Add a Slack webhook URL
   - Click "Test" - should work without CORS errors

3. **Monitor logs**:
   ```bash
   docker logs -f projecthub-backend | grep -i webhook
   ```

4. **Test task creation**:
   - Create a new task
   - Check Slack channel for notification

## Quick Test Script

Run this to test the webhook integration:
```bash
# Test webhook endpoint
curl -X POST http://192.168.1.24:3007/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "events": ["task.created", "task.completed"],
    "active": true
  }'
```

## Troubleshooting

If webhooks aren't working:

1. **Check backend logs**:
   ```bash
   docker logs projecthub-backend
   ```

2. **Verify ports**:
   - Backend should be on port 3007 (mapped to internal 3010)
   - Frontend should be on port 5174

3. **Test backend directly**:
   ```bash
   # From inside container
   docker exec -it projecthub-backend sh
   wget -O- http://localhost:3010/api/webhooks
   ```

4. **Check CORS settings**:
   The backend should allow all origins with `CORS_ORIGIN=*` in environment