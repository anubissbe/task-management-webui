# ProjectHub-Mcp - Deployment Guide

## Current Implementation Details

### Features Implemented

1. **Multi-Project Management**
   - Projects list with table view
   - Project creation and management
   - Project-specific task isolation

2. **Kanban Board**
   - Drag-and-drop functionality
   - 5 status columns: Pending, In Progress, Review, Completed, Blocked
   - Expandable task hierarchy (phases with subtasks)
   - Task count per column
   - "Expand All" button for convenience
   - Vertical scrolling within columns for many tasks

3. **Navigation Flow**
   - `/` - Projects list (landing page)
   - `/board` - Project selector (card-based UI)
   - `/projects/:id` - Project-specific Kanban board
   - `/analytics` - Multi-project analytics dashboard

4. **Analytics Dashboard**
   - Task completion percentage per project
   - Hours progress tracking
   - Task distribution by status
   - Visual progress bars and statistics

5. **UI/UX Features**
   - Dark/Light theme toggle
   - Responsive design
   - Priority color coding (critical=red, high=orange, medium=yellow, low=green)
   - Status-based column styling
   - Modern card-based interfaces

### Database Integration
- Connected to PostgreSQL at `localhost:5432`
- Database: `mcp_learning`
- Schema: `project_management`
- Integrated with project-tasks MCP server

### Current Deployment (Local)
- Backend: http://localhost:3001
- Frontend: http://localhost:5173
- Database: postgresql://mcp_user:mcp_secure_password_2024@localhost:5432/mcp_learning

## Deploying to Remote Server (192.168.1.25)

### Prerequisites on Remote Server
- Docker and Docker Compose installed
- PostgreSQL with pgvector extension
- Port 5173 (frontend) and 3001 (backend) available

### Step 1: Prepare for Transfer

```bash
# Create deployment package
cd /opt/projects/projects/ProjectHub-Mcp
tar -czf ProjectHub-Mcp.tar.gz \
  backend/ \
  frontend/ \
  docker-compose.yml \
  README.md \
  DEPLOYMENT.md

# Copy to remote server
scp ProjectHub-Mcp.tar.gz drwho@192.168.1.25:/home/drwho/
```

### Step 2: Remote Server Setup

```bash
# SSH to remote server
ssh drwho@192.168.1.25

# Create project directory
mkdir -p /opt/projects/ProjectHub-Mcp
cd /opt/projects/ProjectHub-Mcp

# Extract files
tar -xzf ~/ProjectHub-Mcp.tar.gz

# Update backend environment
cat > backend/.env << EOF
DATABASE_URL=postgresql://mcp_user:mcp_secure_password_2024@host.docker.internal:5432/mcp_learning
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://192.168.1.25:5173
EOF

# Update frontend environment for remote access
cat > frontend/.env << EOF
VITE_API_URL=http://192.168.1.25:3001/api
EOF
```

### Step 3: Update Docker Compose for Remote

```yaml
# docker-compose.yml modifications for remote deployment
version: '3.8'

services:
  backend:
    container_name: projecthub-mcp-backend
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://mcp_user:mcp_secure_password_2024@192.168.1.25:5432/mcp_learning
      - PORT=3001
      - NODE_ENV=production
      - CORS_ORIGIN=http://192.168.1.25:5173
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:192.168.1.25"

  frontend:
    container_name: projecthub-mcp-frontend
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://192.168.1.25:3001/api
    restart: unless-stopped
```

### Step 4: Database Setup on Remote

```bash
# Ensure PostgreSQL is running and accessible
docker exec mcp-postgres psql -U mcp_user -d mcp_learning -c "\dn"

# The project_management schema should already exist from MCP setup
# If not, run the schema creation script
```

### Step 5: Build and Run

```bash
# Build and start containers
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Verify containers are running
docker ps | grep projecthub-mcp
```

### Step 6: Access the Application

- Frontend: http://192.168.1.25:5173
- Backend API: http://192.168.1.25:3001/api
- Health check: http://192.168.1.25:3001/api/health

### Step 7: Configure MCP Server

Update the claude.json on your local machine to use the remote task management UI:

```json
{
  "task-management-ui": {
    "url": "http://192.168.1.25:5173",
    "api": "http://192.168.1.25:3001/api"
  }
}
```

## Maintenance

### Viewing Logs
```bash
docker logs projecthub-mcp-backend
docker logs projecthub-mcp-frontend
```

### Updating the Application
```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Backup Database
```bash
docker exec mcp-postgres pg_dump -U mcp_user -d mcp_learning -n project_management > project_tasks_backup.sql
```

### Monitoring
- Check container health: `docker ps`
- API health: `curl http://192.168.1.25:3001/api/health`
- Database connections: `docker exec mcp-postgres psql -U mcp_user -d mcp_learning -c "SELECT count(*) FROM pg_stat_activity;"`

## Troubleshooting

### Frontend can't connect to backend
- Check CORS settings in backend
- Verify firewall rules allow port 3001
- Check docker network connectivity

### Database connection issues
- Verify PostgreSQL is accessible from Docker containers
- Check connection string in backend/.env
- Ensure user permissions are correct

### Performance issues
- Add indexes to frequently queried columns
- Implement pagination for large task lists
- Consider Redis for caching

## Security Notes

- Currently no authentication (designed for local/trusted network use)
- Add nginx reverse proxy with SSL for internet exposure
- Implement user authentication before public deployment
- Use environment-specific secrets management