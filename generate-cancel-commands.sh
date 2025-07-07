#!/bin/bash

# Script to generate cancel commands for all queued workflows
# This generates commands you can run manually

REPO="anubissbe/ProjectHub-Mcp"

echo "=== Cancel Commands for All Queued Workflows ==="
echo ""
echo "# First, export your GitHub token:"
echo "export GITHUB_TOKEN='your-token-here'"
echo ""
echo "# Then run these commands to cancel each queued workflow:"
echo ""

# Get all queued workflow runs
curl -s "https://api.github.com/repos/$REPO/actions/runs?status=queued&per_page=100" | \
    jq -r '.workflow_runs[] | "curl -X POST -H \"Authorization: token $GITHUB_TOKEN\" https://api.github.com/repos/anubissbe/ProjectHub-Mcp/actions/runs/\(.id)/cancel"'

echo ""
echo "# Or cancel all at once with this loop:"
echo 'for id in $(curl -s "https://api.github.com/repos/anubissbe/ProjectHub-Mcp/actions/runs?status=queued&per_page=100" | jq -r ".workflow_runs[].id"); do'
echo '  echo "Cancelling workflow $id..."'
echo '  curl -X POST -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/anubissbe/ProjectHub-Mcp/actions/runs/$id/cancel"'
echo 'done'