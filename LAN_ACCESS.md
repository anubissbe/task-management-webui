# ProjectHub MCP Server - LAN Access

## Network Configuration

The ProjectHub application is running on host `172.28.173.145` with all services bound to `0.0.0.0`, making them accessible from anywhere on the local network.

## Access URLs

### For Local Network Users:
- **ProjectHub Web Application**: http://172.28.173.145:5174
- **Backend API**: http://172.28.173.145:3009
- **Health Check**: http://172.28.173.145:3009/health

### For Host/Localhost:
- **ProjectHub Web Application**: http://localhost:5174
- **Backend API**: http://localhost:3009

## Port Bindings

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| Frontend | 5174 | 80 | React application |
| Backend | 3009 | 3001 | API server |
| Database | 5432 | 5432 | PostgreSQL |

## Network Requirements

- All ports are bound to `0.0.0.0` for LAN accessibility
- No firewall restrictions on the host
- Standard HTTP traffic on ports 5174 and 3009

## Usage Instructions

1. **From any device on the LAN:**
   - Open web browser
   - Navigate to: http://172.28.173.145:5174
   - Application auto-authenticates
   - Full functionality available

2. **No additional setup required:**
   - No login credentials needed
   - No VPN or special network configuration
   - Works on any device with a web browser

## Troubleshooting

If the application is not accessible from other devices:

1. **Check host firewall:**
   ```bash
   sudo ufw status
   # If active, allow the ports:
   sudo ufw allow 5174
   sudo ufw allow 3009
   ```

2. **Verify containers are running:**
   ```bash
   docker ps | grep projecthub
   ```

3. **Test connectivity:**
   ```bash
   curl http://172.28.173.145:5174
   curl http://172.28.173.145:3009/health
   ```

## Security Note

The current setup is configured for local development/testing with:
- No authentication required
- All endpoints publicly accessible
- Mock data instead of real database

For production use, implement proper authentication and security measures.