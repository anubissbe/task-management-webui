# 🚀 ProjectHub-MCP

> 🚨 **IMPORTANT**: Use the commands in this README v4.7.1 for deployment. Previous versions had issues with authentication, missing endpoints, and Synology compatibility. The deployment commands below are TESTED and WORKING.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-4.7.1-blue.svg)](https://github.com/anubissbe/ProjectHub-Mcp/releases)
[![Alpine.js](https://img.shields.io/badge/Alpine.js-3.0-blue?logo=alpinedotjs)](https://alpinejs.dev/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)](https://github.com/anubissbe/ProjectHub-Mcp)
[![Discussions](https://img.shields.io/github/discussions/anubissbe/ProjectHub-Mcp?label=Discussions&logo=github)](https://github.com/anubissbe/ProjectHub-Mcp/discussions)

> 🎯 **Enterprise-grade project management system** with real-time collaboration, advanced analytics, team management, and seamless MCP (Model Context Protocol) integration

## 🌟 Community

<div align="center">

[💬 **Join Discussions**](https://github.com/anubissbe/ProjectHub-Mcp/discussions) • 
[🐛 **Report Issues**](https://github.com/anubissbe/ProjectHub-Mcp/issues) • 
[📖 **Read Wiki**](https://github.com/anubissbe/ProjectHub-Mcp/wiki) • 
[🤝 **Contribute**](CONTRIBUTING.md)

</div>

## 🐳 Docker Hub Images

Pre-built images available:
```bash
# Latest webhook-fixed images (RECOMMENDED)
docker pull anubissbe/projecthub-backend:latest          # PostgreSQL + Webhook proxy
docker pull anubissbe/projecthub-frontend:latest         # Updated frontend

# Legacy images (may have webhook CORS issues)
docker pull telkombe/projecthub-backend:complete-v4.7.1
docker pull anubissbe/projecthub-frontend:latest         # Previous version
```

> ⚠️ **Important**: Use `:latest` tags for webhook functionality without CORS errors!

<div align="center">
  <img src="docs/images/working-analytics.png" alt="ProjectHub-MCP Analytics Dashboard" width="800"/>
</div>

## 🚀 Quick Start

Get ProjectHub-MCP running in under 2 minutes:

```bash
# Clone the repository
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# Option 1: Use the fixed start script (Recommended)
./start-fixed.sh

# Option 2: Use Docker Compose with all fixes
docker-compose -f docker-compose-fixed.yml up -d

# Option 3: Use the original start script
./start.sh

# Open your browser
open http://localhost:8090
```

**For production deployment on Synology NAS**, see the [Synology NAS Deployment Guide](#-synology-nas-deployment-guide) below.

### 🔧 Important Fixes Applied (Latest)

This version includes critical fixes for common issues:
- ✅ **Complete Backend**: All endpoints implemented (analytics, webhooks, users)
- ✅ **Authentication Fixed**: No more hardcoded tokens or auth states
- ✅ **Webhook CORS Fix**: Proxy-based webhooks prevent browser CORS errors
- ✅ **Synology Compatible**: Nginx config works on Synology NAS
- ✅ **Network Connectivity**: Proper Docker networking between services
- ✅ **Database Integration**: Full PostgreSQL integration with connection pooling

That's it! ProjectHub-MCP will be running with:
- 🗄️ **PostgreSQL Database**: `localhost:5433`
- 🌐 **Frontend Interface**: `http://localhost:5174`
- 📡 **API Backend**: `http://localhost:3009` ⚠️ **Updated Port**

> 🔧 **Webhook Testing**: Go to Settings > Webhooks to test Slack integration without CORS errors!

## 📸 Screenshots

<div align="center">

### 🏠 Project Management Dashboard
<img src="docs/images/working-homepage.png" alt="Modern Project Management Interface" width="800"/>

### 📊 Analytics Dashboard
<img src="docs/images/working-analytics.png" alt="Advanced Analytics Dashboard" width="800"/>

### ✅ Task Management Interface
<img src="docs/images/current-calendar.png" alt="Modern Task Management Interface" width="800"/>

</div>

## ✨ Key Features

### 🎯 **Project & Task Management**
- 📋 **Full Project Lifecycle**: Planning → Active → Completed with status tracking
- ✅ **Advanced Task System**: Priorities, estimates, dependencies, and custom fields
- 📊 **Kanban Board**: Drag-and-drop interface with real-time updates
- 📅 **Calendar Integration**: Deadline visualization and scheduling
- 🔗 **Task Dependencies**: Complex workflow management

### 👥 **Team Collaboration**
- 🏢 **Multi-Tenant Workspaces**: Complete data isolation
- 👤 **Role-Based Access**: Admin → Manager → Developer → Viewer
- 📧 **Team Invitations**: Token-based secure invitations
- 🛡️ **Project-Level Security**: Granular access control

### 📊 **Analytics & Reporting**
- 📈 **Interactive Dashboards**: Customizable widgets and charts
- 📉 **Burndown Charts**: Sprint progress tracking
- 🚀 **Velocity Analysis**: Team performance metrics
- 📤 **Export Options**: PDF, Excel, CSV with branding
- 🔍 **Advanced Filtering**: Date ranges and custom criteria

### 🔧 **Technical Excellence**
- 🐳 **Containerized**: Docker-ready deployment
- 🔒 **Secure**: JWT authentication, HMAC webhooks
- 📱 **Responsive**: Mobile-first design
- 🌐 **API-First**: RESTful API with OpenAPI documentation
- 🔄 **Real-Time**: WebSocket integration for live updates

## 🛠️ Architecture

ProjectHub-MCP offers **dual frontend options** for different use cases:

### 🪶 **Alpine.js Frontend** (Recommended)
- **Ultra-lightweight**: ~50KB total bundle size
- **Lightning fast**: Sub-second load times
- **Perfect for**: Embedded use, low-bandwidth, simple deployments
- **Port**: `8090`

### ⚛️ **React Frontend** (Enterprise)
- **Feature-rich**: Full TypeScript enterprise UI
- **Advanced features**: Complex state management, animations
- **Perfect for**: Large teams, complex workflows, enterprise deployments
- **Port**: `3000`

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Alpine.js     │    │     React       │    │   PostgreSQL    │
│   Frontend      │    │   Frontend      │    │   Database      │
│   Port 8090     │    │   Port 3000     │    │   Port 5433     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Backend   │
                    │   Port 3009     │
                    │  (Webhook Proxy)│
                    └─────────────────┘
```

## 📦 Deployment Options

### 🎯 **Option 1: One-Command Start (Recommended)**
```bash
./start.sh
```

### 🐳 **Option 2: Docker Compose**
```bash
# Alpine.js frontend (lightweight)
docker-compose -f docker-compose.demo.yml up -d

# Full React frontend
docker-compose up -d
```

### 🏢 **Option 3: Production Server Deployment**
Deploy to your production server using the tested configuration:

```bash
# SSH to your server
ssh username@your-server-ip

# One-liner deployment with webhook fixes:
docker stop projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null; docker rm projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null; docker network create root_projecthub-network 2>/dev/null; docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub_password -e POSTGRES_DB=projecthub_mcp -p 5433:5432 --network root_projecthub-network postgres:15-alpine && docker run -d --name projecthub-backend -p 3009:3010 -e DATABASE_URL=postgresql://projecthub:projecthub_password@projecthub-postgres:5432/projecthub_mcp -e JWT_SECRET=your-secret-key-here -e CORS_ORIGIN="*" --network root_projecthub-network anubissbe/projecthub-backend:latest && docker run -d --name projecthub-frontend -p 5174:80 --network root_projecthub-network anubissbe/projecthub-frontend:latest

# Verify deployment
curl http://your-server-ip:5174/  # Frontend
curl http://your-server-ip:3009/health  # Backend API (updated port)
```

**Production URLs:**
- 🌐 **Frontend**: http://your-server-ip:5174
- 📡 **Backend API**: http://your-server-ip:3009 ⚠️ **Updated Port**
- 🗄️ **Database**: your-server-ip:5433
- 🔧 **Default Login**: admin@projecthub.com / dev123

> 💡 **Note**: Replace `your-server-ip` and `username` with your actual server details

### ⚙️ **Option 4: Manual Setup**
```bash
# 1. Start PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_USER=projecthub \
  -e POSTGRES_PASSWORD=projecthub_password \
  -e POSTGRES_DB=projecthub_mcp \
  -p 5433:5432 postgres:16-alpine

# 2. Start Alpine.js frontend
cd new-frontend && docker build -t projecthub-frontend .
docker run -d -p 8090:80 projecthub-frontend
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://projecthub:password@localhost:5433/projecthub_mcp

# Security
JWT_SECRET=your-secure-secret-here
WEBHOOK_SECRET=your-webhook-secret-here

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
```

### Advanced Configuration
- 📝 **Full docs**: See [docs/](docs/) directory
- 🔐 **Security**: [SECURITY.md](SECURITY.md)
- 🚀 **Deployment**: [docs/deployment/](docs/deployment/)
- 📖 **Wiki**: [wiki/](wiki/) for detailed guides

### 🏢 Production Server Deployment Guide

For production deployment on your server, follow these tested steps:

#### Prerequisites
- SSH access to your server
- Docker installed
- Ports 3008, 5174, and 5433 available

#### ⚡ Quick Deployment (Recommended)

**One-liner deployment command:**
```bash
ssh username@your-server-ip 'docker stop projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null; docker rm projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null; docker network create root_projecthub-network 2>/dev/null; docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub_password -e POSTGRES_DB=projecthub_mcp -p 5433:5432 --network root_projecthub-network postgres:15-alpine && docker run -d --name projecthub-backend -p 3009:3010 -e DATABASE_URL=postgresql://projecthub:projecthub_password@projecthub-postgres:5432/projecthub_mcp -e JWT_SECRET=your-secret-key-here -e CORS_ORIGIN="*" --network root_projecthub-network anubissbe/projecthub-backend:latest && docker run -d --name projecthub-frontend -p 5174:80 --network root_projecthub-network anubissbe/projecthub-frontend:latest'
```

#### 📋 Step-by-Step Deployment

1. **Connect to Synology NAS**
   ```bash
   ssh username@your-server-ip
   ```

2. **Clean Previous Deployment**
   ```bash
   # Stop and remove any existing containers
   docker stop projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null
   docker rm projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null
   ```

3. **Deploy Working Version**
   ```bash
   # Create network
   docker network create root_projecthub-network 2>/dev/null
   
   # Deploy database
   docker run -d --name projecthub-postgres \
     -e POSTGRES_USER=projecthub \
     -e POSTGRES_PASSWORD=projecthub_password \
     -e POSTGRES_DB=projecthub_mcp \
     -p 5433:5432 \
     --network root_projecthub-network \
     postgres:15-alpine
   
   # Deploy backend (with ALL features)
   docker run -d --name projecthub-backend \
     -p 3009:3010 \
     -e DATABASE_URL=postgresql://projecthub:projecthub_password@projecthub-postgres:5432/projecthub_mcp \
     -e JWT_SECRET=your-secret-key-here \
     -e CORS_ORIGIN="*" \
     --network root_projecthub-network \
     anubissbe/projecthub-backend:latest
   
   # Deploy frontend (Synology-compatible)
   docker run -d --name projecthub-frontend \
     -p 5174:80 \
     --network root_projecthub-network \
     anubissbe/projecthub-frontend:latest
   ```

4. **Verify Deployment**
   ```bash
   # Check all containers are running
   docker ps | grep projecthub
   
   # Test frontend
   curl http://localhost:5174/
   
   # Test backend API
   curl http://localhost:3009/health
   ```

## 🔔 Webhook Integration (CORS-Free!)

**NEW**: Webhook functionality now works without CORS errors!

### 🚀 Quick Webhook Setup

1. **Deploy with latest images** (important for webhook proxy):
   ```bash
   docker pull anubissbe/projecthub-backend:latest    # Has webhook proxy
   docker pull anubissbe/projecthub-frontend:latest   # Updated frontend
   ```

2. **Access ProjectHub**: http://your-server:5174

3. **Configure Slack Webhook**:
   - Go to **Settings > Webhooks**
   - Add your Slack webhook URL
   - Click **"Test"** - No more CORS errors! ✅
   - Enable events: `task.created`, `task.completed`

4. **Test Notifications**:
   - Create a new project and task
   - Mark task as completed
   - Check Slack for automatic notification! 🎉

### 🔧 How the CORS Fix Works

The latest backend includes a **webhook proxy service** that:
- Intercepts webhook calls from the frontend
- Makes the actual HTTP requests to Slack server-side
- Returns results back to frontend
- **No more browser CORS restrictions!**

### 📋 Webhook Endpoints

- **Test webhook**: `POST /api/webhooks/:id/test`
- **Manage webhooks**: `GET/POST/PUT/DELETE /api/webhooks`
- **Automatic triggers**: Task creation and completion

#### Docker Images Used (LATEST & RECOMMENDED)
- **Backend**: `anubissbe/projecthub-backend:latest` (PostgreSQL + Webhook proxy)
- **Frontend**: `anubissbe/projecthub-frontend:latest` (Updated for webhook fix)
- **Database**: `postgres:15-alpine`

#### What's Fixed in Latest Images
- ✅ **Webhook CORS Fix**: Proxy-based webhooks prevent browser CORS errors
- ✅ **Complete Backend**: Analytics, webhooks, user management all implemented
- ✅ **Auth Working**: Real JWT tokens, proper logout functionality
- ✅ **Production Ready**: Nginx config that works on production servers
- ✅ **No Mock Data**: Clean database, no hardcoded sample data
- ✅ **Network Connectivity**: Proper Docker networking between services

#### Troubleshooting
- **Port conflicts**: Ensure ports 3009, 5174, and 5433 are available
- **Database issues**: Check PostgreSQL health with `docker exec projecthub-postgres pg_isready`
- **Network problems**: Verify Docker network creation with `docker network ls`

#### Post-Deployment Security
- Change default JWT secret in backend environment
- Update database password from default
- Review and update default admin credentials

#### Additional Resources
- `DEPLOYMENT_INSTRUCTIONS.md` - Complete deployment guide
- `deploy-clean-to-synology.sh` - Automated deployment script
- `verify-deployment.sh` - Deployment verification script
- `docker-compose.clean.yml` - Clean deployment configuration

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Local Development
```bash
# 1. Clone and setup
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# 2. Start development environment
./start.sh --dev

# 3. Development URLs
# Alpine.js: http://localhost:8090
# React: http://localhost:3000
# API: http://localhost:3007
# Database: localhost:5433
```

### Available Scripts
```bash
# Deployment
./start.sh                # Start in development mode
./start.sh --production   # Start in production mode
./start.sh --stop         # Stop all services
./start.sh --logs         # Show logs
./start.sh --health       # Check service health
./start.sh --clean        # Clean up everything

# Development (in respective directories)
npm run dev               # Start development server
npm run build             # Build for production
npm run test              # Run tests
npm run lint              # Run linting
```

## 🤖 AI Assistant Integration

ProjectHub-MCP includes full support for AI coding assistants through the Model Context Protocol (MCP). This allows AI agents to manage projects, create tasks, and track progress automatically.

### Quick Setup for AI Assistants

1. **Deploy ProjectHub** (see deployment section above)
2. **Install MCP Server**:
   ```bash
   cd mcp-server
   npm install
   ```
3. **Configure your AI assistant** (see [AI Integration Guide](AI-Integration-Guide.md))

### Supported AI Assistants
- ✅ **Claude Code** - Full MCP integration
- ✅ **Cline (VSCode)** - Native MCP support
- ✅ **Gemini CLI** - Custom tool integration
- ✅ **GitHub Copilot** - API integration
- ✅ **Cursor** - API rules configuration
- ✅ **Windsurf (Codeium)** - Workflow automation
- ✅ **Any MCP-compatible assistant**

See the complete [AI Integration Guide](AI-Integration-Guide.md) for detailed setup instructions.

## 📖 Documentation

| 📚 Resource | 📝 Description |
|-------------|----------------|
| [🤖 AI Integration Guide](AI-Integration-Guide.md) | Setup for AI assistants |
| [📁 docs/](docs/) | Complete documentation |
| [📖 wiki/](wiki/) | User guides and tutorials |
| [🏗️ PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Architecture overview |
| [🔒 SECURITY.md](SECURITY.md) | Security policy |
| [📋 CHANGELOG.md](CHANGELOG.md) | Version history |
| [🤝 CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

## 🔒 Security

- 🛡️ **JWT Authentication** with refresh tokens
- 🔐 **HMAC Webhook Security** for external integrations
- 🚨 **Automated Security Scanning** with CodeQL and Trivy
- 🔍 **Regular Dependency Updates** via Renovate
- 📋 **Security Policy**: See [SECURITY.md](SECURITY.md)

**Supported Versions**: Current version 4.6.x receives security updates.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Setup
```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/yourusername/ProjectHub-Mcp.git

# 3. Create a feature branch
git checkout -b feature/amazing-feature

# 4. Start development environment
./start.sh --dev

# 5. Make your changes and test
# 6. Submit a pull request
```

## 📊 Project Stats

- 🏗️ **Architecture**: Microservices with Docker
- 📦 **Package Size**: Alpine.js ~50KB, React ~2MB
- 🚀 **Performance**: <1s load time (Alpine.js)
- 📱 **Mobile**: 100% responsive design
- 🌍 **Browsers**: Chrome, Firefox, Safari, Edge
- 🔧 **APIs**: RESTful with OpenAPI documentation

## 🎯 Use Cases

- 🏢 **Enterprise Teams**: Multi-workspace project management
- 💻 **Software Development**: Sprint planning and tracking
- 📋 **Task Management**: Personal and team productivity
- 📊 **Analytics**: Project performance insights
- 🔗 **Integration**: MCP ecosystem compatibility
- 📱 **Mobile Teams**: Responsive mobile-first interface

## 🚀 Roadmap

- [ ] 🔄 **Real-time Collaboration**: Live editing and comments
- [ ] 🤖 **AI Integration**: Intelligent task recommendations
- [ ] 📱 **Mobile Apps**: Native iOS and Android applications
- [ ] 🔌 **Plugin System**: Extensible architecture
- [ ] 🌐 **Multi-language**: Internationalization support

See [ROADMAP.md](ROADMAP.md) for detailed planning.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🎨 **UI/UX**: Inspired by modern project management tools
- 🔧 **Technology**: Built with industry-standard frameworks
- 🌟 **Community**: Thanks to all contributors and users
- 📚 **Documentation**: Comprehensive guides and examples

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/anubissbe/ProjectHub-Mcp/discussions)
- 📧 **Contact**: See [CONTRIBUTING.md](CONTRIBUTING.md) for contact information
- 📖 **Documentation**: [docs/](docs/) and [wiki/](wiki/) directories

---

<div align="center">

**🚀 Ready to revolutionize your project management?**

[**Get Started**](https://github.com/anubissbe/ProjectHub-Mcp) • [**Documentation**](docs/) • [**Live Demo**](http://your-demo-url.com)

*Built with ❤️ by the ProjectHub-MCP Team*

</div>