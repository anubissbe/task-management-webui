#!/bin/bash

# Script to create initial GitHub wiki page using GitHub API
# This will initialize the wiki repository so we can then push all content

set -e

echo "Creating initial GitHub wiki page..."

# Get the token
TOKEN=$(gh auth token)

# Create initial wiki page using GitHub's undocumented wiki API
# Note: GitHub doesn't have official API for wiki, but we can use git directly

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "Initializing git repository..."
git init
git config user.name "Claude Code"
git config user.email "noreply@anthropic.com"

# Add remote (this will work once we create the first page)
git remote add origin "https://anubissbe:${TOKEN}@github.com/anubissbe/task-management-webui.wiki.git"

# Copy the Home.md content
cp "/opt/projects/projects/task-management-webui/wiki/Home.md" "./Home.md"

# Add and commit
git add .
git commit -m "Initial wiki page - Home

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Try to push
echo "Pushing initial wiki page..."
if git push -u origin master; then
    echo "Initial wiki page created successfully!"
    
    # Now copy all other wiki files
    echo "Adding remaining wiki pages..."
    cp /opt/projects/projects/task-management-webui/wiki/*.md .
    
    # Remove the duplicate Home.md from the copy
    git add .
    git commit -m "Add comprehensive wiki documentation

This commit adds the complete wiki documentation for the Task Management WebUI project:

- Installation Guide: Complete installation instructions
- User Interface Overview: Comprehensive UI guide
- API Documentation: Full REST API reference
- Architecture Overview: Technical architecture documentation
- Task Management: Complete task management workflows
- Project Management: Project management strategies
- Analytics Dashboard: Analytics features guide
- Development Setup: Development environment setup
- Production Deployment: Production deployment guide
- FAQ: Frequently asked questions
- Troubleshooting: Comprehensive troubleshooting guide

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    git push origin master
    echo "All wiki pages uploaded successfully!"
else
    echo "Failed to create initial wiki page."
    echo "You may need to create the first wiki page manually through the GitHub web interface."
    echo "Visit: https://github.com/anubissbe/task-management-webui/wiki"
fi

# Clean up
cd /opt/projects/projects/task-management-webui
rm -rf "$TEMP_DIR"