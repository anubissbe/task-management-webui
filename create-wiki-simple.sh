#!/bin/bash

# Simple script to create GitHub wiki using authenticated git
# This uses the GitHub CLI authentication that's already set up

set -e

echo "Creating GitHub wiki repository..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "Initializing git repository..."
git init
git config user.name "Claude Code"
git config user.email "noreply@anthropic.com"

# Add remote using HTTPS (GitHub CLI auth should handle this)
git remote add origin "https://github.com/anubissbe/task-management-webui.wiki.git"

echo "Copying wiki content..."
# Copy all wiki files
cp /opt/projects/projects/task-management-webui/wiki/*.md .

echo "Adding and committing files..."
git add .
git commit -m "Initial comprehensive wiki documentation

This commit adds the complete wiki documentation for the Task Management WebUI project:

- Home: Main wiki homepage with navigation structure
- Installation Guide: Complete installation instructions for all deployment methods
- User Interface Overview: Comprehensive UI guide covering all views and features
- API Documentation: Full REST API reference with examples and WebSocket events
- Architecture Overview: Technical architecture and system design documentation
- Task Management: Complete task management workflows and best practices
- Project Management: Project management strategies and methodologies
- Analytics Dashboard: Analytics features and performance metrics guide
- Development Setup: Development environment setup and workflows
- Production Deployment: Production deployment guide for various platforms
- FAQ: Frequently asked questions covering all common topics
- Troubleshooting: Comprehensive troubleshooting guide for common issues

The wiki provides complete documentation for users, developers, and system administrators
at all skill levels, from basic installation to advanced production deployments.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "Pushing to GitHub wiki..."
if git push -u origin master; then
    echo "✅ All wiki pages uploaded successfully!"
    echo "📖 Visit the wiki at: https://github.com/anubissbe/task-management-webui/wiki"
else
    echo "❌ Failed to push to wiki repository."
    echo "This is expected if the wiki hasn't been initialized yet."
    echo ""
    echo "📝 To fix this, you need to:"
    echo "1. Go to: https://github.com/anubissbe/task-management-webui/wiki"
    echo "2. Click 'Create the first page'"
    echo "3. Set title to 'Home' and add any content"
    echo "4. Save the page"
    echo "5. Run this script again"
    echo ""
    echo "All wiki content is ready in this directory if you want to copy it manually:"
    echo "$(pwd)"
    ls -la *.md
fi

# Clean up only if successful
if [ $? -eq 0 ]; then
    cd /opt/projects/projects/task-management-webui
    rm -rf "$TEMP_DIR"
fi