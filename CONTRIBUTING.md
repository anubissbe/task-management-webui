# Contributing to ProjectHub-MCP

First off, thank you for considering contributing to ProjectHub-MCP! It's people like you that make ProjectHub-MCP such a great tool.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**
- **List some other applications where this enhancement exists**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 16
- Docker and Docker Compose (optional)
- Git

### Local Development

1. **Clone your fork**
```bash
git clone https://github.com/your-username/ProjectHub-Mcp.git
cd ProjectHub-Mcp
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Set up database**
```bash
# Create database
createdb projecthub_dev

# Run migrations
cd backend
npm run migrate
```

5. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📝 Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Use conventional commit format:
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation changes
  - `style:` Code style changes (formatting, etc)
  - `refactor:` Code refactoring
  - `test:` Test additions or changes
  - `chore:` Build process or auxiliary tool changes

### TypeScript Style Guide

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Prefer `interface` over `type` for object shapes
- Use `const` and `let`, never `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### React Style Guide

- Use functional components with hooks
- One component per file
- Use TypeScript interfaces for props
- Keep components small and focused
- Extract custom hooks for reusable logic
- Use semantic HTML elements
- Follow accessibility best practices

### CSS/Styling

- Use Tailwind CSS utilities when possible
- Follow mobile-first responsive design
- Support both light and dark themes
- Use CSS variables for theme colors
- Ensure proper contrast ratios for accessibility
- Maintain the black (#0a0a0a) and orange (#ff6500) brand colors

## 🏗️ Project Structure

```
ProjectHub-Mcp/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Business logic
│   │   ├── models/   # Data models
│   │   └── utils/    # Utility functions
│   └── tests/        # Backend tests
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── stores/     # Zustand stores
│   │   └── utils/      # Utility functions
│   └── tests/          # Frontend tests
└── docs/              # Documentation
```

## 🧪 Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Use meaningful test descriptions
- Test both happy paths and edge cases
- Mock external dependencies
- Use data-testid attributes for E2E tests

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should render without crashing', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });

  it('should handle error states', () => {
    // Test implementation
  });
});
```

## 📚 Documentation

- Update README.md if needed
- Add JSDoc comments for functions
- Update API documentation for endpoint changes
- Include examples in documentation
- Keep documentation concise but complete

## 🚀 Deployment

The project uses Docker for deployment. When making changes that affect deployment:

1. Update Dockerfile if needed
2. Update docker-compose.yml if needed
3. Test the Docker build locally
4. Document any new environment variables
5. Update deployment documentation

## 🔄 Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the CHANGELOG.md with your changes
3. Increase version numbers in any examples files and the README.md
4. The PR will be merged once you have approval from maintainers

### PR Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged

## 🎁 Recognition

Contributors will be recognized in our README.md file. We value all contributions, no matter how small!

## ❓ Questions?

Feel free to open an issue with your question or reach out to the maintainers directly.

Thank you for contributing to ProjectHub-MCP! 🧡
