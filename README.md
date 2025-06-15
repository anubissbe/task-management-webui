# 🚀 ProjectHub-Mcp

[![CI/CD Pipeline](https://github.com/username/ProjectHub-Mcp/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/username/ProjectHub-Mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-orange.svg)](https://buymeacoffee.com/anubissbe)

> A comprehensive, enterprise-grade project management hub with MCP integration, featuring advanced time tracking, workflow templates, dependency visualization, team collaboration, and analytics dashboard.

## ⭐ Star this repository if you find it helpful!

<div align="center">

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/anubissbe/task-management-webui?style=for-the-badge&logo=github&color=blue)](https://github.com/anubissbe/task-management-webui/releases)
[![GitHub stars](https://img.shields.io/github/stars/anubissbe/task-management-webui?style=for-the-badge&logo=github&color=yellow)](https://github.com/anubissbe/task-management-webui/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/anubissbe/task-management-webui?style=for-the-badge&logo=github&color=green)](https://github.com/anubissbe/task-management-webui/network)
[![GitHub license](https://img.shields.io/github/license/anubissbe/task-management-webui?style=for-the-badge&logo=github&color=orange)](https://github.com/anubissbe/task-management-webui/blob/main/LICENSE)

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

### ☕ Support the Project

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20Development-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/anubissbe)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-Sponsor%20Me-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/anubissbe)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/anubissbe)

---

**A modern, full-featured task management application built with React, TypeScript, and Node.js. Features a beautiful UI with multiple views, real-time updates, and comprehensive project tracking capabilities.**

</div>

![Task Management WebUI](docs/images/homepage.png)

## 🌟 Features

### Core Features
- **📊 Multiple View Modes**: Kanban Board, List, Calendar, and Timeline/Gantt views
- **🔄 Real-time Updates**: WebSocket-based live synchronization across users
- **🌓 Dark Mode**: Full dark mode support with excellent contrast
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔍 Advanced Filtering**: Filter by status, priority, assignee, and more
- **📈 Analytics Dashboard**: Comprehensive project analytics and insights

### Task Management
- **Hierarchical Tasks**: Support for subtasks and task dependencies
- **Drag & Drop**: Intuitive task reordering and status updates
- **Bulk Operations**: Update multiple tasks at once
- **Time Tracking**: Built-in Pomodoro timer and time logging
- **Task Templates**: Reusable task templates for common workflows
- **Export Options**: Export tasks to CSV, JSON, PDF, or Excel
- **Project Completion**: Mark projects as completed when all tasks are done

### Collaboration
- **Comments System**: Threaded comments with mentions
- **File Attachments**: Attach files to tasks with preview support
- **Activity Feed**: Track all changes and updates
- **Task Dependencies**: Visual dependency graph
- **Assignee Management**: Assign tasks to team members

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (handled by Docker)

### Quick Installation (Recommended)

Download and run the latest release:
```bash
# Download and extract the latest release
curl -L https://github.com/anubissbe/task-management-webui/releases/download/v1.0.0/task-management-webui-v1.0.0-full.tar.gz | tar -xz

# Start the application
docker compose up -d
```

### Development Installation

1. Clone the repository:
```bash
git clone https://github.com/anubissbe/task-management-webui.git
cd task-management-webui
```

2. Start the application:
```bash
docker compose up -d
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health

### Development Setup

For local development without Docker:

```bash
# Navigate to project directory
cd /opt/projects/projects/ProjectHub-Mcp

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

## 📸 Screenshots

### Project Dashboard & Tasks
![Project Tasks](docs/images/project-tasks.png)

### Analytics Dashboard
![Analytics](docs/images/analytics.png)

### Kanban Board View
![Kanban Board](docs/images/kanban.png)

### Board View with Drag & Drop
![Board View](docs/images/board.png)

### List View
![List View](docs/images/list.png)

### Calendar View
![Calendar View](docs/images/calendar.png)

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for blazing fast builds
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- Socket.io client for real-time updates
- Recharts for data visualization
- date-fns for date manipulation

**Backend:**
- Node.js with Express
- TypeScript
- PostgreSQL with pgvector
- Socket.io for WebSockets
- JWT authentication (ready)
- Swagger/OpenAPI documentation

**Infrastructure:**
- Docker & Docker Compose
- GitHub Actions CI/CD ready
- Automated testing with Jest & Playwright

### Project Structure

```
task-management-webui/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── BulkTaskActions.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── CreateTaskModal.tsx
│   │   │   ├── EditTaskModal.tsx
│   │   │   ├── ExportReports.tsx
│   │   │   ├── ExportTasks.tsx
│   │   │   ├── FileAttachments.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── PomodoroTimer.tsx
│   │   │   ├── SimpleDraggableTaskList.tsx
│   │   │   ├── TaskAnalytics.tsx
│   │   │   ├── TaskComments.tsx
│   │   │   ├── TaskDependencyGraph.tsx
│   │   │   ├── TaskDetailModal.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskTemplates.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── TimelineView.tsx
│   │   │   └── TimeTrackingDashboard.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── Board.tsx
│   │   │   ├── BoardSelector.tsx
│   │   │   ├── EnhancedAnalytics.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   └── Projects.tsx
│   │   ├── services/          # API services
│   │   │   ├── api.ts
│   │   │   ├── projectService.ts
│   │   │   └── taskService.ts
│   │   ├── store/             # State management
│   │   │   ├── index.ts
│   │   │   ├── projectStore.ts
│   │   │   └── themeStore.ts
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useRealtimeUpdates.ts
│   │   ├── types/             # TypeScript definitions
│   │   │   └── index.ts
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── backend/                   # Node.js backend API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── db.js            # Database connection
│   └── tests/               # Backend tests
├── docs/                     # Documentation
│   ├── images/              # Screenshots and diagrams
│   ├── api/                # API documentation
│   ├── architecture/       # Architecture diagrams
│   └── deployment/         # Deployment guides
├── infrastructure/          # Infrastructure configs
│   └── postgres/           # Database schemas
└── tests/                  # E2E tests

```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://mcp_user:mcp_secure_password_2024@localhost:5432/mcp_learning
POSTGRES_USER=mcp_user
POSTGRES_PASSWORD=mcp_secure_password_2024
POSTGRES_DB=mcp_learning

# Backend
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### Docker Compose Configuration

The application uses Docker Compose for easy deployment:
- **frontend**: React application (port 5173)
- **backend**: Node.js API (port 3001)
- **postgres**: PostgreSQL database with pgvector

## 📚 API Documentation

### Projects
```
GET    /api/projects              # List all projects
GET    /api/projects/:id          # Get project details
POST   /api/projects              # Create new project
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
GET    /api/projects/:id/stats    # Get project statistics
```

### Tasks
```
GET    /api/projects/:projectId/tasks  # List tasks for project
GET    /api/tasks/:id                  # Get task details
POST   /api/tasks                      # Create new task
PUT    /api/tasks/:id                  # Update task
PATCH  /api/tasks/:id/status           # Update task status
DELETE /api/tasks/:id                  # Delete task
POST   /api/tasks/bulk                 # Create multiple tasks
GET    /api/tasks/:id/subtasks         # Get subtasks
```

### Time Tracking
```
POST   /api/tasks/:id/time             # Log time entry
GET    /api/tasks/:id/time-tracking    # Get time tracking data
GET    /api/projects/:id/time-summary  # Project time summary
```

### Export & Analytics
```
GET    /api/projects/:id/analytics     # Get project analytics
GET    /api/projects/:id/export        # Export project data
<<<<<<< HEAD
POST   /api/export/tasks               # Export filtered tasks
=======
GET    /api/tasks/:id/time-tracking    # Get time tracking data
```

## 🗄️ Database Schema

The application uses the `project_management` schema with these tables:

### Core Tables
- **projects**: Project information and metadata
- **tasks**: Task details with hierarchical structure
- **task_dependencies**: Task relationship mapping
- **task_history**: Comprehensive change tracking

### Collaboration Tables
- **task_comments**: Threaded comment system
- **task_attachments**: File attachment metadata
- **activity_entries**: Activity feed and audit trail
- **task_mentions**: @mention tracking

### Analytics Tables
- **time_tracking**: Detailed time logging
- **task_insights**: Performance analytics
- **project_stats**: Aggregated project metrics

## 🚀 Deployment

### Production Deployment
The application is deployed on a remote server with Docker Compose:

```bash
# Deploy to remote server
./scripts/deploy-projecthub-mcp.sh

# Sync database
./scripts/sync-postgres-to-remote.sh

# View remote logs
ssh drwho@192.168.1.25
cd ~/projects/ProjectHub-Mcp
docker compose logs -f
```

### Environment Variables

#### Backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_learning
CORS_ORIGIN=http://localhost:5173
NODE_ENV=production
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_APP_TITLE=ProjectHub-Mcp
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# E2E tests with Puppeteer
cd tests && node ui-test.js

# Test specific features
node test-scrolling.js
node test-dark-mode.js
```

### Test Coverage

The project maintains comprehensive test coverage:
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Visual regression tests
- Dark mode compatibility tests
- Scrolling and interaction tests

## 🚢 Deployment

### Production Deployment with Docker

1. Build production images:
```bash
docker compose -f docker-compose.yml build
```

2. Deploy to your server:
```bash
docker compose up -d
```

### Manual Deployment

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Build backend:
```bash
cd backend
npm run build
```

3. Serve with your preferred method (PM2, systemd, etc.)

### Cloud Deployment

The application is ready for deployment on:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Heroku Container Registry
- DigitalOcean App Platform
- Vercel (frontend) + Railway (backend)

## 🎨 Customization

### Theming

The application supports full theming through Tailwind CSS:

1. Edit `tailwind.config.js` to modify color schemes
2. Dark mode classes are automatically applied
3. Custom CSS can be added in `src/index.css`

### Adding New Features

1. Create new component in `src/components/`
2. Add routes in `src/App.tsx`
3. Create corresponding API endpoints
4. Update types in `src/types/index.ts`
5. Add tests for new functionality

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Maintain test coverage above 80%

## 📋 Roadmap

### Planned Features

- [ ] User authentication and authorization
- [ ] Team workspaces
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Webhooks and integrations
- [ ] Advanced reporting
- [ ] AI-powered task suggestions
- [ ] Voice commands
- [ ] Offline mode

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Icons from Heroicons and Lucide
- UI components inspired by Tailwind UI
- Real-time features powered by Socket.io
- Calendar components using date-fns

## ☕ Support This Project

If you find this project helpful, please consider supporting its development:

<div align="center">

[![Buy Me A Coffee](https://img.shields.io/badge/☕-Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/anubissbe)
[![GitHub Sponsors](https://img.shields.io/badge/💖-Sponsor%20on%20GitHub-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/anubissbe)
[![PayPal](https://img.shields.io/badge/💰-Donate%20via%20PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/anubissbe)

### 🌟 Ways to Support
- ⭐ Star this repository
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🔄 Share with your network
- ☕ Buy me a coffee
- 💖 Become a sponsor

</div>

## 📞 Get Help & Support

- Create an [issue](https://github.com/anubissbe/task-management-webui/issues) for bug reports
- Check the [FAQ](docs/FAQ.md) for common questions  
- Join our [Discord community](https://discord.gg/anubissbe)
- Email: support@taskmanagement.example.com
- Follow [@anubissbe](https://github.com/anubissbe) for updates

<<<<<<< HEAD
## 🏆 Performance & Quality
=======
![GitHub stars](https://img.shields.io/github/stars/username/ProjectHub-Mcp?style=social)
![GitHub forks](https://img.shields.io/github/forks/username/ProjectHub-Mcp?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/username/ProjectHub-Mcp?style=social)

<div align="center">

![Performance](https://img.shields.io/badge/Lighthouse%20Performance-95+-brightgreen?style=for-the-badge&logo=lighthouse&logoColor=white)
![Accessibility](https://img.shields.io/badge/Accessibility-AA%20Compliant-blue?style=for-the-badge&logo=web-accessibility&logoColor=white)
![Bundle Size](https://img.shields.io/badge/Bundle%20Size-<500KB-orange?style=for-the-badge&logo=webpack&logoColor=white)
![Load Time](https://img.shields.io/badge/Load%20Time-<2s-green?style=for-the-badge&logo=speedtest&logoColor=white)

</div>

### Metrics
- **🚀 Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **⚡ Load Time**: < 2s initial load
- **📦 Bundle Size**: < 500KB gzipped
- **🗄️ Database**: Optimized queries with indexing
- **🔄 Real-time**: < 100ms latency for updates
- **🎯 Test Coverage**: 80%+ code coverage
- **🔒 Security**: OWASP compliant, XSS protection

---

<div align="center">

### 🤝 Connect & Contribute

[![Follow on GitHub](https://img.shields.io/github/followers/anubissbe?label=Follow&style=social)](https://github.com/anubissbe)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/anubissbe)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/anubissbe)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/anubissbe)

<<<<<<< HEAD
### 📊 Repository Stats

![GitHub repo size](https://img.shields.io/github/repo-size/anubissbe/task-management-webui?style=for-the-badge&logo=github)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/anubissbe/task-management-webui?style=for-the-badge&logo=github)
![GitHub last commit](https://img.shields.io/github/last-commit/anubissbe/task-management-webui?style=for-the-badge&logo=github)

### 🎯 Quick Links

[![📚 Documentation](https://img.shields.io/badge/📚-Documentation-blue?style=for-the-badge)](docs/)
[![🚀 Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-green?style=for-the-badge)](http://192.168.1.25:5173)
[![🐛 Report Bug](https://img.shields.io/badge/🐛-Report%20Bug-red?style=for-the-badge)](https://github.com/anubissbe/task-management-webui/issues)
[![💡 Request Feature](https://img.shields.io/badge/💡-Request%20Feature-yellow?style=for-the-badge)](https://github.com/anubissbe/task-management-webui/issues)

---

**Made with ❤️ and ☕ by [@anubissbe](https://github.com/anubissbe)**

*If this project helped you, please consider ⭐ starring the repository and ☕ [buying me a coffee](https://www.buymeacoffee.com/anubissbe)!*
=======
[⭐ Star this repository](https://github.com/username/ProjectHub-Mcp) • [🐛 Report Bug](https://github.com/username/ProjectHub-Mcp/issues) • [✨ Request Feature](https://github.com/username/ProjectHub-Mcp/issues) • [☕ Buy me a coffee](https://buymeacoffee.com/anubissbe)

</div>