# Manual Build Instructions for ProjectHub-MCP Frontend

## Prerequisites
- Docker installed and running
- GitHub Personal Access Token with `write:packages` permission
- Node.js 22 or later (for local development)

## Build Steps

### 1. Clone and Configure Git
```bash
cd /opt/projects/projects/ProjectHub-Mcp
git config user.name "anubissbe"
git config user.email "bert@telkom.be"
```

### 2. Build Docker Image
Navigate to the frontend directory and build:

```bash
cd frontend
docker build -t ghcr.io/anubissbe/projecthub-mcp-frontend:latest \
             -t ghcr.io/anubissbe/projecthub-mcp-frontend:v1.0.0 .
```

### 3. Login to GitHub Container Registry
```bash
# Set your GitHub token
export GITHUB_TOKEN="your-github-token-here"

# Login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u anubissbe --password-stdin
```

### 4. Push Images
```bash
docker push ghcr.io/anubissbe/projecthub-mcp-frontend:latest
docker push ghcr.io/anubissbe/projecthub-mcp-frontend:v1.0.0
```

## Verify the Build

### Check Local Images
```bash
docker images | grep projecthub-mcp-frontend
```

### Test Run Locally
```bash
docker run -d -p 5173:5173 --name projecthub-test ghcr.io/anubissbe/projecthub-mcp-frontend:latest
# Visit http://localhost:5173 to verify
docker stop projecthub-test && docker rm projecthub-test
```

## Applied Branding Changes

✅ **Black/Orange Theme** (`frontend/src/index.css`)
- Primary colors: Black (#000000) and Orange (#f97316)
- Gradient backgrounds and hover effects
- Custom ProjectHub utility classes

✅ **ProjectHub Branding** (`frontend/src/components/Layout.tsx`)
- ProjectHub logo with animated effects
- "ProjectHub — MCP" branding in header
- Working navigation links to home page
- Footer with GitHub repository link

✅ **Dark Mode Support** (`frontend/src/pages/ProjectList.tsx` and throughout)
- Full dark mode compatibility
- Orange accent colors in dark theme
- Proper contrast ratios

## Docker Image Details

- **Base Image**: Node 22 Alpine (build), Nginx Alpine (runtime)
- **Port**: 5173
- **Size**: ~25MB (optimized multi-stage build)
- **Tags**: 
  - `ghcr.io/anubissbe/projecthub-mcp-frontend:latest`
  - `ghcr.io/anubissbe/projecthub-mcp-frontend:v1.0.0`

## Environment Variables

The frontend accepts these environment variables:

- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

## Deployment Example

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    image: ghcr.io/anubissbe/projecthub-mcp-frontend:latest
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://backend:3001
    restart: unless-stopped
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: projecthub-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: projecthub-frontend
  template:
    metadata:
      labels:
        app: projecthub-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/anubissbe/projecthub-mcp-frontend:latest
        ports:
        - containerPort: 5173
        env:
        - name: VITE_API_URL
          value: "http://projecthub-backend:3001"
```

## Troubleshooting

### Build Fails
- Ensure Docker daemon is running: `sudo systemctl start docker`
- Check Docker disk space: `docker system df`
- Clean Docker cache: `docker builder prune -a`

### Push Fails
- Verify GitHub token permissions
- Check registry login: `docker login ghcr.io`
- Ensure image exists locally: `docker images`

### Runtime Issues
- Check container logs: `docker logs <container-id>`
- Verify nginx config is copied correctly
- Ensure port 5173 is not in use