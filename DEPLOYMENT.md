# ContriBuddy Deployment Setup Guide

## GitHub Actions Secrets Configuration

For automatic deployment to work, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **FLY_API_TOKEN**
   - Description: Your Fly.io API token for deployment
   - How to get:
     ```bash
     flyctl auth token
     ```
   - Where to add: Repository Settings > Secrets and variables > Actions > New repository secret

### Setting up Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add the following:

   | Name | Value | Description |
   |------|-------|-------------|
   | `FLY_API_TOKEN` | Your Fly.io token | Used for deploying to Fly.io |

### Environment Setup

Create a production environment in your repository:

1. Go to **Settings** > **Environments**
2. Click **New environment**
3. Name it `production`
4. Add protection rules if needed (e.g., required reviewers)

## Manual Deployment

If you need to deploy manually:

```bash
# Deploy backend
cd backend
flyctl deploy

# Deploy frontend
cd frontend
flyctl deploy
```

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication error**
   - Check that `FRONTEND/BACKEND_FLY_API_TOKEN` is correctly set in GitHub secrets
   - Verify the token is valid: `flyctl auth whoami`

2. **Build fails**
   - Check the build logs in GitHub Actions
   - Ensure all dependencies are correctly specified in package.json

3. **Health check fails**
   - Verify the backend is running on the correct port (3000)
   - Check Fly.io logs: `flyctl logs -a contribuddy-api`

### Useful Commands

```bash
# Check deployment status
flyctl status -a contribuddy-api
flyctl status -a contribuddy

# View logs
flyctl logs -a contribuddy-api
flyctl logs -a contribuddy

# Scale machines
flyctl scale count 1 -a contribuddy-api
flyctl scale count 1 -a contribuddy
```
