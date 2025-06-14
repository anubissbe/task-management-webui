# Contributing to Task Management WebUI

First off, thank you for considering contributing to Task Management WebUI! It's people like you that make this project great.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the existing code style
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Setting Up Your Development Environment

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/task-management-webui.git
cd task-management-webui
```

2. Install dependencies:
```bash
# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd ../backend && npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
docker compose up -d
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Development Workflow

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test locally

3. Run tests:
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# E2E tests
cd tests && npm test
```

4. Check code style:
```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

5. Commit your changes:
```bash
git add .
git commit -m "feat: add amazing feature"
```

6. Push to your fork:
```bash
git push origin feature/your-feature-name
```

7. Open a Pull Request

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Prefer functional components in React
- Use async/await over promises where possible

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the existing dark mode patterns
- Ensure responsive design
- Test on multiple browsers

### Git Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, missing semicolons, etc)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add calendar view for tasks
fix: resolve drag and drop issue in kanban board
docs: update API documentation for task endpoints
```

### Testing

- Write unit tests for all business logic
- Write integration tests for API endpoints
- Write E2E tests for critical user flows
- Aim for >80% code coverage
- Test both happy and error paths

### Documentation

- Update README.md if you change functionality
- Update API documentation for endpoint changes
- Add JSDoc comments for new functions
- Include examples in documentation

## Project Structure

```
task-management-webui/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # State management
│   │   └── hooks/       # Custom hooks
│   └── tests/          # Frontend tests
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   └── tests/          # Backend tests
└── docs/             # Documentation
```

## Review Process

### Before Submitting

- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

### Pull Request Review

All submissions require review. We use GitHub pull requests for this purpose. The review process:

1. Automated checks run (linting, tests, build)
2. Code review by maintainers
3. Address feedback if any
4. Merge once approved

## Community

### Getting Help

- Check the [documentation](docs/)
- Search [existing issues](https://github.com/yourusername/task-management-webui/issues)
- Join our [Discord server](#)
- Ask in [Discussions](https://github.com/yourusername/task-management-webui/discussions)

### Recognition

Contributors are recognized in:
- The project README
- Release notes
- Our website (coming soon)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.