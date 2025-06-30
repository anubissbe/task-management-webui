#!/bin/bash
# Quick deployment script - Run this on Synology after copying files to /tmp

set -e
echo "🚀 ProjectHub Quick Deploy for Synology"
echo "======================================"

# Check if files exist
if [ ! -f "/tmp/projecthub-source.tar.gz" ] || [ ! -f "/tmp/docker-compose.synology-minimal.yml" ] || [ ! -f "/tmp/.env.synology" ]; then
    echo "❌ Error: Required files not found in /tmp/"
    echo "Please copy the following files to /tmp first:"
    echo "  - projecthub-source.tar.gz"
    echo "  - docker-compose.synology-minimal.yml"
    echo "  - .env.synology"
    exit 1
fi

# Deploy
echo "📦 Setting up ProjectHub..."
cd /volume1/docker
sudo mkdir -p projecthub
cd projecthub

echo "📥 Extracting files..."
sudo tar -xzf /tmp/projecthub-source.tar.gz
sudo cp /tmp/docker-compose.synology-minimal.yml docker-compose.yml
sudo cp /tmp/.env.synology .env

echo "🗑️  Cleaning up temp files..."
sudo rm /tmp/projecthub-source.tar.gz /tmp/docker-compose.synology-minimal.yml /tmp/.env.synology

echo "📁 Creating data directories..."
sudo mkdir -p postgres

echo "🐳 Starting Docker containers..."
sudo docker-compose down 2>/dev/null || true
sudo docker-compose up -d

echo "⏳ Waiting for services to initialize (45 seconds)..."
sleep 45

echo "📊 Service Status:"
sudo docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo "Frontend: http://192.168.1.24:5174"
echo "Backend:  http://192.168.1.24:3007/api"
echo "Health:   http://192.168.1.24:3007/api/health"
echo ""
echo "Run 'docker-compose logs -f' to view logs"