# ProjectHub-MCP v5.0.0

<div align="center">
  <img src="https://img.shields.io/badge/version-5.0.0-ff6500?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/status-production-4CAF50?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=for-the-badge&logo=docker" alt="Docker Ready">
  <img src="https://img.shields.io/badge/enterprise-grade-9c27b0?style=for-the-badge" alt="Enterprise Grade">
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" alt="License">
</div>

<br/>

<div align="center">
  <h2>Enterprise Project Management Platform</h2>
  <p><strong>Transform your development workflow with real-time collaboration, AI integration, and powerful analytics</strong></p>
</div>

<div align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-support">Support</a>
</div>

---

## 🎯 Overview

ProjectHub-MCP is a cutting-edge project management platform designed for modern development teams. Built with enterprise-grade architecture and featuring a sleek dark theme with signature orange accents, it delivers powerful tools for managing projects, tracking tasks, and analyzing team performance in real-time.

### 🏆 Why Choose ProjectHub-MCP?

- **🚀 Modern Stack**: React 19, TypeScript, Node.js 18+, PostgreSQL 15+
- **🎨 Professional UI**: Dark theme with custom orange branding
- **📊 Real Analytics**: Live dashboards with actual data (no mock data)
- **🤖 AI Ready**: Full Claude Code and MCP protocol integration
- **🔒 Enterprise Security**: JWT auth, rate limiting, input sanitization
- **🐳 Container First**: Complete Docker orchestration
- **⚡ Real-time**: WebSocket support for instant updates

## ✨ Features

### 📋 Project Management
- **Complete CRUD Operations**: Create, read, update, and delete projects
- **Cascade Deletion**: Safely remove projects with all associated tasks
- **Multi-workspace Support**: Organize projects by teams or departments
- **Status Tracking**: Planning → Active → On Hold → Completed → Archived

### ✅ Task Management
- **Kanban Board**: Intuitive drag-and-drop interface
- **Priority Levels**: High, Medium, Low with visual indicators
- **Time Tracking**: Estimated vs actual time comparison
- **Dependencies**: Link related tasks and track blockers
- **Bulk Operations**: Update multiple tasks simultaneously

### 📊 Analytics Dashboard
- **Project Metrics**: Completion rates, velocity, burndown charts
- **Team Performance**: Individual and team productivity insights
- **Time Analysis**: Track estimates vs actual delivery
- **Custom Reports**: Export data in multiple formats

### 👥 Team Collaboration
- **Role-Based Access**: Admin, Developer, User with granular permissions
- **Real-time Updates**: See changes as they happen
- **Activity Feed**: Track all project and task modifications
- **@mentions**: Tag team members in comments

### 🔔 Integrations
- **Webhook Support**: Connect to Slack, Discord, Teams
- **API Access**: Full RESTful API with comprehensive documentation
- **MCP Protocol**: Native support for AI coding assistants
- **Email Notifications**: Configurable alerts and digests

## 🖼️ Screenshots

### Dashboard Overview
![Dashboard](./screenshots/dashboard.png)
*The main dashboard featuring a dark theme with signature orange (#ff6500) accents. Shows project cards with real-time status indicators and the "MCP ENHANCED" branding. Active projects are highlighted with orange borders.*

### Kanban Board
![Kanban Board](./screenshots/kanban-board.png)
*Board selection view showing multiple project boards. Each board card displays project information with consistent dark theme styling and orange accent colors for interactive elements.*

### Analytics Dashboard
![Analytics](./screenshots/analytics-dashboard.png)
*Comprehensive analytics with real-time data visualization. Features key metrics cards (169 total tasks, 15% completion rate), task completion trends, priority distribution pie chart, and team performance radar chart. All data is calculated in real-time with no mock data.*

### Project Management with Delete Feature
![Projects](./screenshots/projects-list.png)
*Project management table showing the new DELETE functionality (v5.0.0). Each project row includes View and Delete buttons in the Actions column. The red Delete buttons provide safe cascade deletion with confirmation dialogs.*

### User Interface Features
<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>🎨 Dark Theme</strong><br/>
        <sub>Professional black (#0a0a0a) background with orange (#ff6500) accents</sub>
      </td>
      <td align="center">
        <strong>📱 Responsive Design</strong><br/>
        <sub>Optimized for desktop, tablet, and mobile devices</sub>
      </td>
    </tr>
    <tr>
      <td align="center">
        <strong>⚡ Real-time Updates</strong><br/>
        <sub>Live synchronization across all connected clients</sub>
      </td>
      <td align="center">
        <strong>🔒 Secure Interface</strong><br/>
        <sub>Role-based UI elements and protected actions</sub>
      </td>
    </tr>
  </table>
</div>

### 🎨 Design Philosophy
- **Dark Theme**: Reduces eye strain during long coding sessions
- **Orange Accents**: Consistent branding throughout the interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Accessibility**: WCAG 2.1 AA compliant

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 4GB RAM minimum
- Ports 3009, 5174, 5433 available

### 🐳 Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# Start all services
docker-compose up -d

# Verify deployment
docker-compose ps

# View logs
docker-compose logs -f
```

Access the application:
- 🌐 **Frontend**: http://localhost:5174
- 🔧 **API**: http://localhost:3009
- 📊 **Health Check**: http://localhost:3009/health

Default credentials:
- **Email**: admin@projecthub.com
- **Password**: admin123

### 🏢 Production Deployment

```bash
# Pull latest images
docker pull anubissbe/projecthub-frontend:5.0.0
docker pull anubissbe/projecthub-backend:5.0.0

# Deploy with production config
docker-compose -f docker-compose.prod.yml up -d

# Setup SSL/TLS (optional)
# See documentation for nginx reverse proxy setup
```

## 🏗️ Architecture

```mermaid
graph TD
    A[React Frontend<br/>Port 5174] -->|REST API| B[Node.js Backend<br/>Port 3009]
    B --> C[PostgreSQL DB<br/>Port 5433]
    B --> D[Redis Cache<br/>Port 6379]
    B --> E[WebSocket Server]
    B --> F[MCP Server<br/>Port 3001]
    
    style A fill:#ff6500,stroke:#fff,color:#fff
    style B fill:#68a063,stroke:#fff,color:#fff
    style C fill:#336791,stroke:#fff,color:#fff
```

### Technology Stack

<table>
<tr>
<td width="50%">

**Frontend**
- ⚛️ React 19.0.0
- 📘 TypeScript 5.6
- 🎨 Tailwind CSS 3.4
- 📊 Chart.js 4.4
- 🔄 SortableJS
- 🎯 Alpine.js

</td>
<td width="50%">

**Backend**
- 🟢 Node.js 18+
- 🚂 Express 4.21
- 🐘 PostgreSQL 15+
- 🔐 JWT Auth
- 🔌 Socket.io
- 📡 REST API

</td>
</tr>
</table>

## 📖 Documentation

### 🔧 Configuration

Create `.env` file in root directory:

```env
# Database
DATABASE_URL=postgresql://projecthub:projecthub123@localhost:5432/projecthub_mcp

# Authentication
JWT_SECRET=your-super-secret-key-change-this
SESSION_SECRET=another-secret-key

# API Configuration
API_PORT=3009
FRONTEND_PORT=5174

# CORS
CORS_ORIGIN=http://localhost:5174

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Redis
REDIS_URL=redis://localhost:6379

# Optional: MCP
MCP_SERVER_URL=http://localhost:3001
```

### 🔐 Security Features

- **Authentication**: JWT tokens with 24-hour expiry and refresh
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API throttling to prevent abuse
- **Input Validation**: Comprehensive sanitization
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **HTTPS**: SSL/TLS encryption ready

## 📡 API Reference

### Authentication Endpoints

```http
POST   /api/auth/login       # User login
POST   /api/auth/register    # New user registration
POST   /api/auth/refresh     # Refresh JWT token
GET    /api/auth/profile     # Get current user
POST   /api/auth/logout      # Logout user
```

### Project Endpoints

```http
GET    /api/projects         # List all projects
POST   /api/projects         # Create new project
GET    /api/projects/:id     # Get project details
PUT    /api/projects/:id     # Update project
DELETE /api/projects/:id     # Delete project (cascade)
GET    /api/projects/:id/stats # Project statistics
```

### Task Endpoints

```http
GET    /api/tasks            # List all tasks
POST   /api/tasks            # Create new task
GET    /api/tasks/:id        # Get task details
PUT    /api/tasks/:id        # Update task
DELETE /api/tasks/:id        # Delete task
POST   /api/tasks/:id/move   # Move task between columns
```

### Analytics Endpoints

```http
GET    /api/analytics        # Global analytics
GET    /api/analytics/projects/:id # Project analytics
GET    /api/analytics/teams  # Team performance
GET    /api/analytics/export # Export data
```

### Example API Usage

```javascript
// Create a new project
const response = await fetch('http://localhost:3009/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    name: 'New Feature Development',
    description: 'Implement user authentication',
    workspace_id: '1',
    status: 'active'
  })
});

const project = await response.json();
```

## 🤖 AI Integration

ProjectHub-MCP includes native support for AI coding assistants:

### Claude Code Integration

```javascript
// Initialize ProjectHub client
const projectHub = new ProjectHubClient();

// Create project with AI assistance
const project = await projectHub.createProject({
  name: "AI-Powered Feature",
  description: "Implement with Claude Code assistance",
  workspace_id: "1",
  status: "planning"
});

// AI can track progress
await projectHub.updateTask(taskId, {
  status: "in_progress",
  ai_assisted: true
});
```

### Supported AI Tools
- ✅ Claude Code (Anthropic)
- ✅ GitHub Copilot
- ✅ Cursor
- ✅ Cline (VSCode)
- ✅ Custom MCP clients

## 🚦 Monitoring & Health

### Health Check Endpoints

```bash
# Frontend health
curl http://localhost:5174/health

# Backend health
curl http://localhost:3009/health

# Database health
curl http://localhost:3009/health/db

# Full system status
curl http://localhost:3009/health/full
```

### Performance Metrics
- **Page Load**: < 1.5 seconds
- **API Response**: < 100ms average
- **WebSocket Latency**: < 50ms
- **Database Queries**: < 10ms
- **Concurrent Users**: 1000+

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📈 Changelog

### v5.0.0 (2025-01-04)
- ✨ Complete project deletion with cascade
- 🔒 Enhanced security features (rate limiting, sanitization)
- 📊 Real-time analytics with actual data
- 🐛 Fixed browser caching issues
- 🎨 UI/UX improvements
- 📱 Improved mobile responsiveness
- 🔄 Fixed status mapping between frontend and backend
- 🚀 Performance optimizations

### v4.8.0 (2024-12-30)
- 🔔 Webhook integration with CORS proxy
- 👤 User management system
- 🎯 Task dependencies
- 📧 Email notifications

[View Full Changelog](./CHANGELOG.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md).

```bash
# Setup development environment
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp
npm install
npm run dev

# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm test

# Submit pull request
```

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commits

## 📞 Support

<table>
<tr>
<td align="center">
  <a href="https://github.com/anubissbe/ProjectHub-Mcp/issues">
    <strong>🐛 Bug Reports</strong><br/>
    GitHub Issues
  </a>
</td>
<td align="center">
  <a href="https://github.com/anubissbe/ProjectHub-Mcp/discussions">
    <strong>💬 Discussions</strong><br/>
    Community Forum
  </a>
</td>
<td align="center">
  <a href="https://github.com/anubissbe/ProjectHub-Mcp/wiki">
    <strong>📖 Documentation</strong><br/>
    Wiki & Guides
  </a>
</td>
</tr>
</table>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>
    <strong>Built with ❤️ by the ProjectHub-MCP Team</strong>
  </p>
  <p>
    <a href="https://github.com/anubissbe/ProjectHub-Mcp">GitHub</a> •
    <a href="https://hub.docker.com/u/anubissbe">Docker Hub</a> •
    <a href="https://github.com/anubissbe/ProjectHub-Mcp/releases">Releases</a>
  </p>
</div>