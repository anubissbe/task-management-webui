# Development Setup

This guide covers setting up a complete development environment for the Task Management WebUI project, including tools, dependencies, and workflow setup.

## 💻 Prerequisites

### Required Software

**Node.js & npm**
```bash
# Install Node.js 18 or higher
# Check version
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v8.0.0 or higher

# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
nvm alias default 18
```

**Docker & Docker Compose**
```bash
# Install Docker Desktop or Docker Engine
# Check installation
docker --version          # Should be v20.0.0 or higher
docker compose version    # Should be v2.0.0 or higher

# Test Docker
docker run hello-world
```

**Git**
```bash
# Check Git installation
git --version  # Should be v2.30.0 or higher

# Configure Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Recommended Tools

**Visual Studio Code Extensions**:
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client (for API testing)

**Alternative IDEs**:
- WebStorm (JetBrains)
- Sublime Text with TypeScript package
- Vim/Neovim with coc.nvim

## 📚 Project Setup

### Repository Setup

**1. Fork and Clone**
```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/task-management-webui.git
cd task-management-webui

# Add upstream remote
git remote add upstream https://github.com/anubissbe/task-management-webui.git

# Verify remotes
git remote -v
```

**2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Environment Variables**:
```env
# Database Configuration
DATABASE_URL=postgresql://mcp_user:mcp_secure_password_2024@localhost:5432/mcp_learning
POSTGRES_PASSWORD=mcp_secure_password_2024

# Backend Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Development Tools
REACT_EDITOR=code
BROWSER=chrome
```

### Database Setup

**Using Docker (Recommended)**
```bash
# Start PostgreSQL with Docker
docker compose up -d postgres

# Verify database is running
docker compose logs postgres

# Connect to database (optional)
docker exec -it task-management-postgres psql -U mcp_user -d mcp_learning
```

**Manual PostgreSQL Setup** (if not using Docker)
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql                             # macOS

# Create database and user
sudo -u postgres psql
CREATE DATABASE mcp_learning;
CREATE USER mcp_user WITH PASSWORD 'mcp_secure_password_2024';
GRANT ALL PRIVILEGES ON DATABASE mcp_learning TO mcp_user;
\q
```

## 🔧 Frontend Development

### Frontend Setup

**1. Install Dependencies**
```bash
cd frontend
npm install

# Check for vulnerabilities
npm audit
npm audit fix
```

**2. Development Server**
```bash
# Start development server
npm run dev

# Server will start at http://localhost:5173
# Hot reload enabled for live updates
```

**3. Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Frontend Architecture

**Directory Structure**:
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Basic UI components
│   │   ├── layout/          # Layout components
│   │   └── modals/          # Modal components
│   ├── pages/              # Page-level components
│   ├── store/              # Zustand store configuration
│   ├── services/           # API service functions
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles and themes
├── public/             # Static assets
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

**Key Technologies**:
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **React Router**: Client-side routing

## 🔧 Backend Development

### Backend Setup

**1. Install Dependencies**
```bash
cd backend
npm install

# Install global tools (optional)
npm install -g nodemon ts-node
```

**2. Development Server**
```bash
# Start development server with auto-reload
npm run dev

# Or using nodemon directly
nodemon src/index.ts

# Server will start at http://localhost:3001
```

**3. Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
```

### Backend Architecture

**Directory Structure**:
```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Data models and types
│   ├── routes/             # API route definitions
│   ├── middleware/         # Express middleware
│   ├── database/           # Database connection and queries
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── index.ts            # Application entry point
├── tests/              # Test files
├── package.json        # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── .eslintrc.js       # ESLint configuration
```

**Key Technologies**:
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **TypeScript**: Type safety for JavaScript
- **PostgreSQL**: Primary database
- **Socket.io**: Real-time communication
- **pg**: PostgreSQL client for Node.js

## 📝 Code Style and Formatting

### ESLint Configuration

**Frontend ESLint** (`.eslintrc.js`):
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'prefer-const': 'error'
  }
};
```

**Backend ESLint** (`.eslintrc.js`):
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error'
  }
};
```

### Prettier Configuration

**Prettier Config** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript Configuration

**Frontend tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🧪 Testing Setup

### Frontend Testing

**Testing Framework**: Vitest + React Testing Library

**Setup**:
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Test Configuration** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  }
});
```

**Example Test**:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TaskCard from '../components/TaskCard';

describe('TaskCard', () => {
  it('renders task title correctly', () => {
    const task = {
      id: '1',
      title: 'Test Task',
      status: 'pending',
      priority: 'medium'
    };
    
    render(<TaskCard task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Backend Testing

**Testing Framework**: Jest + Supertest

**Setup**:
```bash
cd backend
npm install --save-dev jest @types/jest supertest @types/supertest
```

**Test Configuration** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

**Example API Test**:
```typescript
import request from 'supertest';
import app from '../src/app';

describe('Projects API', () => {
  it('should get all projects', async () => {
    const response = await request(app)
      .get('/api/projects')
      .expect(200);
      
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## 📎 Development Workflow

### Git Workflow

**Branch Naming Convention**:
- `feature/task-description` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-issue` - Critical production fixes
- `refactor/component-name` - Code refactoring
- `docs/section-name` - Documentation updates

**Typical Workflow**:
```bash
# Start new feature
git checkout main
git pull upstream main
git checkout -b feature/user-authentication

# Make changes and commit
git add .
git commit -m "feat: add user authentication system"

# Push and create PR
git push origin feature/user-authentication
# Create pull request on GitHub
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(auth): add JWT token authentication
fix(ui): resolve dark mode text contrast issues
docs(api): update endpoint documentation
refactor(store): simplify state management logic
```

### Code Review Process

**Before Creating PR**:
1. Run all tests: `npm test`
2. Check code formatting: `npm run lint`
3. Verify build works: `npm run build`
4. Test manually in browser
5. Update documentation if needed

**PR Requirements**:
- Clear title and description
- Screenshots for UI changes
- Test results included
- Reviewer assigned
- All checks must pass

## 🚀 Debugging and Development Tools

### Browser Development Tools

**React Developer Tools**:
- Install React DevTools browser extension
- Access via browser developer tools
- Inspect component state and props
- Profile performance

**Redux DevTools** (for Zustand):
- Install Redux DevTools extension
- Configure Zustand with devtools middleware
- Monitor state changes in real-time

### API Development

**Thunder Client** (VS Code Extension):
```json
{
  "name": "Get Projects",
  "method": "GET",
  "url": "http://localhost:3001/api/projects",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

**Postman Collection**:
- Import provided Postman collection
- Test all API endpoints
- Automate API testing

### Database Tools

**pgAdmin** (Web Interface):
```bash
# Access at http://localhost:5050 (if using Docker)
# Default login: admin@admin.com / admin
```

**Command Line Tools**:
```bash
# Connect to database
psql postgresql://mcp_user:mcp_secure_password_2024@localhost:5432/mcp_learning

# Common commands
\l                    # List databases
\dt                   # List tables
\d table_name         # Describe table
SELECT * FROM tasks;  # Query data
```

## 🔍 Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Find process using port
lsof -i :3001
lsof -i :5173

# Kill process
kill -9 <PID>

# Or change port in .env file
```

**Database Connection Issues**:
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View database logs
docker compose logs postgres

# Reset database
docker compose down -v
docker compose up -d postgres
```

**Node Modules Issues**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

**TypeScript Errors**:
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Check TypeScript configuration
npx tsc --noEmit
```

### Getting Help

1. Check [GitHub Issues](https://github.com/anubissbe/task-management-webui/issues)
2. Review [Troubleshooting Guide](Troubleshooting)
3. Join project discussions
4. Create detailed bug reports with:
   - Operating system and version
   - Node.js and npm versions
   - Steps to reproduce
   - Error messages and logs

---

**Next**: Learn about [Production Deployment](Production-Deployment) for deploying your changes.