<div align="center">

<img src="docs/logo.svg" alt="ProjectHub-Mcp Logo" width="400" height="120" />

# ProjectHub — MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-ff6500?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![MCP Enhanced](https://img.shields.io/badge/MCP-Enhanced-ff6500?style=for-the-badge)](https://docs.anthropic.com/en/docs/build-with-claude/mcp)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-Support-ff6500?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://www.buymeacoffee.com/anubissbe)

[![CI/CD Pipeline](https://github.com/anubissbe/ProjectHub-Mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/anubissbe/ProjectHub-Mcp/actions/workflows/ci.yml)
[![Build All Containers](https://github.com/anubissbe/ProjectHub-Mcp/actions/workflows/build-all.yml/badge.svg)](https://github.com/anubissbe/ProjectHub-Mcp/actions/workflows/build-all.yml)

> **A modern, enterprise-grade project management hub with MCP (Model Context Protocol) integration, featuring advanced task tracking, workflow templates, team collaboration, and comprehensive analytics.**

## ⭐ Star this repository if you find it helpful!

</div>

---

## 📊 Project Status

- **Current Version**: 1.0.0
- **Completion**: 91.7% (22/24 tasks completed)
- **Active Development**: Yes
- **Production Ready**: Yes (with 2 pending branding fixes)
- **Container Images**: Available on [GitHub Container Registry](https://github.com/anubissbe/ProjectHub-Mcp/pkgs/container/projecthub-mcp-frontend)

---

## 🌟 Features

### 🚀 Core Features
- **📊 Multiple View Modes**: Kanban Board, List View, Calendar, and Timeline views
- **🔄 Real-time Updates**: Live synchronization across users
- **🌓 Dark Mode**: Full dark mode support with consistent black/orange branding
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔍 Advanced Filtering**: Filter by status, priority, assignee, and more
- **📈 Analytics Dashboard**: Comprehensive project analytics and insights
- **➕ Project Creation**: Create new projects with requirements and acceptance criteria
- **🚦 Smart Completion**: Projects can only be marked complete when all tasks are done

### 🎯 Task Management
- **Hierarchical Tasks**: Support for subtasks and task dependencies
- **Drag & Drop**: Intuitive task reordering and status updates
- **Bulk Operations**: Update multiple tasks at once
- **Time Tracking**: Built-in timer and time logging
- **Task Templates**: Reusable templates for common workflows
- **Export Options**: Export tasks to CSV, JSON, PDF, or Excel
- **Project Completion**: Smart project completion tracking (91.7% complete)
- **Status Management**: Pending, In Progress, Completed, Blocked, Testing states

### 🤝 Collaboration
- **Comments System**: Threaded comments with mentions
- **File Attachments**: Attach files to tasks with preview support
- **Activity Feed**: Track all changes and updates
- **Task Dependencies**: Visual dependency graph
- **Team Management**: Assign tasks to team members

### 🔮 Upcoming Features
- **🔌 Enhanced MCP Integrations**: AI-powered task suggestions with knowledge graphs
- **🔐 User Authentication**: JWT-based auth with role management
- **👥 Team Workspaces**: Multi-tenant workspaces with permissions
- **📊 Advanced Analytics**: Custom reports and export capabilities
- **📱 Mobile App**: React Native app for iOS/Android
- **📧 Email Notifications**: Task reminders and updates
- **🪝 API Webhooks**: External integrations and automation
- **💾 Offline Mode**: Work without internet connection

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### 🐳 Docker Installation (Recommended)

The fastest way to get started is using Docker Compose with all required services:

```bash
# 1. Create a directory for your installation
mkdir projecthub-mcp && cd projecthub-mcp

# 2. Create docker-compose.yml with all services
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-postgres
    environment:
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: changeme123
      POSTGRES_DB: projecthub_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U projecthub"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/anubissbe/projecthub-mcp-backend:latest
    container_name: projecthub-backend
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://projecthub:changeme123@postgres:5432/projecthub_db
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: ghcr.io/anubissbe/projecthub-mcp-frontend:latest
    container_name: projecthub-frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3001/api
      VITE_WS_URL: ws://localhost:3001
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  default:
    name: projecthub-network
EOF

# 3. Start all services
docker compose up -d

# 4. Wait for services to be ready (about 30 seconds)
echo "⏳ Waiting for services to start..."
sleep 30

# 5. Verify everything is running
docker compose ps
```

**Note:** Remember to change the default passwords in production!

🎨 **The application features dramatic black/orange branding with:**
- Modern gradient backgrounds and glowing effects
- Animated navigation and interactive elements
- Consistent dark mode throughout all pages
- Professional ProjectHub-MCP aesthetic

Visit **http://localhost:5173** to see your ProjectHub-MCP instance!

## 📸 Screenshots

<div align="center">

### 🏠 Homepage with Dark Theme
<img src="docs/screenshots/homepage-dark.png" alt="ProjectHub-MCP Homepage Dark" width="800" />

*Dramatic black background with vibrant orange accents and modern UI*

### 📊 Projects Overview
<img src="docs/screenshots/projects-list.png" alt="Projects List" width="800" />

*Clean project management interface with statistics and quick actions*

### 📋 Kanban Board View
<img src="docs/screenshots/kanban-board.png" alt="Kanban Board" width="800" />

*Drag-and-drop task management with visual workflow tracking*

### 📈 Analytics Dashboard
<img src="docs/screenshots/analytics-dashboard.png" alt="Analytics Dashboard" width="800" />

*Comprehensive project analytics with charts and performance insights*

</div>

### 🎨 Theme & Responsive Design

<table align="center">
<tr>
<td align="center"><strong>🌙 Dark Mode (Default)</strong></td>
<td align="center"><strong>☀️ Light Mode</strong></td>
<td align="center"><strong>📱 Mobile View</strong></td>
</tr>
<tr>
<td><img src="docs/screenshots/homepage-dark.png" alt="Dark Theme" width="280" /></td>
<td><img src="docs/screenshots/homepage-light.png" alt="Light Theme" width="280" /></td>
<td><img src="docs/screenshots/mobile-view.png" alt="Mobile View" width="150" /></td>
</tr>
<tr>
<td align="center"><em>Professional black/orange</em></td>
<td align="center"><em>Clean light alternative</em></td>
<td align="center"><em>Fully responsive</em></td>
</tr>
</table>

### Development Setup

For local development with hot-reload:

```bash
# 1. Clone the repository
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# 2. Start PostgreSQL (required)
docker run -d \
  --name projecthub-postgres \
  -e POSTGRES_USER=projecthub \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=projecthub_db \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Install dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 4. Create .env files
# Backend .env
cat > backend/.env << EOF
DATABASE_URL=postgresql://projecthub:devpassword@localhost:5432/projecthub_db
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
EOF

# Frontend .env
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
EOF

# 5. Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
# PostgreSQL: localhost:5432
```

## 🐳 Container Images

Pre-built container images are available on GitHub Container Registry:

- **Frontend**: `ghcr.io/anubissbe/projecthub-mcp-frontend:latest`
- **Backend**: `ghcr.io/anubissbe/projecthub-mcp-backend:latest`

Images are automatically built and published via GitHub Actions.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for blazing fast builds
- Tailwind CSS for styling with custom orange/black theme
- Zustand for state management
- React Router for navigation
- Socket.io client for real-time updates

**Backend:**
- Node.js with Express and TypeScript
- PostgreSQL with pgvector for advanced querying
- Socket.io for WebSocket connections
- RESTful API with comprehensive endpoints

**Infrastructure:**
- Docker & Docker Compose for containerization
- GitHub Actions for CI/CD
- Automated testing and deployment

### Project Structure

```
ProjectHub-Mcp/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   └── types/             # TypeScript definitions
├── backend/                   # Node.js backend API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── db.js            # Database connection
├── tests/                    # Test files and screenshots
└── docker-compose.yml       # Container orchestration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file to customize your installation:

```env
# Database Configuration
POSTGRES_USER=projecthub
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=projecthub_db
DATABASE_URL=postgresql://projecthub:your_secure_password_here@postgres:5432/projecthub_db

# Backend Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend Configuration  
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Optional: External PostgreSQL
# DATABASE_URL=postgresql://user:password@your-postgres-host:5432/projecthub_db
```

For production deployments, ensure you:
- Use strong passwords
- Configure CORS_ORIGIN to match your domain
- Update VITE_API_URL to your API endpoint
- Use HTTPS/WSS for secure connections

## 📚 API Documentation

### Core Endpoints

**Projects:**
```
GET    /api/projects              # List all projects
GET    /api/projects/:id          # Get project details
POST   /api/projects              # Create new project
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
GET    /api/projects/:id/stats    # Get project statistics
```

**Tasks:**
```
GET    /api/projects/:projectId/tasks  # List tasks for project
GET    /api/tasks/:id                  # Get task details
POST   /api/tasks                      # Create new task
PUT    /api/tasks/:id                  # Update task
DELETE /api/tasks/:id                  # Delete task
GET    /api/tasks/:id/subtasks         # Get subtasks
```

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Run all tests
npm run test:all
```

Test coverage includes:
- Unit tests for components and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Dark mode compatibility tests

## 🚀 Deployment

### Production Deployment

1. **GitHub Actions (Automated)**: 
   - Push to main branch triggers automatic deployment
   - Builds and pushes containers to GitHub Container Registry
   - Deploys to configured servers

2. **Manual Deployment**:
   ```bash
   # Pull latest images
   docker compose pull
   
   # Start services
   docker compose up -d
   ```

### Cloud Deployment

The application is ready for deployment on:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Docker-compatible platform

## 🔧 Troubleshooting

### Common Issues

**PostgreSQL Connection Failed**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs projecthub-postgres

# Test connection
docker exec -it projecthub-postgres psql -U projecthub -d projecthub_db -c "SELECT 1"

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

**Port Already in Use**
```bash
# Check what's using the ports
lsof -i :5173  # Frontend
lsof -i :3001  # Backend  
lsof -i :5432  # PostgreSQL

# Stop conflicting services or change ports in docker-compose.yml
```

**Database Migrations**
```bash
# The backend automatically runs migrations on startup
# To reset and re-run migrations:
docker compose restart backend
```

## 🎨 Theming & Customization

### Dark Mode Branding

The application features a consistent dark theme with:
- **Primary Colors**: Black (#0a0a0a) and Orange (#ff6500)
- **Gradients**: Smooth transitions between dark and orange tones
- **Typography**: High contrast for accessibility
- **Interactive Elements**: Orange accents on hover/focus states

### Customization

1. **Colors**: Edit `tailwind.config.js` for color scheme changes
2. **Components**: Modify components in `src/components/`
3. **Layouts**: Update page layouts in `src/pages/`
4. **Styles**: Add custom CSS in `src/index.css`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper testing
4. Commit using conventional commit format
5. Push to your branch
6. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Maintain test coverage
- Document complex functionality

## 📋 Roadmap

### Upcoming Features

- [ ] Enhanced MCP integrations
- [ ] User authentication and authorization
- [ ] Team workspaces and permissions
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] API webhooks
- [ ] Offline mode support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- Styled with Tailwind CSS
- Real-time features powered by Socket.io
- Database powered by PostgreSQL
- Icons from Heroicons

## 📞 Support

- 🐛 [Report Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- 💡 [Request Features](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- 📚 [Documentation](docs/)
- 💬 [Discussions](https://github.com/anubissbe/ProjectHub-Mcp/discussions)

---

<div align="center">

**Made with ❤️ and ☕ by [@anubissbe](https://github.com/anubissbe)**

[![GitHub stars](https://img.shields.io/github/stars/anubissbe/ProjectHub-Mcp?style=social)](https://github.com/anubissbe/ProjectHub-Mcp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/anubissbe/ProjectHub-Mcp?style=social)](https://github.com/anubissbe/ProjectHub-Mcp/network)

### ☕ Support the Project

If ProjectHub — MCP helps your team, please consider supporting the development:

<a href="https://www.buymeacoffee.com/anubissbe" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" height="60" width="217">
</a>

*Your support helps maintain and improve ProjectHub — MCP! ⭐ Also consider starring the repository!*

</div>
