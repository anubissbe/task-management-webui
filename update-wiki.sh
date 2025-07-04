#!/bin/bash

# Update GitHub Wiki Script for ProjectHub-MCP v5.0.0

echo "Updating ProjectHub-MCP Wiki to v5.0.0..."

# Clone the wiki if it doesn't exist
if [ ! -d "ProjectHub-Mcp.wiki" ]; then
    echo "Cloning wiki repository..."
    git clone https://github.com/anubissbe/ProjectHub-Mcp.wiki.git
else
    echo "Wiki repository already exists, pulling latest changes..."
    cd ProjectHub-Mcp.wiki
    git pull
    cd ..
fi

# Copy all updated wiki files
echo "Copying updated wiki files..."
cp wiki/*.md ProjectHub-Mcp.wiki/

# Create screenshots directory in wiki
mkdir -p ProjectHub-Mcp.wiki/screenshots

# Copy screenshots to wiki
echo "Copying screenshots..."
cp screenshots/*.png ProjectHub-Mcp.wiki/screenshots/

# Navigate to wiki directory
cd ProjectHub-Mcp.wiki

# Add all changes
git add -A

# Commit with descriptive message
git commit -m "docs: Update wiki to v5.0.0

- Updated all documentation to version 5.0.0
- Added project deletion feature documentation
- Updated API documentation with DELETE endpoints
- Added real screenshots of the application
- Updated port references (3001 → 3009)
- Enhanced security documentation
- Fixed status mapping documentation"

# Push to GitHub
echo "Pushing to GitHub wiki..."
git push

echo "Wiki update complete!"