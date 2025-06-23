# Branch Protection Rules

This document outlines the recommended branch protection rules for the ProjectHub-Mcp repository.

## Main Branch Protection

To set up branch protection for the `main` branch, navigate to:
`Settings > Branches > Add rule`

### Recommended Settings

1. **Branch name pattern**: `main`

2. **Protect matching branches**:
   - ✅ Require a pull request before merging
     - ✅ Require approvals: 1
     - ✅ Dismiss stale pull request approvals when new commits are pushed
     - ✅ Require review from CODEOWNERS
   
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Required status checks:
       - `🎨 Frontend (React + TypeScript)`
       - `🔧 Backend (Node.js + Express)`
       - `📊 Code Quality & Security`
       - `🧪 E2E Tests`
   
   - ✅ Require conversation resolution before merging
   
   - ✅ Require signed commits (optional)
   
   - ✅ Require linear history
   
   - ✅ Include administrators
   
   - ✅ Restrict who can push to matching branches
     - Add specific users or teams who can push

3. **Rules applied to everyone including administrators**: Enable for maximum security

## Development Branch Protection

For the `develop` branch (if used):

1. **Branch name pattern**: `develop`
2. **Protect matching branches**:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ❌ Do not include administrators (for easier hotfixes)

## Tag Protection Rules

To set up tag protection, navigate to:
`Settings > Tags > Add rule`

### Recommended Tag Rules

1. **Rule name**: `Protect Release Tags`
   **Tag name pattern**: `v*`
   **Allowed actors**: Repository administrators only

This prevents accidental deletion or modification of release tags.

## Enforcement

These rules ensure:
- No direct pushes to main branch
- All changes go through pull request review
- All tests must pass before merging
- Code quality standards are maintained
- Release tags are protected from accidental changes

## Automation

The repository includes GitHub Actions that automatically:
- Run tests on all pull requests
- Perform security scanning
- Check code quality
- Build Docker images
- Create releases when tags are pushed

## Bypass Instructions

In emergency situations, administrators can temporarily disable branch protection:
1. Go to Settings > Branches
2. Click on the rule for `main`
3. Uncheck "Include administrators"
4. Make necessary changes
5. Re-enable "Include administrators"

⚠️ **Use bypass only in emergencies and document the reason**