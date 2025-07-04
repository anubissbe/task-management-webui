# 🚀 ProjectHub-MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-4.8.0-blue.svg)](https://github.com/anubissbe/ProjectHub-Mcp/releases)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)](https://github.com/anubissbe/ProjectHub-Mcp)

> 🎯 **Enterprise-grade project management system** with real-time collaboration, advanced analytics, team management, webhook notifications, and complete CRUD operations including project deletion.

## 🌟 Key Features

### 🎯 **Complete Project Management**
- 📋 **Full Project Lifecycle**: Create, read, update, and **delete** projects with cascade deletion
- ✅ **Advanced Task System**: Priorities, assignments, status tracking, and dependencies
- 📊 **Kanban Board**: Drag-and-drop interface with real-time updates
- 🗑️ **Safe Deletion**: Confirmation dialogs with task count warnings

### 👥 **Team Collaboration**
- 🏢 **Role-Based Access**: Admin → Developer → User permissions
- 👤 **User Management**: Create, edit, and delete users with admin protection
- 🔐 **JWT Authentication**: Secure token-based authentication with auto-refresh

### 📊 **Analytics & Reporting**
- 📈 **Interactive Dashboards**: Project and task analytics
- 📉 **Progress Tracking**: Completion rates and productivity metrics
- 🚀 **Real-time Updates**: Live data synchronization

### 🔔 **Webhook Integration (CORS-Free)**
- 🚀 **Slack Integration**: Automatic notifications for task/project events
- 🔧 **Backend Proxy**: No more browser CORS errors
- ✅ **Test Functionality**: Built-in webhook testing

## 🐳 Quick Start (2 Minutes)

### Option 1: One-Command Deployment
```bash
# Clone and start
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp
docker-compose up -d

# Access the application
open http://localhost:5174
```

### Option 2: Production Server Deployment
```bash
# One-liner for production deployment
docker stop projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null; docker rm projecthub-backend projecthub-frontend projecthub-postgres 2>/dev/null; docker network create projecthub-network 2>/dev/null; docker run -d --name projecthub-postgres -e POSTGRES_USER=projecthub -e POSTGRES_PASSWORD=projecthub_password -e POSTGRES_DB=projecthub_mcp -p 5433:5432 --network projecthub-network postgres:15-alpine && docker run -d --name projecthub-backend -p 3009:3010 -e DATABASE_URL=postgresql://projecthub:projecthub_password@projecthub-postgres:5432/projecthub_mcp -e JWT_SECRET=your-secret-key-here -e CORS_ORIGIN="*" --network projecthub-network anubissbe/projecthub-backend:latest && docker run -d --name projecthub-frontend -p 5174:80 --network projecthub-network anubissbe/projecthub-frontend:latest
```

**Access URLs:**
- 🌐 **Frontend**: http://your-server:5174
- 📡 **Backend API**: http://your-server:3009
- 🗄️ **Database**: your-server:5433
- 🔧 **Default Login**: admin@projecthub.com / dev123

## 🐳 Docker Hub Images

```bash
# Latest images with all features (RECOMMENDED)
docker pull anubissbe/projecthub-backend:latest    # Complete API with project deletion
docker pull anubissbe/projecthub-frontend:latest   # Full-featured UI
docker pull postgres:15-alpine                     # Database
```

## ✨ What's New in v4.8.0

### 🆕 **Project Deletion Feature**
- ✅ **Complete CRUD**: Create, Read, Update, and **Delete** projects
- 🔄 **Cascade Deletion**: Automatically removes associated tasks
- ⚠️ **Smart Warnings**: Shows task count before deletion
- 🛡️ **Confirmation Dialogs**: Prevents accidental deletions

### 🔧 **How to Delete Projects**
1. **Via UI**: Projects → Select Project → Click trash icon
2. **Via API**: `DELETE /api/projects/{id}` with Authorization header

### 🐛 **Bug Fixes**
- ✅ **Webhook CORS**: Fixed browser CORS errors with backend proxy
- ✅ **Authentication**: Proper JWT token handling and refresh
- ✅ **User Management**: Admin role protection and last-admin prevention
- ✅ **Database**: Full PostgreSQL integration with connection pooling

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Local Development
```bash
# Clone and setup
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# Start development environment
docker-compose up -d

# Development URLs
# Frontend: http://localhost:5174
# Backend API: http://localhost:3009
# Database: localhost:5433
```

## 📖 API Reference

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `DELETE /api/projects/:id` - **Delete project and all tasks** ⚠️

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `PUT /api/webhooks/:id` - Update webhook
- `POST /api/webhooks/:id/test` - Test webhook (CORS-free)
- `DELETE /api/webhooks/:id` - Delete webhook

### Authentication
- `POST /api/auth/login` - Login and get JWT token

## 🔔 Webhook Setup (CORS-Free)

### Slack Integration
1. Create Slack webhook URL in your workspace
2. Go to ProjectHub → Settings → Webhooks
3. Add webhook with events: `task.created`, `task.completed`
4. Click **Test** - works without CORS errors! ✅

### Events
- `task.created` - New task notifications
- `task.completed` - Task completion notifications
- `project.created` - New project notifications (coming soon)

## 🔒 Security

- 🛡️ **JWT Authentication** with secure token management
- 🔐 **Role-Based Access Control** (Admin/Developer/User)
- 🚨 **Input Validation** and SQL injection prevention
- 🛠️ **Admin Protection**: Cannot delete self or last admin user
- ⚠️ **Cascade Safety**: Warns before deleting projects with tasks

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (Nginx)       │    │   (Node.js)     │    │   Database      │
│   Port 5174     │◄──►│   Port 3009     │◄──►│   Port 5433     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Webhook Proxy
           (Eliminates CORS)
```

## 🚀 Use Cases

- 🏢 **Enterprise Teams**: Multi-project management with role control
- 💻 **Software Development**: Sprint planning and task tracking
- 📋 **Task Management**: Personal and team productivity
- 📊 **Project Analytics**: Performance insights and reporting
- 🔗 **Team Integration**: Slack notifications and webhook automation

## 🤖 AI Assistant Integration

ProjectHub-MCP includes full Model Context Protocol (MCP) support for AI coding assistants:

- ✅ **Claude Code** - Native MCP integration
- ✅ **Cline (VSCode)** - Full API support
- ✅ **GitHub Copilot** - API integration
- ✅ **Cursor** - Workflow automation

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://projecthub:password@localhost:5433/projecthub_mcp

# Security
JWT_SECRET=your-secure-secret-here

# CORS (use * for development only)
CORS_ORIGIN=http://localhost:5174
```

### Docker Compose Override
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  backend:
    environment:
      - JWT_SECRET=your-production-secret
      - CORS_ORIGIN=https://yourdomain.com
  
  postgres:
    environment:
      - POSTGRES_PASSWORD=your-secure-password
```

## 📊 Project Stats

- 🏗️ **Architecture**: Microservices with Docker
- 📦 **Bundle Size**: Frontend ~150KB compressed
- 🚀 **Performance**: <2s load time, real-time updates
- 📱 **Responsive**: 100% mobile-compatible
- 🌍 **Browsers**: Chrome, Firefox, Safari, Edge
- 🔧 **APIs**: RESTful with comprehensive documentation

## 🛠️ Troubleshooting

### Common Issues

**Port conflicts**: Ensure ports 3009, 5174, and 5433 are available
```bash
# Check ports
netstat -tlnp | grep -E "(3009|5174|5433)"
```

**Database connection**: Verify PostgreSQL health
```bash
docker exec projecthub-postgres pg_isready -U projecthub
```

**Webhook CORS errors**: Use latest images with proxy fix
```bash
docker pull anubissbe/projecthub-backend:latest
docker pull anubissbe/projecthub-frontend:latest
```

**Container networking**: Check Docker network
```bash
docker network ls | grep projecthub
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Quick contribution setup
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp
docker-compose up -d
# Make changes and submit PR
```

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/anubissbe/ProjectHub-Mcp/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/anubissbe/ProjectHub-Mcp/wiki)

---

<div align="center">

**🚀 Ready to revolutionize your project management?**

[**Get Started**](https://github.com/anubissbe/ProjectHub-Mcp) • [**Live Demo**](http://localhost:5174) • [**Docker Hub**](https://hub.docker.com/u/anubissbe)

*Built with ❤️ for the open source community*

</div>