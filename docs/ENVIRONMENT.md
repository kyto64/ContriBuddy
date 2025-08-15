# Environment Variables Guide

## Backend (.env)

| Name | Example | Description |
|---|---|---|
| PORT | 3001 | Dev port (3000 in production) |
| NODE_ENV | development | Environment name |
| ALLOWED_ORIGINS | http://localhost:3000 | CORS allowlist (comma separated) |
| JWT_SECRET | change-me | JWT signing secret |
| SERVICE_URL | http://localhost:3000 | Frontend origin used for GitHub OAuth redirect |
| GH_CLIENT_ID | - | GitHub OAuth App Client ID |
| GH_CLIENT_SECRET | - | GitHub OAuth App Client Secret |
| GITHUB_TOKEN | - | Optional GitHub PAT to raise search API rate limits |

## Frontend (.env)

| Name | Example | Description |
|---|---|---|
| VITE_API_BASE_URL | http://localhost:3001 | Base URL of the backend API |

## Notes

- `frontend/vite.config.ts` proxies `/api` to `http://localhost:3001` during development.
- In production the frontend runs on Nginx and the backend on Node/Express.
- OAuth scopes: `user:email`, `read:user`, `public_repo`. Personalized recommendations leverage the OAuth access token kept in memory (non-persistent) to call GitHub on behalf of the user.
