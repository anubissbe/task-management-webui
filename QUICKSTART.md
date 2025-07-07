# ProjectHub MCP - Quick Start Guide

## 🚀 5-Minute Setup

> ⚡ **Super Fast**: Uses pre-built Docker Hub images - no compilation needed!

### Option 1: Quick Start (Recommended)

```bash
# 1. Clone and enter directory
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# 2. Set up environment
cp .env.example .env

# 3. Generate secure credentials
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "DB_PASSWORD=$(openssl rand -base64 16)" >> .env

# 4. Start ProjectHub (pulls pre-built images from Docker Hub)
docker-compose up -d

# 5. Wait for startup (about 30 seconds - much faster than building!)
echo "Waiting for services to start..."
sleep 30

# 6. Verify everything is running
docker-compose ps
curl http://localhost:3009/health
```

**That's it!** ProjectHub is now running at:
- 🌐 **Web Interface**: http://localhost:5174
- 🔧 **API**: http://localhost:3009

### Option 2: Docker Hub Images Only (Fastest - No Source Code)

```bash
# 1. Create project directory
mkdir projecthub && cd projecthub

# 2. Download docker-compose file (Docker Hub images only)
curl -o docker-compose.yml https://raw.githubusercontent.com/anubissbe/ProjectHub-Mcp/main/docker-compose.dockerhub-only.yml

# 3. Download environment template
curl -o .env https://raw.githubusercontent.com/anubissbe/ProjectHub-Mcp/main/.env.example

# 4. Generate secure passwords
sed -i 's/your_secure_password/'$(openssl rand -base64 16)'/g' .env
sed -i 's/your_jwt_secret_key_here/'$(openssl rand -base64 32)'/g' .env

# 5. Start services (pulls from Docker Hub)
docker-compose up -d
```

### Option 3: Full Repository (Recommended for Development)

```bash
# 1. Clone repository (includes source code for customization)
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# 2. Follow Option 1 steps above
cp .env.example .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
docker-compose up -d
```

## 🎯 First Login

1. Open http://localhost:5174 in your browser
2. Login with default credentials:
   - **Email**: `admin@projecthub.com`
   - **Password**: `admin123`
3. **Important**: Change the default password immediately!

## 🔧 Basic Configuration

### Change Default Password
1. Log in to the web interface
2. Go to Profile/Settings
3. Update your password
4. Update your email address

### Create Your First Project
1. Click "New Project" 
2. Fill in project details
3. Start adding tasks to your project

## 🔗 AI Integration Setup

### With Claude Code
Add to your project's configuration:
```bash
# Add to your CLAUDE.md or project notes
ProjectHub API: http://localhost:3009/api
Login: admin@projecthub.com / your_new_password
```

### With other AI tools
Use the REST API endpoints:
- **Base URL**: `http://localhost:3009/api`
- **Authentication**: POST to `/api/auth/login`
- **Projects**: GET/POST/PUT/DELETE to `/api/projects`
- **Tasks**: GET/POST/PUT/DELETE to `/api/tasks`

## 🛠️ Troubleshooting

### Services won't start
```bash
# Check what's using the ports
sudo netstat -tulpn | grep -E "(3009|5174|5434)"

# If ports are in use, change them in .env:
echo "API_PORT=3010" >> .env
echo "FRONTEND_PORT=8091" >> .env
echo "DB_EXTERNAL_PORT=5435" >> .env
```

### Database connection issues
```bash
# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Frontend can't reach backend
```bash
# Check backend health
curl http://localhost:3009/health

# Check backend logs
docker-compose logs backend

# Verify API URL in frontend
# Edit .env and set:
echo "API_BASE_URL=http://localhost:3009" >> .env
docker-compose restart frontend
```

## 📊 Verification Checklist

- [ ] All containers running: `docker-compose ps`
- [ ] Backend healthy: `curl http://localhost:3009/health`
- [ ] Frontend accessible: Open http://localhost:5174
- [ ] Can login with default credentials
- [ ] Can create a test project
- [ ] Can create a test task

## 🔄 Updates

To update ProjectHub to the latest version:

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d

# Clean up old images (optional)
docker image prune -f
```

## 🆘 Need Help?

- 📖 **Full Documentation**: [GitHub Wiki](https://github.com/anubissbe/ProjectHub-Mcp/wiki)
- 🐛 **Issues**: [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/anubissbe/ProjectHub-Mcp/discussions)

## 🎉 Next Steps

1. **Explore the Interface**: Create projects and tasks
2. **Set up AI Integration**: Connect with your AI coding tools
3. **Customize Settings**: Configure webhooks, notifications
4. **Invite Team Members**: Set up additional user accounts
5. **Read the Docs**: Check out the full documentation for advanced features