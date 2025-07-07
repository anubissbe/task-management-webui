# ProjectHub MCP Installation Guide

## Quick Start

ProjectHub MCP is a comprehensive project management system with MCP (Model Context Protocol) integration. 

> 🚀 **Fast Deployment**: Uses pre-built Docker Hub images (`anubissbe/projecthub-backend:latest` and `anubissbe/projecthub-frontend:latest`) - no building required!

Follow these steps to get started:

### Prerequisites

- Docker and Docker Compose
- At least 2GB RAM
- 5GB disk space

### Basic Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anubissbe/ProjectHub-Mcp.git
   cd ProjectHub-Mcp
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Web Interface: http://localhost:8090
   - API: http://localhost:3009
   - MCP Server: http://localhost:3013

### Environment Configuration

Edit the `.env` file with your settings:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=projecthub
DB_USER=projecthub
DB_PASSWORD=your_secure_password

# API Configuration
API_PORT=3009
API_HOST=0.0.0.0

# Frontend Configuration
FRONTEND_PORT=8090

# MCP Server Configuration
MCP_PORT=3013

# Security
JWT_SECRET=your_jwt_secret_key_here
BCRYPT_ROUNDS=12

# Optional: External Database
# If you want to use an external database, update these:
# DB_HOST=your_database_host
# DB_PORT=your_database_port
```

### Production Deployment

For production deployments, use the production configuration:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Hub Installation

Alternatively, you can use the pre-built images from Docker Hub:

```bash
# Create docker-compose.yml with Docker Hub images
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: projecthub
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5434:5432"

  backend:
    image: anubissbe/projecthub-backend:latest
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=projecthub
      - DB_USER=projecthub
      - DB_PASSWORD=${DB_PASSWORD}
    ports:
      - "3009:3009"
    depends_on:
      - postgres

  frontend:
    image: anubissbe/projecthub-frontend:latest
    ports:
      - "8090:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Network Configuration

By default, ProjectHub uses these ports:
- **8090**: Frontend web interface
- **3009**: Backend API
- **3013**: MCP server
- **5434**: PostgreSQL database

Make sure these ports are available on your system.

### Troubleshooting

**Container startup issues:**
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart services
docker-compose restart
```

**Database connection issues:**
```bash
# Verify database is running
docker-compose ps
# Check database logs
docker-compose logs postgres
```

**Port conflicts:**
```bash
# Check if ports are in use
sudo netstat -tulpn | grep :8090
sudo netstat -tulpn | grep :3009
```

### Next Steps

1. Access the web interface at http://localhost:8090
2. Create your first project
3. Set up MCP integration with your AI tools
4. Review the [User Guide](docs/README.md) for detailed usage instructions

### MCP Integration

To integrate with Claude Code or other MCP clients, use:
- **MCP Server URL**: `http://your_server_ip:3013`
- **Health Check**: `http://your_server_ip:3013/health`

See the [MCP documentation](mcp-server/README.md) for detailed integration instructions.