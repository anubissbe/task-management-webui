# 🔐 GitHub Secrets Setup Guide

This guide explains how to set up the required GitHub secrets for the CI/CD pipeline.

## Required Secrets

### 1. **DOCKER_HUB_TOKEN** (Required)
Docker Hub access token for pushing images.

**How to create:**
1. Go to [Docker Hub Security Settings](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. Give it a descriptive name (e.g., "projecthub-mcp-ci")
4. Copy the token and add it as a GitHub secret

### 2. **CODECOV_TOKEN** (Optional)
Token for uploading code coverage reports to Codecov.

**How to create:**
1. Go to [Codecov](https://codecov.io/)
2. Add your repository
3. Copy the upload token
4. Add it as a GitHub secret

### 3. **SONAR_TOKEN** (Optional)
Token for SonarCloud code quality analysis.

**How to create:**
1. Go to [SonarCloud](https://sonarcloud.io/)
2. Create a new project
3. Generate a token in Security settings
4. Add it as a GitHub secret

## How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the name and value
5. Click **Add secret**

## Repository Variables

You can also set these as repository variables instead of secrets (if they're not sensitive):

### **DOCKER_HUB_USERNAME**
Your Docker Hub username (default: "anubissbe")

**How to set:**
1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Click **New repository variable**
3. Name: `DOCKER_HUB_USERNAME`
4. Value: Your Docker Hub username

## Testing the Setup

After setting up the secrets, you can test them by:

1. Creating a new tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Or manually triggering the workflow:
   - Go to **Actions** → **🚀 Main CI/CD Pipeline**
   - Click **Run workflow**
   - Select the branch and release type

## Troubleshooting

### Docker Hub Login Failed
- Ensure the token has push permissions
- Check that the username is correct
- Verify the token hasn't expired

### Codecov Upload Failed
- Make sure the repository is added to Codecov
- Check that the token is valid
- Ensure the repository is public or you have a paid plan

### Build Failed
- Check the workflow logs in the Actions tab
- Ensure all required secrets are set
- Verify branch protection rules aren't blocking the workflow