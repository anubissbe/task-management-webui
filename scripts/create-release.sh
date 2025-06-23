#!/bin/bash
# Script to create a new release

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    print_color $RED "❌ Working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_color $GREEN "📦 Current version: v${CURRENT_VERSION}"

# Ask for release type
echo ""
print_color $YELLOW "What type of release is this?"
echo "1) Patch (bug fixes)"
echo "2) Minor (new features)"
echo "3) Major (breaking changes)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        RELEASE_TYPE="patch"
        ;;
    2)
        RELEASE_TYPE="minor"
        ;;
    3)
        RELEASE_TYPE="major"
        ;;
    *)
        print_color $RED "❌ Invalid choice"
        exit 1
        ;;
esac

# Calculate new version
NEW_VERSION=$(npx semver $CURRENT_VERSION -i $RELEASE_TYPE)
print_color $GREEN "🚀 New version will be: v${NEW_VERSION}"

# Confirm
echo ""
read -p "Do you want to create release v${NEW_VERSION}? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_color $YELLOW "Release cancelled"
    exit 0
fi

# Update package.json versions
print_color $GREEN "📝 Updating package.json files..."
cd frontend && npm version $NEW_VERSION --no-git-tag-version && cd ..
cd backend && npm version $NEW_VERSION --no-git-tag-version && cd ..

# Update root package.json if it exists
if [ -f "package.json" ]; then
    npm version $NEW_VERSION --no-git-tag-version
fi

# Commit version changes
print_color $GREEN "💾 Committing version changes..."
git add -A
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create and push tag
print_color $GREEN "🏷️  Creating tag v${NEW_VERSION}..."
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

# Push changes
print_color $GREEN "📤 Pushing to GitHub..."
git push origin main
git push origin "v${NEW_VERSION}"

print_color $GREEN "✅ Release v${NEW_VERSION} created successfully!"
print_color $YELLOW "The CI/CD pipeline will now build and publish the Docker images."
echo ""
print_color $GREEN "📦 Docker images will be available at:"
echo "  - ghcr.io/anubissbe/projecthub-mcp-frontend:${NEW_VERSION}"
echo "  - ghcr.io/anubissbe/projecthub-mcp-backend:${NEW_VERSION}"
echo "  - anubissbe/projecthub-mcp-frontend:${NEW_VERSION}"
echo "  - anubissbe/projecthub-mcp-backend:${NEW_VERSION}"