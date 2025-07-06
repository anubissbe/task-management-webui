#\!/bin/bash

# Deployment script for ProjectHub on Synology

echo "🚀 Deploying ProjectHub to Synology NAS..."

# SSH to Synology and update containers
ssh -p 2222 Bert@192.168.1.24 << 'ENDSSH'
# Stop and remove old containers
docker stop projecthub-backend projecthub-frontend 2>/dev/null
docker rm projecthub-backend projecthub-frontend 2>/dev/null

# Pull latest images
docker pull anubissbe/projecthub:latest
docker pull anubissbe/projecthub-frontend:latest

# Start backend
docker run -d \
  --name projecthub-backend \
  -p 3009:3010 \
  -e DATABASE_URL="postgresql://projecthub:projecthub123@192.168.1.24:5434/projecthub" \
  -e JWT_SECRET="your-secure-jwt-secret-here" \
  -e CORS_ORIGIN="*" \
  --restart unless-stopped \
  anubissbe/projecthub:latest

# Start frontend  
docker run -d \
  --name projecthub-frontend \
  -p 8090:80 \
  --restart unless-stopped \
  anubissbe/projecthub-frontend:latest

# Check status
docker ps  < /dev/null |  grep projecthub
ENDSSH

echo "✅ Deployment complete!"
