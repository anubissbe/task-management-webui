# ProjectHub-MCP Project Structure

```
projecthub-mcp-server/
│
├── backend-fix/              # Main backend (used in production)
│   ├── server.js            # Express API server
│   ├── security-utils.js    # Security utilities
│   ├── package.json         # Backend dependencies
│   └── Dockerfile           # Backend container
│
├── frontend/                 # React frontend application
│   ├── index.html           # Main HTML entry
│   ├── app.js               # Frontend JavaScript
│   ├── nginx.conf           # Nginx configuration
│   └── Dockerfile           # Frontend container
│
├── docs/                     # Documentation
│   ├── AI_INTEGRATION_GUIDE.md    # AI assistant integration
│   ├── API.md                     # API documentation
│   ├── WEBHOOK_API.md             # Webhook documentation
│   └── archive/                   # Old documentation (archived)
│
├── scripts/                  # Utility scripts
│   ├── deployment/          # Deployment scripts
│   └── test_server.py       # Server testing
│
├── tests/                    # Test files
│   └── README.md            # Testing documentation
│
├── screenshots/             # Application screenshots
│   ├── dashboard.png
│   ├── kanban-board.png
│   ├── analytics-dashboard.png
│   └── projects-list.png
│
├── wiki/                    # GitHub wiki content
│   └── *.md                # Wiki pages
│
├── archive/                 # Archived/old files
│   ├── deployment-reports/  # Old deployment docs
│   └── old-versions/        # Previous code versions
│
├── mcp-server/              # MCP server implementation
│   └── index.js            # MCP protocol server
│
├── database/                # Database files
│   └── schema.sql          # PostgreSQL schema
│
├── .github/                 # GitHub configuration
│   ├── workflows/          # CI/CD workflows
│   └── ISSUE_TEMPLATE/     # Issue templates
│
├── docker-compose.yml       # Docker orchestration
├── init.sql                # Database initialization
├── package.json            # Root package file
├── README.md               # Main documentation
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT license
├── CLAUDE.md               # Claude integration
├── CLAUDE_QUICK_SETUP.md   # Quick start guide
├── ROADMAP.md              # Future plans
└── TODO.md                 # Current tasks
```

## Key Directories

### Production Code
- **backend-fix/** - The actual backend used in production (despite the name)
- **frontend/** - React-based frontend application

### Documentation
- **docs/** - Technical documentation
- **wiki/** - User-facing wiki content
- **screenshots/** - UI screenshots for documentation

### Configuration
- **docker-compose.yml** - Main deployment configuration
- **init.sql** - Database initialization script

### Development
- **scripts/** - Deployment and testing scripts
- **tests/** - Test files and test documentation

## Notes
- The `backend/` directory exists but `backend-fix/` is the one actually used
- All deployment reports have been archived
- Old frontend attempts have been moved to archive
- The project uses Docker for all deployments