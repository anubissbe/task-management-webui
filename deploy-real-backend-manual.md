# Deploy Real Backend - Manual Instructions

The real backend that connects to PostgreSQL has been built and packaged. Follow these steps to deploy it on your Synology NAS:

## Files Created
- `projecthub-backend-real.tar.gz` - Docker image with real backend
- `backend-deployment.tar.gz` - Source files for building on Synology

## Deployment Steps

1. **Copy the Docker image to Synology:**
   ```bash
   scp -P 2222 projecthub-backend-real.tar.gz Bert@192.168.1.24:/volume1/docker/temp/
   ```

2. **SSH into Synology:**
   ```bash
   ssh -p 2222 Bert@192.168.1.24
   ```

3. **Load the Docker image:**
   ```bash
   cd /volume1/docker/temp
   docker load < projecthub-backend-real.tar.gz
   ```

4. **Stop and remove the old mock backend:**
   ```bash
   docker stop projecthub-mcp-backend
   docker rm projecthub-mcp-backend
   ```

5. **Run the real backend:**
   ```bash
   docker run -d \
     --name projecthub-mcp-backend \
     --network projecthub-mcp-server_projecthub-mcp-network \
     -p 3008:3001 \
     -e NODE_ENV=production \
     -e DATABASE_URL=postgresql://projecthub:projecthub123@projecthub-mcp-postgres:5432/projecthub \
     -e CORS_ORIGIN="*" \
     --restart unless-stopped \
     projecthub-backend:latest
   ```

6. **Verify the deployment:**
   ```bash
   # Check if container is running
   docker ps | grep projecthub-mcp-backend
   
   # View logs
   docker logs projecthub-mcp-backend
   
   # Test health endpoint
   curl http://localhost:3008/health
   ```

## What This Changes

- **Before:** Mock backend with hardcoded sample data (users, projects, tasks)
- **After:** Real backend connected to PostgreSQL database
- **Database:** Uses the existing PostgreSQL container at `projecthub-mcp-postgres:5432`
- **Authentication:** Real user authentication with JWT tokens
- **Data:** All data comes from the database, not hardcoded arrays

## Important Notes

1. The real backend expects the database schema to be already created
2. Default admin user credentials should be set up in the database
3. The frontend at http://192.168.1.24:5174 will now use real data
4. All API endpoints will work with actual database operations

## Troubleshooting

If the backend fails to start, check:
1. Database connection: `docker logs projecthub-mcp-backend`
2. Network connectivity: `docker network inspect projecthub-mcp-server_projecthub-mcp-network`
3. PostgreSQL is running: `docker ps | grep postgres`
4. Database exists: Connect to PostgreSQL and check `projecthub` database