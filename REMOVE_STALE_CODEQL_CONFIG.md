# 🧹 Remove Stale CodeQL Configuration

## Issue
There's a stale CodeQL configuration referencing a non-existent workflow:
- **Configuration**: `.github/workflows/main.yml:quality-checks`
- **Status**: Workflow file no longer exists
- **Last scan**: 1 hour ago

## Solution: Remove via GitHub UI

### Steps to Remove:
1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/settings/security_analysis
2. Find the **Code scanning** section
3. Look for configurations referencing `.github/workflows/main.yml`
4. Click the **⋮** (three dots) menu on the right
5. Select **Delete configuration**

### Alternative Method:
1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/security/code-scanning
2. Click on **Configuration** dropdown
3. Find `.github/workflows/main.yml:quality-checks`
4. Click the menu and select **Delete**

## Current Active Configurations
✅ **Working configurations**:
- `.github/workflows/ci-cd.yml:security-scan` (Active)
- `docker-scan` via Trivy (Active)

## Background
This stale configuration is from an old workflow that was likely:
- Part of the original React setup
- Removed during the Alpine.js migration
- Still referenced in GitHub's code scanning database

## No Security Impact
- This is just a configuration issue
- All security scanning is working correctly
- The new `ci-cd.yml` workflow handles all security scans

Once removed through the GitHub UI, you'll only see the active security scanning from the current workflow.