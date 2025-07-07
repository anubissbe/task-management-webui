# ProjectHub-MCP Wiki

Welcome to the comprehensive documentation for **ProjectHub-MCP v5.0.0** - a modern, AI-integrated project management platform designed for development teams.

## 🚀 Quick Navigation

### Getting Started
- **[Installation Guide](Installation-Guide)** - Complete setup instructions
- **[Quick Start](Installation-Guide#quick-start)** - Get running in 5 minutes
- **[Configuration](Installation-Guide#configuration)** - Environment setup

### Core Features
- **[Project Management](Project-Management)** - Creating and managing projects
- **[Task Management](Task-Management)** - Kanban boards and task tracking
- **[Analytics Dashboard](Analytics-Dashboard)** - Real-time metrics and insights
- **[User Interface](User-Interface-Overview)** - UI components and navigation

### AI Integration
- **[AI Development Tools](AI-Development-Tools)** - Supported AI assistants
- **[AI Integration Setup](AI-Integration-Setup)** - Configure AI tools
- **[Claude Code Guide](AI-Integration-Setup#claude-code-setup)** - 2-minute setup

### Technical Documentation
- **[API Documentation](API-Documentation)** - REST API reference
- **[Architecture Overview](Architecture-Overview)** - System design
- **[Development Setup](Development-Setup)** - Local development

### Support
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions
- **[FAQ](FAQ)** - Frequently asked questions

## 🎯 What's New in v5.0.0

### ✅ Major Fixes
- **Kanban Board**: Fixed project switching - tasks now update correctly when switching between projects
- **Cascade Deletion**: Safe project deletion that removes all associated tasks
- **Real Analytics**: All dashboard metrics now calculate from live database data
- **Enhanced Security**: Improved JWT handling and bcrypt encryption

### 🚀 Key Features
- **Modern Architecture**: Alpine.js frontend with Node.js/Express backend
- **Docker Ready**: Complete containerization with health monitoring
- **AI Integration**: Native MCP protocol support for Claude Code and other AI assistants
- **Real-time Updates**: Live synchronization across all connected clients
- **Professional UI**: Dark theme with signature orange (#ff6500) branding

## 🏗️ System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   Alpine.js     │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   Port 5174     │    │   Port 3009     │    │   Port 5433     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Docker        │    │   Health        │    │   MCP           │
│   Containers    │    │   Monitoring    │    │   Protocol      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔗 Quick Links

- **[🚀 Installation Guide](Installation-Guide)** - Start here for new installations
- **[🤖 AI Integration](AI-Integration-Setup)** - Connect your AI assistant
- **[📊 Features Overview](Features)** - Complete feature list
- **[🔧 API Reference](API-Documentation)** - Developer documentation
- **[❓ Troubleshooting](Troubleshooting)** - Solve common issues

## 📞 Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/anubissbe/ProjectHub-Mcp/issues)
- **Discussions**: [Community support](https://github.com/anubissbe/ProjectHub-Mcp/discussions)
- **Wiki**: Complete documentation (you are here!)

---

**ProjectHub-MCP** is designed to streamline your development workflow with powerful project management tools and seamless AI integration. Get started with our [Installation Guide](Installation-Guide) or explore the [Features](Features) to learn more.