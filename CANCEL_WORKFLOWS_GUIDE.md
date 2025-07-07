# How to Cancel All Queued GitHub Actions Workflows

## Option 1: Via GitHub Web Interface (Easiest)

1. Go to: https://github.com/anubissbe/ProjectHub-Mcp/actions
2. Click on each queued workflow run
3. Click the "Cancel workflow" button (⏹️) in the top right
4. Repeat for all queued workflows

## Option 2: Using GitHub CLI (If Installed)

```bash
# List all queued runs
gh run list --repo anubissbe/ProjectHub-Mcp --status queued

# Cancel all queued runs
gh run list --repo anubissbe/ProjectHub-Mcp --status queued --json databaseId -q '.[].databaseId' | \
  xargs -I {} gh run cancel {} --repo anubissbe/ProjectHub-Mcp
```

## Option 3: Using the Provided Script

1. Create a GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens/new
   - Give it a name (e.g., "Cancel Workflows")
   - Select scope: `repo` (Full control of private repositories)
   - Click "Generate token"
   - Copy the token

2. Run the cancel script:
   ```bash
   ./cancel-all-workflows.sh YOUR_GITHUB_TOKEN
   ```

## Option 4: Manual API Commands

1. Set your token:
   ```bash
   export GITHUB_TOKEN='your-token-here'
   ```

2. Cancel all queued workflows:
   ```bash
   for id in $(curl -s "https://api.github.com/repos/anubissbe/ProjectHub-Mcp/actions/runs?status=queued&per_page=100" | jq -r ".workflow_runs[].id"); do
     echo "Cancelling workflow $id..."
     curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
       "https://api.github.com/repos/anubissbe/ProjectHub-Mcp/actions/runs/$id/cancel"
   done
   ```

## After Cancelling

1. Wait a few minutes for all cancellations to process
2. Verify all workflows are cancelled:
   ```bash
   curl -s "https://api.github.com/repos/anubissbe/ProjectHub-Mcp/actions/runs?status=queued" | \
     jq '.total_count'
   ```
   Should return `0`

3. Consider disabling GitHub Actions temporarily:
   - Go to: https://github.com/anubissbe/ProjectHub-Mcp/settings/actions
   - Select "Disable Actions for this repository"
   - Re-enable when ready to test again

## Root Cause Investigation

With 43+ workflows queued for hours, consider:
1. Contact GitHub Support with this information
2. Check if other repositories have the same issue
3. Try creating a new test repository to isolate the problem