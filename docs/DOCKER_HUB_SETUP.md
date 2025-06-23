# Docker Hub Setup for CI/CD

## Required Setup

⚠️ **Action Required**: Docker Hub token needs to be added to GitHub Secrets for automatic image publishing.

## Setting up Docker Hub Token

To enable automatic Docker image publishing to Docker Hub, you need to:

1. **Create a Docker Hub Access Token**:
   - Go to https://hub.docker.com/settings/security
   - Click "New Access Token"
   - Name it: `projecthub-mcp-github-actions`
   - Select permissions: `Read, Write, Delete`
   - Copy the generated token

2. **Add Token to GitHub Secrets**:
   - Go to https://github.com/anubissbe/ProjectHub-Mcp/settings/secrets/actions
   - Click "New repository secret"
   - Name: `DOCKERHUB_TOKEN`
   - Value: Paste your Docker Hub access token
   - Click "Add secret"

3. **Verify Docker Hub Username**:
   - The workflow uses `anubissbe` as the Docker Hub username
   - Images will be published to:
     - `anubissbe/projecthub-mcp-frontend`
     - `anubissbe/projecthub-mcp-backend`

## Manual Build and Push (Optional)

If you want to manually build and push images:

```bash
# Build images
docker build -t anubissbe/projecthub-mcp-frontend:latest ./frontend
docker build -t anubissbe/projecthub-mcp-backend:latest ./backend

# Login to Docker Hub
docker login

# Push images
docker push anubissbe/projecthub-mcp-frontend:latest
docker push anubissbe/projecthub-mcp-backend:latest
```

## Image Tags

The CI/CD workflow creates these tags:
- `latest` - Always points to the latest main branch build
- `v*` - Version tags (e.g., v4.5.1, v4.5.2)
- `main` - Main branch builds
- `X.Y` - Major.minor version tags (e.g., 4.5)

## Multi-Platform Builds

Images are built for both:
- `linux/amd64` - Standard x86_64 architecture
- `linux/arm64` - ARM architecture (Apple Silicon, Raspberry Pi, etc.)