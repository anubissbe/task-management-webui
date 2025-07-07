#!/bin/bash

echo "=== GitHub Actions Diagnostic Report ==="
echo "Repository: anubissbe/ProjectHub-Mcp"
echo "Date: $(date)"
echo ""

echo "=== Recent Workflow Runs ==="
curl -s https://api.github.com/repos/anubissbe/ProjectHub-Mcp/actions/runs\?per_page\=5 | \
  jq -r '.workflow_runs[] | "\(.name): \(.status) (\(.created_at))"'

echo ""
echo "=== Workflow Files ==="
find .github/workflows -name "*.yml" -exec echo "File: {}" \; -exec head -10 {} \; -exec echo "" \;

echo ""
echo "=== Repository Info ==="
curl -s https://api.github.com/repos/anubissbe/ProjectHub-Mcp | \
  jq '{name: .name, default_branch: .default_branch, private: .private, archived: .archived, disabled: .disabled, owner_type: .owner.type}'

echo ""
echo "=== GitHub Service Status ==="
curl -s https://www.githubstatus.com/api/v2/status.json | jq '{status: .status.description}'

echo ""
echo "=== Diagnostic Summary ==="
echo "- All workflows stuck in 'queued' status for extended periods"
echo "- Issue persists across different workflow complexities"
echo "- Problem likely at repository or account level"
echo ""
echo "=== Recommended Actions ==="
echo "1. Check repository Settings > Actions > General"
echo "2. Verify 'Allow all actions and reusable workflows' is enabled"
echo "3. Check billing/usage limits if on paid plan"
echo "4. Try manual workflow trigger from GitHub web interface"
echo "5. Contact GitHub Support if issue persists"