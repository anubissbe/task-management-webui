# 📋 Task Management Web UI

[![CI/CD Pipeline](https://github.com/username/task-management-webui/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/username/task-management-webui/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-orange.svg)](https://buymeacoffee.com/anubissbe)

> A comprehensive, enterprise-grade task management web interface with advanced features including time tracking, workflow templates, dependency visualization, team collaboration, and analytics dashboard.

## ⭐ Star this repository if you find it helpful!

<div align="center">
  <a href="https://buymeacoffee.com/anubissbe">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=anubissbe&button_colour=FF5F5F&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" />
  </a>
</div>

## 🌟 Key Features

### ⏱️ **Advanced Time Tracking & Pomodoro Integration**
- Built-in Pomodoro timer with 25/5/15 minute work/break cycles
- Automatic time logging to task actual_hours field
- Audio and browser notifications for timer completion
- Comprehensive time tracking dashboard with efficiency metrics
- Daily/weekly time summaries with visual progress bars
- Time distribution analysis by status and priority

### 📋 **Professional Workflow Templates**
- **Bug Fix Workflow** (5 tasks): Reproduce → Root Cause Analysis → Implement Fix → Test Fix → Deploy & Monitor
- **Feature Development** (7 tasks): Requirements → Technical Design → UI/UX → Backend → Frontend → Testing → Documentation
- **Research Spike** (4 tasks): Define Goals → Literature Review → Proof of Concept → Analysis & Recommendations
- **Performance Optimization** (4 tasks): Baseline → Identify Bottlenecks → Implement Optimizations → Measure & Validate
- **Security Review** (4 tasks): Security Assessment → Code Audit → Fix Issues → Security Testing
- One-click bulk task creation with pre-filled implementation notes

### 🔗 **Task Dependencies & Flow Visualization**
- Interactive visual dependency graph with SVG rendering
- Critical path analysis for project planning optimization
- Hierarchical layout with task levels and dependency arrows
- Blocked task highlighting and dependency validation
- Real-time dependency updates with visual feedback

### 💬 **Team Collaboration Features**
- Threaded comment system with reply functionality
- @mentions with real-time user search dropdown
- Comprehensive activity feed with filtering and date grouping
- File attachments with drag-drop upload and validation
- Complete audit trail for all task activities

### 📊 **Analytics & Reporting**
- Project completion tracking with visual progress indicators
- Task velocity calculation and trend analysis
- Time efficiency metrics and performance insights
- Status and priority distribution charts
- CSV, JSON, and PDF export capabilities
- Comprehensive project reporting features

### 🎯 **Enhanced User Experience**
- Advanced filtering system (search, status, priority, assignee, time)
- Bulk task operations with multi-select functionality
- Enhanced drag-and-drop with visual feedback
- Dark/light theme support throughout all components
- Real-time task counting and filter indicators
- Mobile-responsive design

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- PostgreSQL database (mcp_learning) with project_management schema

### Production Access (Deployed)
- **Frontend**: http://192.168.1.25:5173
- **Backend API**: http://192.168.1.25:3001/api
- **Health Check**: http://192.168.1.25:3001/api/health

### Local Development Setup

```bash
# Navigate to project directory
cd /opt/projects/projects/task-management-webui

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api

# Stop services
docker-compose down
```

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized building
- **Tailwind CSS** for utility-first styling with dark mode
- **Zustand** for client state management
- **React Router** for navigation
- **Custom Hook System** for reusable logic

### Backend Stack
- **Express.js** with TypeScript
- **PostgreSQL** with direct database integration
- **Docker** containerization for scalability
- **CORS** enabled for cross-origin requests
- **RESTful API** design with comprehensive endpoints

### Component Architecture
```
src/components/
├── PomodoroTimer.tsx          # 🍅 Complete Pomodoro timer with notifications
├── TaskTemplates.tsx          # 📋 Professional workflow templates system
├── TaskDependencyGraph.tsx    # 🔗 Visual dependency graph with SVG
├── TaskComments.tsx           # 💬 Threaded comments with @mentions
├── ActivityFeed.tsx           # 📈 Activity tracking with filtering
├── FileAttachments.tsx        # 📎 File upload and management
├── ExportReports.tsx          # 📊 Data export in multiple formats
├── TaskFilters.tsx            # 🔍 Advanced filtering system
├── TaskAnalytics.tsx          # 📊 Project analytics dashboard
├── BulkTaskActions.tsx        # ⚡ Multi-select bulk operations
├── TimeTrackingDashboard.tsx  # ⏱️ Time tracking insights
└── Layout.tsx                 # 🎨 Main layout with navigation
```

## 📖 Feature Usage Guide

### Using Pomodoro Timer
1. Navigate to any task card
2. For in-progress tasks: Timer appears automatically
3. For other tasks: Click "🍅 Start Timer" button
4. Timer cycles: 25min work → 5min break → repeat (4th break is 15min)
5. Time automatically logs to task's actual_hours field
6. Access detailed time analytics in the Time Tracking Dashboard

### Using Task Templates
1. Click "📋 Templates" button in the main header
2. Browse templates by category or use the search function
3. Click any template to preview all included tasks
4. Click "Create X Tasks" to add the entire workflow to your project
5. Tasks are created with proper order, priorities, and implementation notes

### Managing Dependencies
1. Open any task detail modal
2. Navigate to the "Dependencies" tab
3. Add dependencies by selecting prerequisite tasks
4. View the visual dependency graph for project flow analysis
5. Monitor critical path and blocked tasks in real-time

### Team Collaboration
1. **Comments**: Add threaded comments in task detail modals
2. **@Mentions**: Type @ to mention team members with autocomplete
3. **Activity Feed**: Track all project activities with filtering
4. **File Attachments**: Drag and drop files directly onto tasks

### Analytics & Reporting
1. Click "📊 Analytics" to view project dashboard
2. Monitor completion rates, time efficiency, and velocity
3. Export data using "📊 Export" with custom filtering options
4. Download reports in CSV, JSON, or PDF formats

## 🔧 API Reference

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
```

### Comments & Collaboration
```
GET    /api/tasks/:id/comments         # Get task comments
POST   /api/tasks/:id/comments         # Add comment
PUT    /api/comments/:id               # Update comment
DELETE /api/comments/:id               # Delete comment
```

### File Attachments
```
POST   /api/tasks/:id/attachments      # Upload file
GET    /api/tasks/:id/attachments      # List attachments
DELETE /api/attachments/:id            # Delete attachment
```

### Analytics & Export
```
GET    /api/projects/:id/analytics     # Get project analytics
GET    /api/projects/:id/export        # Export project data
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
./scripts/deploy-task-management-ui.sh

# Sync database
./scripts/sync-postgres-to-remote.sh

# View remote logs
ssh drwho@192.168.1.25
cd ~/projects/task-management-webui
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
VITE_APP_TITLE=Task Management UI
```

## 🧪 Testing

### Automated Testing
```bash
# Run UI tests
cd tests
node ui-test.js

# Run component tests
npm test

# Run integration tests
npm run test:integration
```

### Manual Testing Checklist
- ✅ Task creation and editing
- ✅ Drag-and-drop functionality
- ✅ Pomodoro timer operation
- ✅ Template workflow creation
- ✅ Dependency graph visualization
- ✅ Comment system with @mentions
- ✅ File attachment upload/download
- ✅ Export functionality
- ✅ Dark/light theme switching
- ✅ Responsive design on mobile

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run typecheck # TypeScript type checking
```

### Backend Development
```bash
cd backend
npm install
npm run dev      # Start with nodemon
npm run build    # Compile TypeScript
npm start        # Start production server
```

### Docker Development
```bash
# Rebuild containers
docker-compose build

# View container logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Execute commands in containers
docker-compose exec frontend npm run test
docker-compose exec backend npm run typecheck
```

## 📋 Maintenance

### Regular Tasks
- Monitor application logs for errors
- Review time tracking analytics for insights
- Update workflow templates based on team feedback
- Export project data for reporting
- Clean up old attachments and activity logs

### Backup and Recovery
```bash
# Database backup
pg_dump mcp_learning > backup.sql

# File attachments backup
tar -czf attachments-backup.tar.gz uploads/

# Full application backup
./scripts/backup-full-application.sh
```

## 🤝 Contributing

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages
- Add JSDoc comments for complex functions

### Feature Development Process
1. Create feature branch from main
2. Implement feature with tests
3. Update documentation
4. Submit pull request with description
5. Code review and approval
6. Merge to main and deploy

## 📄 License

This project is part of the MCP-Enhanced Workspace system.

## 🆘 Support

### Common Issues
- **Database Connection**: Ensure PostgreSQL is running and accessible
- **Port Conflicts**: Check if ports 3001/5173 are available
- **Docker Issues**: Restart Docker daemon or rebuild containers
- **Performance**: Monitor time tracking dashboard for bottlenecks

### Getting Help
- Check application logs: `docker-compose logs -f`
- Review database connections in health check endpoint
- Verify all environment variables are set correctly
- Ensure PostgreSQL project_management schema exists

## 📈 Version History

- **v3.0.0** (2025-06-13): Advanced collaboration features, dependencies, file attachments
- **v2.0.0** (2025-06-13): Time tracking, workflow templates, analytics dashboard
- **v1.0.0** (2025-06-12): Core task management, Kanban board, basic features

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 💝 Support the Project

If this project has been helpful to you, consider supporting its development:

<div align="center">
  <a href="https://buymeacoffee.com/anubissbe">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=anubissbe&button_colour=FF5F5F&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" />
  </a>
</div>

Your support helps maintain and improve this project for everyone! 🙏

## 📊 Repository Stats

![GitHub stars](https://img.shields.io/github/stars/username/task-management-webui?style=social)
![GitHub forks](https://img.shields.io/github/forks/username/task-management-webui?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/username/task-management-webui?style=social)

## 🏆 Acknowledgments

- Built with ❤️ by the open source community
- Special thanks to all contributors and supporters
- Inspired by modern task management needs and productivity research

---

<div align="center">

**🎉 Status: FULLY DEPLOYED AND OPERATIONAL**  
**🌐 Live Demo: Available upon request**

Made with ❤️ by [AnubissBE](https://github.com/anubissbe)

[⭐ Star this repository](https://github.com/username/task-management-webui) • [🐛 Report Bug](https://github.com/username/task-management-webui/issues) • [✨ Request Feature](https://github.com/username/task-management-webui/issues) • [☕ Buy me a coffee](https://buymeacoffee.com/anubissbe)

</div>