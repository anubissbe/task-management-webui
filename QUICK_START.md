# ProjectHub - Quick Start Guide

## 🎯 Current Status
**WORKING APPLICATION DEPLOYED**

## 🚀 Access URLs
- **Frontend**: http://172.28.173.145:5173
- **Backend**: http://192.168.1.24:3008

## 🔐 Login Credentials
- **Admin**: admin@projecthub.com / admin123
- **User**: demo@projecthub.com / demo123

## 🔧 Quick Commands

### Check Status
```bash
docker ps | grep projecthub
curl -I http://172.28.173.145:5173
```

### Restart if Needed
```bash
docker start projecthub-backend-final
docker start projecthub-frontend-final
```

### View Logs
```bash
docker logs projecthub-frontend-final
docker logs projecthub-backend-final
```

## 📁 Key Files
- **Working Frontend**: `/tmp/index.html`
- **Documentation**: `/opt/projects/projects/projecthub-mcp-server/DEPLOYMENT_SUMMARY.md`
- **All Scripts**: `/opt/projects/projects/projecthub-mcp-server/*.py`

## ✅ What's Working
- ✅ Authentication system
- ✅ Beautiful UI with CSS styling  
- ✅ Project dashboard
- ✅ Real-time data from API
- ✅ Accessible from external network

**For full details, see DEPLOYMENT_SUMMARY.md**