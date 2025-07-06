#!/bin/bash

# Test script for gitleaks configuration
# This script demonstrates how to test the .gitleaks.toml configuration locally

echo "🔍 Testing Gitleaks Configuration for ProjectHub"
echo "================================================"

# Check if gitleaks is installed
if ! command -v gitleaks &> /dev/null; then
    echo "❌ Gitleaks is not installed."
    echo ""
    echo "To install gitleaks:"
    echo "  - macOS: brew install gitleaks"
    echo "  - Linux: Download from https://github.com/gitleaks/gitleaks/releases"
    echo "  - Docker: docker pull zricethezav/gitleaks"
    echo ""
    echo "Or run with Docker:"
    echo "  docker run -v \$(pwd):/repo zricethezav/gitleaks:latest detect --source /repo --config /repo/.gitleaks.toml"
    exit 1
fi

# Run gitleaks with our configuration
echo "✅ Running gitleaks with .gitleaks.toml configuration..."
echo ""

gitleaks detect --config .gitleaks.toml --verbose

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! No leaks detected with the current configuration."
    echo ""
    echo "The following test/demo credentials are properly whitelisted:"
    echo "  - admin@projecthub.com / admin123 (documentation)"
    echo "  - projecthub123 (test database password)"
    echo "  - E2E test user credentials"
    echo "  - Git config email in build scripts"
else
    echo ""
    echo "❌ Gitleaks found potential leaks not covered by .gitleaks.toml"
    echo "   Please review the output above and update the configuration if needed."
fi

echo ""
echo "📝 To run gitleaks without our configuration (see all findings):"
echo "   gitleaks detect --verbose"