# Repository Setup Guide

This guide provides step-by-step instructions for configuring GitHub repository settings to match the enterprise-grade standards of ProjectHub-Mcp.

## Current Repository Status

✅ **Already Configured:**
- Repository description and topics (analytics, collaboration, dashboard, docker, kanban, mcp, postgresql, project-management, react, task-management, typescript, websocket)
- Main branch: `main`
- Issues: Enabled
- Projects: Enabled
- Wiki: Enabled
- Release tags: v4.5.1, v4.5.0, v4.0.1, v4.0.0, v1.0.0

❌ **Needs Manual Configuration:**
- Branch protection rules
- Tag protection rules
- Repository security settings

## 🔒 Branch Protection Rules

### Step 1: Navigate to Branch Protection
1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/settings/branches
2. Click "Add rule" or "Add classic protection rule"

### Step 2: Configure Main Branch Protection

**Branch name pattern:** `main`

**Required Settings:**
- ✅ **Require a pull request before merging**
  - ✅ Required number of approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from CODEOWNERS (if CODEOWNERS file exists)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks:** (Select these when they appear after first workflow run)
    - `🎨 Frontend (React + TypeScript)`
    - `🔧 Backend (Node.js + Express)`
    - `📊 Code Quality & Security`
    - `🧪 E2E Tests`

- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits** (Optional but recommended)
- ✅ **Require linear history**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Include administrators**

## 🏷️ Tag Protection Rules

### Step 1: Navigate to Tag Protection
1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/settings/tag_protection
2. Click "New rule"

### Step 2: Configure Tag Protection
**Tag name pattern:** `v*`

**Settings:**
- ✅ **Restrict who can push tags matching this pattern**
- **Allowed actors:** Repository administrators only

This prevents accidental deletion or modification of release tags.

## 🛡️ Security Settings

### Step 1: Navigate to Security Settings
1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/settings/security_analysis

### Step 2: Enable Security Features
- ✅ **Dependency graph**
- ✅ **Dependabot alerts**
- ✅ **Dependabot security updates**
- ✅ **Code scanning alerts**
- ✅ **Secret scanning alerts** (if available)

### Step 3: Configure Dependabot
1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/settings/security_analysis
2. Enable Dependabot version updates
3. The workflow includes automated dependency updates

## 📋 Repository Settings

### General Settings
1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/settings

**Recommended configurations:**
- ✅ **Issues:** Enabled
- ✅ **Projects:** Enabled  
- ✅ **Wiki:** Enabled
- ✅ **Discussions:** Enable for community engagement
- ✅ **Delete head branches:** Automatically delete head branches

### Merge Options
- ✅ **Allow merge commits**
- ✅ **Allow squash merging** (Default)
- ❌ **Allow rebase merging** (Disable for cleaner history)

### Pull Requests
- ✅ **Always suggest updating pull request branches**
- ✅ **Automatically delete head branches**

## 🔑 Repository Secrets

### Required Secrets
Navigate to: https://github.com/anubissbe/ProjectHub-Mcp/settings/secrets/actions

Add these secrets for the GitHub Actions workflow:

1. **CODECOV_TOKEN** - For code coverage reporting
2. **DOCKERHUB_USERNAME** - Docker Hub username
3. **DOCKERHUB_TOKEN** - Docker Hub access token

### Optional Secrets
- **SLACK_WEBHOOK** - For build notifications
- **TEAMS_WEBHOOK** - For Microsoft Teams notifications

## 🎯 Verification Checklist

After completing the setup:

### Branch Protection Verification
```bash
# Test that direct pushes to main are blocked
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test direct push"
git push origin main
# Should be rejected
```

### Workflow Verification
```bash
# Create a test PR to verify status checks
git checkout -b test-branch
echo "test change" >> README.md
git add README.md
git commit -m "test: verify workflow checks"
git push origin test-branch
# Create PR via GitHub UI and verify all checks run
```

### Tag Protection Verification
```bash
# Test that unauthorized users cannot delete tags
git tag -d v4.5.1
git push origin :refs/tags/v4.5.1
# Should be rejected for non-admin users
```

## 🚨 Emergency Procedures

### Temporary Branch Protection Bypass
In emergency situations:
1. Go to Settings > Branches
2. Click edit on the main branch rule
3. Temporarily uncheck "Include administrators"
4. Make necessary emergency changes
5. **Immediately re-enable** "Include administrators"
6. Document the bypass reason in an issue

### Hotfix Process
1. Create hotfix branch from main: `git checkout -b hotfix/critical-fix`
2. Make minimal necessary changes
3. Create PR with "hotfix" label
4. Request expedited review
5. Merge with all checks (bypass only if critical)

## 📞 Support

For questions about repository configuration:
- **GitHub Docs:** https://docs.github.com/en/repositories
- **Branch Protection:** https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository
- **Security Settings:** https://docs.github.com/en/code-security

---

**Last Updated:** June 23, 2025  
**Next Review:** December 23, 2025

> **Note:** All settings should be configured by a repository administrator. Some features may require GitHub Pro or GitHub Team plans.