# <img src="https://github.com/user-attachments/assets/b3caa1c3-3552-412f-8b1d-e57fac23701a" alt="logo" width="60" height="60" style="vertical-align: text-bottom;">Kontri

Kontri helps you discover open‑source projects and contribution opportunities that match your skills and interests. It leverages the GitHub API to surface beginner‑friendly issues and recommend repositories tailored to you.

## 🫵 Visit [Kontri](https://kontri.kyto64.com) to explore open-source projects and start contributing today!

<kbd><img src="https://github.com/user-attachments/assets/713d625b-874d-4e52-ae12-4b4fd4c3750c" /></kbd>

## ✨ Features

- Personalized recommendations by languages, frameworks, interests, and experience level
- Beginner‑friendly issue discovery (good first issues, etc.)
- Live data from GitHub for repository search and stats
- Analyze starred and followed repositories
- Exclude repositories you've already contributed to (approximation)
- Basic collaborative filtering using your stars and followed users
- Modern UI with Vue 3 + Vite + Tailwind, state managed by Pinia

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (v20+ recommended)
- npm
- GitHub OAuth App (Client ID/Secret)

### Setup

1) Clone and install
```bash
git clone https://github.com/kyto64/Kontri.git
cd Kontri
npm install
```

2) Create env files from examples
```bash
# Backend
cp backend/.env.development.example backend/.env.development

# Frontend
cp frontend/.env.development.example frontend/.env.development
```

3) Configure environment variables
- Backend (`backend/.env.development`)
  - `JWT_SECRET` (any secure string)
  - `GH_CLIENT_ID` / `GH_CLIENT_SECRET` (GitHub OAuth App)
  - `SERVICE_URL` (your frontend origin, e.g. http://localhost:3000)
  - `ALLOWED_ORIGINS` (CORS allowlist, e.g. http://localhost:3000)
  - `PORT` (3001 recommended for local dev)
  - `GITHUB_TOKEN` (optional; PAT to raise search rate limits)
- Frontend (`frontend/.env.development`)
  - `VITE_API_BASE_URL` (e.g. http://localhost:3001)

4) Start development servers
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001 (dev)

Notes:
- Dev server proxies `/api` to `http://localhost:3001` (see `frontend/vite.config.ts`).
- In production containers the backend listens on `PORT=3000` to match Fly.io `internal_port=3000`.

## 🔐 Auth Flow (GitHub OAuth)

1. Frontend requests `GET /api/auth/github/url` and redirects user to GitHub
2. GitHub redirects back to `SERVICE_URL/auth/github/callback` with `code`
3. Frontend posts `code` to `POST /api/auth/github/callback`
4. Backend exchanges access token, fetches user info, and returns a JWT
5. Frontend stores JWT in `localStorage` and includes it on subsequent API calls

Scopes:
- `user:email`, `read:user`, `public_repo`

## 🧩 API Overview

Base path: `/api`

- Auth
  - `GET  /auth/github/url`
  - `POST /auth/github/callback` (body: `{ code }`)
  - `GET  /auth/me` (JWT required)
  - `POST /auth/logout` (JWT required)

- GitHub search
  - `GET /github/repositories/search?language&minStars&maxStars&hasGoodFirstIssues&topics`
  - `GET /github/repositories/:owner/:repo`
  - `GET /github/repositories/:owner/:repo/issues?labels`
  - `GET /github/repositories/:owner/:repo/good-first-issues`

- Recommendations
  - `POST /recommendations/generate` (send `skills` and optional `filters`)
  - `GET  /recommendations/trending/:language?limit`
  - `GET  /recommendations/health`
  - `POST /recommendations/generate/personalized` (JWT required)


- Skill analysis (JWT required)
  - `POST   /skills/analyze`
  - `GET    /skills/my-analysis`
  - `DELETE /skills/my-analysis`
  - `GET    /skills/status`

- Contribution history (JWT required)
  - `GET /contribution-history` (current user)
  - `GET /contribution-history/:username` (public info)
  - `GET /contribution-history/stats/summary`

- Health check
  - `GET /health`

See `docs/API.md` for details and `docs/OPENAPI.json` for the OpenAPI sketch.

## 🛠️ Tech Stack

- Frontend: Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, Vue Router
- Backend: Node.js, Express, TypeScript, Zod, GitHub API

## 📁 Project Structure

```
Kontri/
├── frontend/                 # Vue 3 + Vite
│   └── src/{components,views,stores,services,types,...}
├── backend/                  # Express + TypeScript API
│   └── src/{routes,services,types,middleware}
├── docs/                     # Documentation (API/environment/etc.)
├── package.json              # Workspaces (frontend, backend)
└── README.md
```

## 🔧 Dev Commands

```bash
# install deps
npm install

# dev (frontend + backend)
npm run dev

# one side only
npm run dev:frontend
npm run dev:backend

# build (frontend -> backend)
npm run build

# type check
npm run type-check
```

## 🚢 Deployment

Fly.io deployment ready (frontend app: `kontri`, backend app: `kontri-api`).
Backend listens on `PORT=3000` in production. See `DEPLOYMENT.md` for secrets and config.

## 🤝 Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

MIT License — see [LICENSE](LICENSE).

## 🛡️ Security

Found a vulnerability? See [SECURITY.md](SECURITY.md) for responsible disclosure.

## 🐛 Issues

Bug reports and feature requests: https://github.com/kyto64/Kontri/issues

---

Made with ❤️ for the OSS community
