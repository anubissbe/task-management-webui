#!/bin/bash

# Script to update existing GitHub wiki with our comprehensive documentation
# This handles the case where wiki already exists

set -e

echo "Updating existing GitHub wiki repository..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "Cloning existing wiki repository..."
if git clone "https://github.com/anubissbe/task-management-webui.wiki.git" .; then
    echo "✅ Successfully cloned existing wiki"
    
    # Configure git
    git config user.name "Claude Code"
    git config user.email "noreply@anthropic.com"
    
    echo "Backing up existing content..."
    if [ -f "Home.md" ]; then
        cp "Home.md" "Home.md.backup"
        echo "📋 Backed up existing Home.md"
    fi
    
    echo "Adding comprehensive wiki documentation..."
    # Copy all wiki files, overwriting existing ones
    cp /opt/projects/projects/task-management-webui/wiki/*.md .
    
    echo "Checking for changes..."
    if git diff --quiet && git diff --cached --quiet; then
        echo "ℹ️  No changes detected - wiki is already up to date"
    else
        echo "📝 Changes detected, committing updates..."
        
        git add .
        git commit -m "Update wiki with comprehensive documentation

This update adds/refreshes the complete wiki documentation:

📚 Wiki Pages (12 total):
- Home: Main navigation and project overview
- Installation Guide: Complete setup instructions for all deployment methods  
- User Interface Overview: Comprehensive UI guide for all views and features
- API Documentation: Full REST API reference with examples and WebSocket events
- Architecture Overview: Technical system design and architecture documentation
- Task Management: Complete workflows and best practices for task management
- Project Management: Strategies, methodologies, and team collaboration
- Analytics Dashboard: Performance metrics, reporting, and insights guide
- Development Setup: Development environment setup and workflows
- Production Deployment: Production deployment guide for various platforms
- FAQ: Frequently asked questions covering all common user scenarios
- Troubleshooting: Comprehensive problem-solving guide for common issues

✨ Features:
- Professional documentation covering beginner to expert level
- Cross-platform support (Windows, macOS, Linux, Docker, cloud)
- Detailed technical references and practical examples
- Step-by-step procedures and troubleshooting guides
- Visual organization with emojis, tables, and code blocks
- Cross-references between related documentation sections

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        
        echo "Pushing updates to GitHub wiki..."
        if git push origin master; then
            echo "🎉 Successfully updated GitHub wiki!"
            echo "📖 View the updated wiki at: https://github.com/anubissbe/task-management-webui/wiki"
            echo ""
            echo "📋 Updated pages:"
            ls -la *.md | awk '{print "  - " $9}' | sed 's/.md$//'
        else
            echo "❌ Failed to push updates"
            exit 1
        fi
    fi
    
else
    echo "❌ Failed to clone wiki repository"
    echo "The wiki might not exist yet. Try creating the first page manually:"
    echo "1. Go to: https://github.com/anubissbe/task-management-webui/wiki"
    echo "2. Click 'Create the first page'"
    echo "3. Set title to 'Home' and add any content"
    echo "4. Save the page"
    echo "5. Run this script again"
    exit 1
fi

# Clean up
cd /opt/projects/projects/task-management-webui
rm -rf "$TEMP_DIR"