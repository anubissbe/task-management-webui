# 🚀 ProjectHub-MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-4.6.0-blue.svg)](https://github.com/anubissbe/ProjectHub-Mcp/releases)
[![Alpine.js](https://img.shields.io/badge/Alpine.js-3.0-blue?logo=alpinedotjs)](https://alpinejs.dev/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)](https://github.com/anubissbe/ProjectHub-Mcp)

> 🎯 **Enterprise-grade project management system** with real-time collaboration, advanced analytics, team management, and seamless MCP (Model Context Protocol) integration

## 🐳 Docker Hub Images

Pre-built images available:
```bash
docker pull telkombe/projecthub-frontend:latest
docker pull telkombe/projecthub-backend:latest
```

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

### 🔧 Important Fixes Applied (v4.6.0+)

This version includes critical fixes for common issues:
- ✅ **CORS Configuration**: Backend properly allows frontend connections
- ✅ **Alpine.js Variables**: All required variables are now defined
- ✅ **Script Loading Order**: app.js loads before Alpine.js
- ✅ **Dynamic API URL**: Automatically detects deployment environment

That's it! ProjectHub-MCP will be running with:
- 🗄️ **PostgreSQL Database**: `localhost:5433`
- 🌐 **Frontend Interface**: `http://localhost:8090`
- 📡 **API Backend**: `http://localhost:3007` (if using full stack)

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
                    │   Port 3007     │
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

### ⚙️ **Option 3: Manual Setup**
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

## 📖 Documentation

| 📚 Resource | 📝 Description |
|-------------|----------------|
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