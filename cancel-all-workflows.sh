#!/bin/bash

# Script to cancel all queued GitHub Actions workflows
# Usage: ./cancel-all-workflows.sh <github-token>

if [ -z "$1" ]; then
    echo "Usage: ./cancel-all-workflows.sh <github-token>"
    echo "You can create a token at: https://github.com/settings/tokens"
    echo "Token needs 'repo' scope"
    exit 1
fi

TOKEN=$1
REPO="anubissbe/ProjectHub-Mcp"

echo "=== Cancelling All Queued Workflows for $REPO ==="
echo ""

# Get all queued workflow runs
QUEUED_RUNS=$(curl -s -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/$REPO/actions/runs?status=queued&per_page=100" | \
    jq -r '.workflow_runs[].id')

if [ -z "$QUEUED_RUNS" ]; then
    echo "No queued workflows found."
    exit 0
fi

# Count total queued
TOTAL=$(echo "$QUEUED_RUNS" | wc -l)
echo "Found $TOTAL queued workflow(s) to cancel"
echo ""

# Cancel each workflow
COUNT=0
for RUN_ID in $QUEUED_RUNS; do
    COUNT=$((COUNT + 1))
    echo -n "[$COUNT/$TOTAL] Cancelling workflow $RUN_ID... "
    
    RESPONSE=$(curl -s -X POST -H "Authorization: token $TOKEN" \
        "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/cancel" \
        -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "202" ]; then
        echo "✓ Success"
    else
        echo "✗ Failed (HTTP $HTTP_CODE)"
        echo "$RESPONSE" | head -n-1 | jq -r '.message // "Unknown error"' 2>/dev/null
    fi
done

echo ""
echo "=== Summary ==="
echo "Attempted to cancel $TOTAL workflow(s)"
echo ""

# Show current status
echo "=== Current Workflow Status ==="
curl -s -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/$REPO/actions/runs?per_page=10" | \
    jq -r '.workflow_runs[] | "\(.name): \(.status) (\(.created_at))"' | head -10