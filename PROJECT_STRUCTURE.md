# 📁 ProjectHub-MCP Project Structure

## Overview
ProjectHub-MCP is an enterprise-grade project management system with multiple frontend options and a robust backend API.

## 🏗️ Core Architecture

```
ProjectHub-MCP/
├── 📂 backend/              # Node.js/Express API Server
│   ├── src/                 # TypeScript source code
│   ├── dist/                # Compiled JavaScript (build output)
│   ├── package.json         # Backend dependencies
│   └── Dockerfile           # Backend container
│
├── 📂 frontend/             # React/TypeScript Web UI
│   ├── src/                 # React source code
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── Dockerfile           # Frontend container
│
├── 📂 new-frontend/         # Alpine.js Alternative UI
│   ├── index-complete.html  # Main Alpine.js application
│   ├── app.js               # Application logic
│   └── Dockerfile           # Alpine.js container
│
├── 📂 tests/                # End-to-End Tests
│   └── e2e/                 # Playwright test suites
│
├── 📂 scripts/              # Deployment & Utility Scripts
│   └── deploy.sh            # Deployment automation
│
├── 📂 docs/                 # Documentation
│   ├── api/                 # API documentation
│   ├── deployment/          # Deployment guides
│   └── archive/             # Historical documentation
│
└── 📂 .github/              # GitHub Actions & Templates
    ├── workflows/           # CI/CD pipelines
    └── codeql/              # Security analysis config
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root package management |
| `docker-compose*.yml` | Container orchestration |
| `nginx.conf` | Web server configuration |
| `renovate.json` | Dependency updates |
| `playwright.config.ts` | E2E test configuration |
| `lighthouse.config.js` | Performance testing |

## 🚀 Frontend Options

### React Frontend (`/frontend/`)
- **Technology**: React 18 + TypeScript
- **Features**: Full-featured enterprise UI
- **Use Case**: Complex enterprise deployments
- **Port**: 3000 (development)

### Alpine.js Frontend (`/new-frontend/`)
- **Technology**: Alpine.js + Vanilla JavaScript
- **Features**: Lightweight, fast loading
- **Use Case**: Simple deployments, embedded usage
- **Port**: 80 (containerized)

## 🗄️ Backend API (`/backend/`)
- **Technology**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Features**: RESTful API, authentication, real-time updates
- **Port**: 3007

## 🧪 Testing Strategy

### End-to-End Tests (`/tests/`)
- **Framework**: Playwright
- **Coverage**: Full user workflows
- **Browsers**: Chrome, Firefox, Safari

### Unit Tests
- **Backend**: Jest + TypeScript
- **Frontend**: Vitest + React Testing Library

## 📦 Deployment

### Docker Deployment
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Available Images
- `ghcr.io/anubissbe/projecthub-mcp-frontend:latest`
- `anubissbe/projecthub-mcp-frontend:latest`

## 🔒 Security

- **CodeQL Analysis**: Automated security scanning
- **Trivy Scanning**: Container vulnerability assessment
- **Secret Detection**: GitGuardian + Gitleaks
- **Access Control**: Role-based permissions

## 📋 Development Workflow

1. **Local Development**: Use docker-compose.yml
2. **Testing**: Run E2E tests with Playwright
3. **Security**: Automated scanning on push
4. **Deployment**: CI/CD pipeline builds and pushes containers

## 🗂️ Archive

Historical development documentation is stored in `docs/archive/` for reference but is not part of the active codebase.