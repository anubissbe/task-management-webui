PROJECTHUB DEPLOYMENT PACKAGE
============================

This package contains everything needed to deploy ProjectHub to Synology.

Files included:
- projecthub-source.tar.gz: Application source code
- docker-compose.synology-minimal.yml: Docker configuration
- .env.synology: Environment configuration
- synology_quick_deploy.sh: Quick deployment script
- DEPLOYMENT_GUIDE.md: Detailed deployment guide

QUICK DEPLOYMENT:
1. Copy all files to Synology /tmp directory
2. SSH to Synology: ssh -p 2222 Bert@192.168.1.24
3. Run: sudo bash /tmp/synology_quick_deploy.sh

MANUAL DEPLOYMENT:
See DEPLOYMENT_GUIDE.md for detailed instructions.
