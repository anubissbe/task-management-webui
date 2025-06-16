<div align="center">

<img src="docs/logo.svg" alt="ProjectHub-Mcp Logo" width="400" height="120" />

# ProjectHub — MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-ff6500?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![MCP Enhanced](https://img.shields.io/badge/MCP-Enhanced-ff6500?style=for-the-badge)](https://docs.anthropic.com/en/docs/build-with-claude/mcp)

> **A modern, enterprise-grade project management hub with MCP (Model Context Protocol) integration, featuring advanced task tracking, workflow templates, team collaboration, and comprehensive analytics.**

## ⭐ Star this repository if you find it helpful!

</div>

---

## 🌟 Features

### 🚀 Core Features
- **📊 Multiple View Modes**: Kanban Board, List View, Calendar, and Timeline views
- **🔄 Real-time Updates**: Live synchronization across users
- **🌓 Dark Mode**: Full dark mode support with consistent black/orange branding
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔍 Advanced Filtering**: Filter by status, priority, assignee, and more
- **📈 Analytics Dashboard**: Comprehensive project analytics and insights

### 🎯 Task Management
- **Hierarchical Tasks**: Support for subtasks and task dependencies
- **Drag & Drop**: Intuitive task reordering and status updates
- **Bulk Operations**: Update multiple tasks at once
- **Time Tracking**: Built-in timer and time logging
- **Task Templates**: Reusable templates for common workflows
- **Export Options**: Export tasks to CSV, JSON, PDF, or Excel
- **Project Completion**: Smart project completion tracking

### 🤝 Collaboration
- **Comments System**: Threaded comments with mentions
- **File Attachments**: Attach files to tasks with preview support
- **Activity Feed**: Track all changes and updates
- **Task Dependencies**: Visual dependency graph
- **Team Management**: Assign tasks to team members

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### 🐳 Using Pre-built Containers (Recommended)

The fastest way to get started is using our pre-built containers:

```bash
# 1. Create a directory for your installation
mkdir projecthub-mcp && cd projecthub-mcp

# 2. Download the production docker-compose file
curl -L https://raw.githubusercontent.com/anubissbe/ProjectHub-Mcp/main/docker-compose.yml -o docker-compose.yml

# 3. Start the containers
docker compose up -d
```

🎨 **The application features dramatic black/orange branding with:**
- Modern gradient backgrounds and glowing effects
- Animated navigation and interactive elements
- Consistent dark mode throughout all pages
- Professional ProjectHub-MCP aesthetic

Visit **http://localhost:5173** to see your ProjectHub-MCP instance!

## 📸 Screenshots

<div align="center">

### 🏠 Homepage & Dark Theme
<img src="docs/images/homepage.png" alt="ProjectHub-MCP Homepage" width="600" />

*Modern dark theme with orange accents and gradient effects*

### 📊 Analytics Dashboard
<img src="analytics.png" alt="Analytics Dashboard" width="600" />

*Comprehensive project analytics with beautiful charts and insights*

### 📋 Kanban Board View
<img src="board.png" alt="Kanban Board" width="600" />

*Drag-and-drop task management with visual progress tracking*

### 📅 Calendar & Timeline
<img src="calendar.png" alt="Calendar View" width="600" />

*Advanced scheduling and timeline visualization*

### 📊 Project List & Management
<img src="project-tasks.png" alt="Project Management" width="600" />

*Organized project overview with task statistics*

</div>

### 🎨 Theme Comparison

<table align="center">
<tr>
<td align="center"><strong>🌙 Dark Mode (Default)</strong></td>
<td align="center"><strong>☀️ Light Mode</strong></td>
</tr>
<tr>
<td><img src="test-screenshots/dark-theme.png" alt="Dark Theme" width="300" /></td>
<td><img src="test-screenshots/light-theme.png" alt="Light Theme" width="300" /></td>
</tr>
<tr>
<td align="center"><em>Professional black/orange branding</em></td>
<td align="center"><em>Clean light theme alternative</em></td>
</tr>
</table>

### Development Setup

For local development:

```bash
# Clone the repository
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp

# Start development environment
docker compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
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

The application uses environment variables for configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_learning

# Backend
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001/api
```

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

*If this project helped you, please consider ⭐ starring the repository!*

</div>
