#!/bin/bash

# Docker-based gitleaks test - no installation required

echo "🐳 Testing Gitleaks Configuration with Docker"
echo "============================================"

cd /opt/projects/ProjectHub-Mcp

# Run gitleaks using Docker
echo "Running gitleaks scan with custom configuration..."
docker run --rm \
  -v "$(pwd)":/repo \
  zricethezav/gitleaks:latest \
  detect --source /repo --config /repo/.gitleaks.toml --verbose

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! No leaks detected."
    echo ""
    echo "Whitelisted patterns:"
    echo "  ✓ Demo credentials (admin@projecthub.com)"
    echo "  ✓ Test database password (projecthub123)"  
    echo "  ✓ E2E test credentials"
    echo "  ✓ Git configuration email"
else
    echo ""
    echo "⚠️  Potential leaks found - review output above"
fi