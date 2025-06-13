# 🤖 PR Automation System

This repository uses a comprehensive PR automation system to handle all pull requests automatically. Here's how it works:

## 🚀 Overview

The automation system handles:
- ✅ Automatic PR reviews for safe changes
- ✅ Auto-merge when conditions are met
- ✅ PR labeling and triage
- ✅ Conflict detection and resolution guidance
- ✅ Command-based PR management
- ✅ Dependency updates via Dependabot

## 📋 How PRs are Handled

### 1. When a PR is Opened

**Automatic Actions:**
- 🏷️ Labels applied based on:
  - File changes (frontend, backend, docs, etc.)
  - PR size (tiny, small, medium, large, extra-large)
  - Priority (critical, high, medium, low)
- 👤 Auto-assigned to @anubissbe
- 💬 Welcome message with checklist
- 🔍 Conflict detection
- 📊 PR statistics comment

### 2. Automatic Review Conditions

PRs are **automatically approved** if they meet ALL of these conditions:

#### ✅ Dependency Updates
- From Dependabot or Renovate bot
- Automatically approved and merged

#### ✅ Documentation-Only Changes
- Only `.md` files or `docs/` directory
- Less than 10 files changed
- Automatically approved

#### ✅ Small Safe Changes
- Less than 50 lines changed
- Less than 5 files changed
- Only config files (json, yml, yaml, txt, gitignore)
- Automatically approved

### 3. Auto-Merge Conditions

PRs are **automatically merged** when:
- ✅ Has `auto-merge` label OR
- ✅ Is from Dependabot OR
- ✅ Is from repository owner
- ✅ All CI checks pass
- ✅ Has required approvals (1)
- ✅ No merge conflicts
- ✅ Conversations resolved

**Merge Methods:**
- **Squash merge**: For PRs with <10 commits or <20 files
- **Merge commit**: For larger PRs to preserve history

### 4. PR Commands

Use these commands in PR comments:

| Command | Description | Who Can Use |
|---------|-------------|-------------|
| `/merge` or `/lgtm` | Approve and auto-merge | Collaborators |
| `/approve` | Approve the PR | Collaborators |
| `/close` | Close the PR | Collaborators |
| `/reopen` | Reopen the PR | Collaborators |
| `/ready` | Mark as ready for review | Collaborators |
| `/wip` | Mark as work in progress | Collaborators |
| `/help` | Show command help | Anyone |

### 5. Automated Labels

**Size Labels:**
- `size/tiny`: <10 lines
- `size/small`: 10-100 lines
- `size/medium`: 100-500 lines
- `size/large`: 500-1000 lines
- `size/extra-large`: >1000 lines

**Priority Labels:**
- `priority/critical`: Security or breaking changes
- `priority/high`: Important features or fixes
- `priority/medium`: Normal changes
- `priority/low`: Minor improvements

**Status Labels:**
- `auto-merge`: Will merge when ready
- `has-conflicts`: Needs conflict resolution
- `stale`: Inactive for 30+ days
- `work-in-progress`: Not ready for merge
- `ready-for-review`: Ready for review

## 🔄 Workflow Examples

### Example 1: Dependabot PR
1. Dependabot creates PR for dependency update
2. Auto-review approves it immediately
3. CI runs tests
4. Auto-merge merges when tests pass
5. Branch deleted automatically

### Example 2: Documentation Update
1. Contributor updates README.md
2. Auto-review sees it's docs-only
3. Approves automatically
4. Merges when CI passes

### Example 3: Feature PR
1. Contributor adds new feature
2. Labeled based on files changed
3. Size and priority labels added
4. Requires manual review
5. Use `/merge` to trigger auto-merge
6. Merges when all conditions met

### Example 4: Urgent Fix
1. Create PR with "security" in title
2. Gets `priority/critical` label
3. Assigned to milestone
4. Review and `/merge` to fast-track

## 🛡️ Safety Features

- **No Force Merges**: All PRs must pass checks
- **Conflict Detection**: Warns about conflicts
- **Failed Check Protection**: Won't merge if CI fails
- **Automatic Rollback**: Remove auto-merge label if issues found
- **Branch Protection**: Can't push directly to main

## 📊 PR Statistics

Each PR gets a statistics comment showing:
- Files changed
- Lines added/removed
- Total changes
- Review status

## 🔧 Configuration

### Disable Auto-Merge for a PR
Remove the `auto-merge` label

### Skip CI for a PR
Add `[skip ci]` to commit message

### Mark PR as Do Not Merge
Add `work-in-progress` label

## 🚨 Troubleshooting

### PR Not Merging?
Check for:
- ❌ Failed CI checks
- ❌ Merge conflicts
- ❌ Missing approvals
- ❌ Unresolved conversations

### Commands Not Working?
- Ensure you're a collaborator
- Check command syntax
- Try `/help` for command list

### Auto-Review Not Working?
Verify:
- PR meets auto-review criteria
- No syntax errors in PR
- Files are in allowed list

## 📈 Benefits

1. **Faster Merges**: No waiting for manual reviews on safe changes
2. **Consistent Process**: Same rules for everyone
3. **Reduced Maintenance**: Dependency updates handled automatically
4. **Better Organization**: Automatic labeling and triage
5. **24/7 Operation**: Works even when maintainers are away

## 🔒 Security

- Only collaborators can use merge commands
- Security PRs get priority treatment
- All changes still go through CI/CD
- Branch protection prevents direct pushes

---

**Questions?** Open an issue or use `/help` in any PR!