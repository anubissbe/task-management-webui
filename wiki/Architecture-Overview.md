# Architecture Overview

This document provides a comprehensive overview of the ProjectHub-MCP v4.5.1 architecture, including system design, technology stack, and architectural decisions for this production-ready enterprise project management system.

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 5173    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   WebSocket     │◄─────────────┘
                        │   (Socket.io)   │
                        └─────────────────┘
```

### Component Architecture
```
Frontend (React)
├── Components/           # Reusable UI components
├── Pages/               # Page-level components
├── Services/            # API and external service calls
├── Store/              # State management (Zustand)
├── Hooks/              # Custom React hooks
├── Types/              # TypeScript type definitions
└── Utils/              # Utility functions

Backend (Node.js)
├── Controllers/         # Request handlers
├── Services/           # Business logic
├── Models/             # Data models
├── Routes/             # API route definitions
├── Middleware/         # Express middleware
├── Database/           # Database connection and queries
└── Utils/              # Utility functions

Database (PostgreSQL)
├── project_management/  # Project and task tables
├── knowledge_graph/    # Entities and relationships
├── rag/               # Document storage
├── vector_store/      # Vector embeddings
└── unified/           # General purpose storage
```

## 💻 Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | Modern UI framework with concurrent features |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 6.3.5 | Build tool and dev server |
| **Tailwind CSS** | 3.4.17 | Styling and design system |
| **Zustand** | 5.0.0 | State management |
| **React Query** | 5.17.9 | Server state management |
| **React Router** | 6.21.1 | Client-side routing |
| **Socket.io Client** | 4.7.4 | Real-time communication |
| **Recharts** | 2.10.4 | Data visualization |
| **date-fns** | 4.0.0 | Date manipulation |

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 4.18.2 | Web framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Socket.io** | 4.7.4 | Real-time communication |
| **pg** | 8.11.3 | PostgreSQL client |
| **cors** | 2.8.5 | Cross-origin resource sharing |
| **helmet** | 7.1.0 | Security middleware |
| **compression** | 1.7.4 | Response compression |

### Database Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 17 | Primary database with advanced indexing |
| **pgvector** | 0.5.1 | Vector similarity search for AI features |

### Infrastructure Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.20+ | Multi-container orchestration |
| **Nginx** | Alpine | Reverse proxy and load balancer |
| **GitHub Actions** | - | CI/CD pipeline |

## 🎨 Frontend Architecture

### Component Hierarchy
```
App
├── Layout
│   ├── Navigation
│   ├── Sidebar
│   └── Footer
├── Pages
│   ├── ProjectList
│   ├── ProjectDetail
│   │   ├── TaskBoard (Kanban)
│   │   ├── TaskList
│   │   ├── CalendarView
│   │   └── TimelineView
│   └── Analytics
├── Modals
│   ├── CreateTaskModal
│   ├── EditTaskModal
│   └── TaskDetailModal
└── Common Components
    ├── TaskCard
    ├── TaskFilters
    ├── SearchBar
    └── LoadingSpinner
```

### State Management
**Zustand Stores:**
- `projectStore` - Current project and tasks
- `themeStore` - UI theme preferences
- `userStore` - User session data (future)

**React Query Cache:**
- Projects data
- Tasks by project
- Analytics data
- Search results

### Routing Structure
```
/                          # Project list
/projects/:id              # Project detail (default: board view)
/projects/:id/board        # Kanban board view
/projects/:id/list         # List view
/projects/:id/calendar     # Calendar view
/projects/:id/timeline     # Timeline/Gantt view
/analytics                 # Global analytics
/analytics/:projectId      # Project-specific analytics
```

## 🖥️ Backend Architecture

### API Layer Structure
```
Routes (API Endpoints)
├── /api/projects          # Project CRUD operations
├── /api/tasks            # Task CRUD operations
├── /api/analytics        # Analytics and reporting
├── /api/export          # Data export functionality
├── /api/search          # Global search
└── /api/health          # Health check endpoint

Controllers (Request Handlers)
├── ProjectController     # Project business logic
├── TaskController       # Task business logic
├── AnalyticsController  # Analytics logic
└── ExportController     # Export logic

Services (Business Logic)
├── ProjectService       # Project operations
├── TaskService         # Task operations
├── AnalyticsService    # Data aggregation
├── SearchService       # Search functionality
└── NotificationService # Real-time notifications

Database Layer
├── DatabaseConnection   # PostgreSQL connection
├── QueryBuilder        # Dynamic query building
├── Migrations          # Database schema migrations
└── Seeders            # Test data generation
```

### Middleware Stack
```
Request Flow:
┌─────────────────┐
│   HTTP Request  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   CORS          │ Enable cross-origin requests
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Helmet        │ Security headers
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Compression   │ Gzip response compression
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Body Parser   │ Parse JSON/URL-encoded bodies
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Authentication│ JWT validation (future)
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Rate Limiting │ API rate limiting
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Route Handler │ Business logic
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Error Handler │ Global error handling
└─────────────────┘
```

## 🗄️ Database Architecture

### Schema Design
```sql
-- Core project management schema
CREATE SCHEMA project_management;

-- Projects table
CREATE TABLE project_management.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE project_management.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES project_management.projects(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    assignee VARCHAR(255),
    due_date TIMESTAMP,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    tags TEXT[],
    dependencies UUID[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_project_id ON project_management.tasks(project_id);
CREATE INDEX idx_tasks_status ON project_management.tasks(status);
CREATE INDEX idx_tasks_assignee ON project_management.tasks(assignee);
CREATE INDEX idx_tasks_due_date ON project_management.tasks(due_date);
```

### Vector Store Integration
```sql
-- Vector embeddings for advanced search
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vector_store.task_embeddings (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES project_management.tasks(id),
    embedding vector(1536),
    content_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity index
CREATE INDEX ON vector_store.task_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

## 🔄 Real-time Communication

### WebSocket Architecture
```
Client (React)          Server (Socket.io)         Database
     │                       │                       │
     │──── connect ──────────►│                       │
     │                       │                       │
     │                       │──── task:update ─────►│
     │◄─── task:updated ─────│                       │
     │                       │                       │
     │──── join:project ─────►│                       │
     │                       │                       │
     │──── task:create ──────►│──── INSERT ─────────►│
     │◄─── task:created ─────│◄──── RETURNING ──────│
     │                       │                       │
     │                       │──── broadcast ──────►│
     │◄─── task:created ─────│     to all clients    │
```

### Event Types
**Client → Server:**
- `join:project` - Join project room for updates
- `leave:project` - Leave project room
- `task:create` - Create new task
- `task:update` - Update existing task
- `task:delete` - Delete task

**Server → Client:**
- `task:created` - New task created
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `project:updated` - Project modified
- `user:joined` - User joined project
- `user:left` - User left project

## 🔐 Security Architecture

### Authentication Flow (Future Implementation)
```
1. User login request
   ├── Validate credentials
   ├── Generate JWT token
   └── Return token + user data

2. Subsequent requests
   ├── Include JWT in Authorization header
   ├── Middleware validates token
   ├── Extract user info from token
   └── Proceed with request

3. Token refresh
   ├── Check token expiration
   ├── Generate new token if needed
   └── Return refreshed token
```

### Security Measures
- **CORS**: Configured for specific origins
- **Helmet**: Security headers (CSP, HSTS, etc.)
- **Rate Limiting**: API request throttling
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Content sanitization

## 📊 Performance Architecture

### Frontend Optimization
- **Code Splitting**: Route-based splitting with React.lazy()
- **Bundle Analysis**: Webpack bundle analyzer
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Lazy loading and compression
- **Service Worker**: Caching for offline support (future)

### Backend Optimization
- **Database Indexing**: Strategic index placement
- **Query Optimization**: Efficient SQL queries
- **Caching**: Redis for session and query caching (future)
- **Connection Pooling**: PostgreSQL connection pool
- **Compression**: Gzip response compression

### Database Optimization
- **Indexing Strategy**: Primary and secondary indexes
- **Query Performance**: EXPLAIN ANALYZE for optimization
- **Connection Pooling**: pgBouncer for connection management
- **Partitioning**: Table partitioning for large datasets (future)

## 🚀 Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (Vite dev server)
├── Backend (Node.js with nodemon)
├── Database (Docker PostgreSQL)
└── Redis (Docker, future)
```

### Production Environment
```
Production Server
├── Nginx (Reverse proxy)
│   ├── SSL termination
│   ├── Static file serving
│   ├── Load balancing
│   └── Rate limiting
├── Frontend (Nginx static files)
├── Backend (Node.js cluster)
├── Database (PostgreSQL cluster)
└── Redis (Cluster mode)
```

### CI/CD Pipeline
```
GitHub Repository
├── Push to main branch
├── GitHub Actions triggered
├── Run tests (frontend + backend)
├── Build Docker images
├── Push to container registry
├── Deploy to staging environment
├── Run E2E tests
├── Deploy to production
└── Health check verification
```

## 📈 Monitoring and Observability

### Application Monitoring
- **Health Checks**: `/api/health` endpoint
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Error rates and types
- **User Analytics**: Feature usage patterns

### Infrastructure Monitoring
- **Container Health**: Docker container status
- **Resource Usage**: CPU, memory, disk utilization
- **Database Performance**: Query performance, connections
- **Network Monitoring**: Request/response patterns

### Logging Strategy
```
Log Levels:
├── ERROR: System errors and exceptions
├── WARN: Warning conditions
├── INFO: General information
├── DEBUG: Detailed debugging information
└── TRACE: Very detailed trace information

Log Outputs:
├── Console (development)
├── File rotation (production)
├── Centralized logging (future: ELK stack)
└── Error reporting (future: Sentry)
```

## 🔮 Future Architecture Considerations

### Scalability Improvements
- **Microservices**: Split into smaller services
- **Message Queue**: Redis/RabbitMQ for async processing
- **Load Balancing**: Multiple backend instances
- **CDN**: Static asset distribution
- **Database Sharding**: Horizontal database scaling

### Feature Enhancements
- **Offline Support**: Service Worker implementation
- **Mobile Apps**: React Native or native apps
- **API Gateway**: Centralized API management
- **Analytics Engine**: Advanced reporting and insights
- **AI Integration**: Smart task recommendations

### Security Enhancements
- **OAuth Integration**: Third-party authentication
- **Role-Based Access**: Granular permissions
- **Audit Logging**: Complete action tracking
- **Data Encryption**: At-rest and in-transit encryption
- **Security Scanning**: Automated vulnerability assessment

---

**Next**: Learn about [Development Setup](Development-Setup) to start contributing to the project.