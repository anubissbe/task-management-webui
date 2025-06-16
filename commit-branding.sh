#!/bin/bash

# Navigate to ProjectHub-Mcp directory
cd /opt/projects/projects/ProjectHub-Mcp

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    
    # Configure git user
    git config user.name "anubissbe"
    git config user.email "bert@telkom.be"
    
    # Add GitHub remote
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/anubissbe/ProjectHub-Mcp.git
else
    echo "Git repository already exists"
fi

# Add all files for initial commit
echo "Adding all files..."
git add .

# Create commit with branding changes
echo "Creating commit..."
git commit -m "$(cat <<'EOF'
🎨 Add ProjectHub-MCP black/orange branding

Major branding updates:
- Implement black/orange color scheme throughout the UI
- Add ProjectHub-MCP logo and branding to header
- Update navigation with branded styling and hover effects
- Apply gradient effects and custom component styles
- Enhance dark mode support with orange accents
- Add branded loading spinners and badges
- Update footer with GitHub repository link

Technical changes:
- Update frontend/src/index.css with custom CSS variables and component classes
- Update frontend/src/components/Layout.tsx with new branding elements
- Add BRANDING_SUMMARY.md documentation
- Include build scripts for Docker container deployment

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Show status
echo "Git status after commit:"
git status

# Check remote configuration
echo -e "\nRemote configuration:"
git remote -v

echo -e "\nCommit created successfully!"
echo "To push to GitHub, run: git push -u origin main"
echo "This will trigger the GitHub Actions workflow to build and publish the container."