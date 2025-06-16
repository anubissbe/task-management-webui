#!/bin/bash

echo "🚀 Deploying ProjectHub-MCP Branded Frontend..."

# Build the production files
echo "📦 Building production bundle..."
cd /opt/projects/projects/ProjectHub-Mcp/frontend
npm run build

# Since the docker container mounts ./frontend:/app, 
# we need to copy dist files to the right location
echo "📂 Copying build files..."
cp -r dist/* .

echo "✅ Deployment complete!"
echo "🌐 The branded UI should now be visible at http://192.168.1.24:5173"
echo ""
echo "Note: Since the dev server is running, it will serve the built files from the dist folder."