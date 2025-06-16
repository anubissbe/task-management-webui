# 🚀 Upgrading ProjectHub-Mcp on Synology NAS

This guide helps you upgrade ProjectHub-Mcp containers on your Synology NAS to the latest version.

## 📦 Latest Container Images

- **Frontend**: `ghcr.io/anubissbe/projecthub-mcp-frontend:branded`
- **Backend**: `ghcr.io/anubissbe/projecthub-mcp-backend:latest`

## 🔧 Upgrade Methods

### Method 1: Using the Upgrade Script (Recommended)

1. **Copy the upgrade script to your Synology:**
   ```bash
   scp -P 2222 upgrade-synology.sh root@192.168.1.24:/tmp/
   ```

2. **SSH to your Synology:**
   ```bash
   ssh -p 2222 root@192.168.1.24
   ```

3. **Run the upgrade script:**
   ```bash
   cd /tmp
   chmod +x upgrade-synology.sh
   ./upgrade-synology.sh
   ```

### Method 2: Using Synology Docker GUI

1. **Open Docker application** in Synology DSM

2. **Pull new images:**
   - Go to Registry
   - Search for `ghcr.io/anubissbe/projecthub-mcp-frontend`
   - Click Download and select `branded` tag
   - Search for `ghcr.io/anubissbe/projecthub-mcp-backend`
   - Click Download and select `latest` tag

3. **Stop existing containers:**
   - Go to Container
   - Select your ProjectHub frontend and backend containers
   - Click Stop

4. **Create new containers:**
   - Select the old container
   - Click Settings → Duplicate settings
   - Change the image to the new version
   - Click Apply

5. **Remove old containers:**
   - Select the old stopped containers
   - Click Delete

### Method 3: Manual Command Line Upgrade

1. **SSH to your Synology:**
   ```bash
   ssh -p 2222 root@192.168.1.24
   ```

2. **Pull latest images:**
   ```bash
   docker pull ghcr.io/anubissbe/projecthub-mcp-frontend:branded
   docker pull ghcr.io/anubissbe/projecthub-mcp-backend:latest
   ```

3. **Stop existing containers:**
   ```bash
   docker stop projecthub-mcp-frontend projecthub-mcp-backend
   ```

4. **Backup container settings:**
   ```bash
   docker inspect projecthub-mcp-frontend > frontend-backup.json
   docker inspect projecthub-mcp-backend > backend-backup.json
   ```

5. **Remove old containers:**
   ```bash
   docker rm projecthub-mcp-frontend projecthub-mcp-backend
   ```

6. **Create new containers with same settings:**
   ```bash
   # Backend
   docker run -d \
     --name projecthub-mcp-backend \
     --network bridge \
     -p 3001:3001 \
     -e NODE_ENV=production \
     -e DATABASE_URL="postgresql://app_user:app_secure_2024@192.168.1.24:5433/mcp_learning" \
     -e CORS_ORIGIN="http://192.168.1.24:5173" \
     --restart unless-stopped \
     ghcr.io/anubissbe/projecthub-mcp-backend:latest

   # Frontend
   docker run -d \
     --name projecthub-mcp-frontend \
     --network bridge \
     -p 5173:5173 \
     -e VITE_API_URL="http://192.168.1.24:3001/api" \
     --restart unless-stopped \
     ghcr.io/anubissbe/projecthub-mcp-frontend:branded
   ```

7. **Verify containers are running:**
   ```bash
   docker ps | grep projecthub
   ```

## ✅ Post-Upgrade Verification

1. **Check container status:**
   ```bash
   docker ps
   ```

2. **Check backend health:**
   ```bash
   curl http://192.168.1.24:3001/api/health
   ```

3. **Access the web UI:**
   - Open http://192.168.1.24:5173 in your browser
   - Verify the new branding is visible
   - Test creating/updating tasks

## 🔄 Rollback (if needed)

If you need to rollback to the previous version:

1. **Stop new containers:**
   ```bash
   docker stop projecthub-mcp-frontend projecthub-mcp-backend
   ```

2. **Restore from backup:**
   - Use the backup JSON files to recreate containers with old images
   - Or use Synology's container backup feature if enabled

## 📝 Notes

- Your data is stored in PostgreSQL, so it's safe during container upgrades
- The branded frontend includes the black/orange theme
- Container names might vary (check with `docker ps -a`)
- Always backup your configuration before upgrading

## 🆘 Troubleshooting

**Container won't start:**
- Check logs: `docker logs projecthub-mcp-backend`
- Verify environment variables are correct
- Ensure ports 3001 and 5173 are not in use

**Can't connect to database:**
- Verify PostgreSQL is running on port 5433
- Check DATABASE_URL is correct
- Ensure network connectivity

**Frontend shows connection error:**
- Verify VITE_API_URL points to correct backend URL
- Check CORS_ORIGIN in backend matches frontend URL
- Clear browser cache