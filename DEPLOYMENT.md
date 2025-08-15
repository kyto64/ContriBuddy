# ContriBuddy Deployment Setup Guide

This document reflects the current Fly.io setup (frontend app: `contribuddy`, backend app: `contribuddy-api`).

## Required Environment Variables (Production)

Backend (`contribuddy-api`):
- `JWT_SECRET`
- `GH_CLIENT_ID`
- `GH_CLIENT_SECRET`
- `SERVICE_URL` (e.g., `https://contribuddy.fly.dev`)
- `ALLOWED_ORIGINS` (e.g., `https://contribuddy.fly.dev`)
- `GITHUB_TOKEN` (optional)
- `PORT=3000` (match `backend/fly.toml` internal port)

Frontend (`contribuddy`):
- `VITE_API_BASE_URL` (e.g., `https://contribuddy-api.fly.dev`)

## GitHub Actions Secrets

Set up for automatic deployments:

- `FLY_API_TOKEN`: Fly.io API token

To get a token:
```bash
flyctl auth token
```

Add it in: Repository Settings > Secrets and variables > Actions > New repository secret

## Environments

Create a `production` environment and add protection rules if needed.

## Manual Deployment

```bash
# backend
cd backend
flyctl deploy

# frontend
cd ../frontend
flyctl deploy
```

## Runtime/Ports

- Backend: `internal_port = 3000` (`backend/fly.toml`) → container listens on `PORT=3000`
- Frontend: `internal_port = 80` (`frontend/fly.toml`)

## Troubleshooting

- Authentication errors: verify token via `flyctl auth whoami`, re‑set `FLY_API_TOKEN`
- Build failures: check GitHub Actions logs and dependency versions
- Health check failures: probe backend `/health` (`https://<backend-app>.fly.dev/health`)
- Logs:
  ```bash
  flyctl logs -a contribuddy-api
  flyctl logs -a contribuddy
  ```
