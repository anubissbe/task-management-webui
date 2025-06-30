# ProjectHub Deployment Instructions

## Quick Deployment (Copy & Paste)

### Step 1: Transfer the bundle to Synology

From your local machine (this server), run:

```bash
cd /opt/projects/projects/projecthub-mcp-server
python3 -m http.server 8080
```

Then on your Synology NAS (via SSH), run:

```bash
cd /tmp
wget http://[YOUR-CURRENT-SERVER-IP]:8080/projecthub-complete-bundle.tar.gz
```

### Step 2: Deploy on Synology

On your Synology NAS, run:

```bash
# Create project directory
sudo mkdir -p /volume1/docker/projecthub
cd /volume1/docker/projecthub

# Extract bundle
sudo tar -xzf /tmp/projecthub-complete-bundle.tar.gz

# Run deployment
sudo bash synology_complete_deploy.sh

# Clean up
sudo rm /tmp/projecthub-complete-bundle.tar.gz
```

### Step 3: Verify Deployment

Check services:
```bash
sudo docker-compose ps
sudo docker-compose logs -f
```

Access:
- Frontend: http://192.168.1.24:5174
- Backend: http://192.168.1.24:3007/api
- Health: http://192.168.1.24:3007/api/health

## Alternative: Manual Transfer via SCP

If you have SSH key setup:
```bash
scp -P 2222 projecthub-complete-bundle.tar.gz Bert@192.168.1.24:/tmp/
```

Then follow Step 2 above.