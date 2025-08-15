# ContriBuddy API Specification

Base URL: `http://<backend-host>:<port>/api`

Auth: JWT (`Authorization: Bearer <token>`). Obtain it via `/api/auth/github/callback`.

## Auth

- GET `/auth/github/url`
  - Returns the GitHub OAuth authorization URL
  - Response: `{ url: string, clientId: string }`

- POST `/auth/github/callback`
  - Body: `{ code: string }`
  - Success: `{ success: true, token: string, user: AuthUser }`

- GET `/auth/me` (JWT required)
  - Success: `{ user: AuthUser }`

- POST `/auth/logout` (JWT required)
  - Success: `{ success: true }`

## GitHub Search

- GET `/github/repositories/search`
  - Query: `language?`, `minStars?`, `maxStars?`, `hasGoodFirstIssues?`, `topics?` (comma separated)
  - Success: `{ success: true, data: { repositories: GitHubRepo[], count: number } }`

- GET `/github/repositories/:owner/:repo`
  - Success: `{ success: true, data: GitHubRepo }`

- GET `/github/repositories/:owner/:repo/issues`
  - Query: `labels?` (comma separated)
  - Success: `{ success: true, data: { issues: GitHubIssue[], count: number } }`

- GET `/github/repositories/:owner/:repo/good-first-issues`
  - Success: `{ success: true, data: { issues: GitHubIssue[], count: number } }`

## Recommendations

- POST `/recommendations/generate`
  - Body:
    ```json
    {
      "skills": {
        "languages": ["typescript"],
        "frameworks": ["vue"],
        "interests": ["web", "frontend"],
        "experienceLevel": "beginner|intermediate|advanced"
      },
      "filters": {
        "language": "typescript",
        "minStars": 10,
        "maxStars": 5000,
        "hasGoodFirstIssues": true,
        "topics": ["oss"]
      }
    }
    ```
  - Success: `{ success: true, data: { recommendations: ProjectRecommendation[], totalCount: number, processingTime: number }, message: string }`

- GET `/recommendations/trending/:language?limit=10`
  - Success: `{ success: true, data: { language: string, repositories: GitHubRepo[], count: number } }`

- GET `/recommendations/health`
  - Success: `{ status: 'ok', service: 'recommendations', timestamp: string }`

## Skill Analysis (JWT required)

- POST `/skills/analyze`
  - Success: `{ success: true, data: SkillAnalysisResult }`

- GET `/skills/my-analysis`
  - Success: `{ success: true, data: SkillAnalysisResult | null }`

- DELETE `/skills/my-analysis`
  - Success: `{ success: true, message: string }`

- GET `/skills/status`
  - Success: `{ success: true, data: { hasGitHubToken: boolean, hasAnalysis: boolean, lastAnalyzedAt: string | null, githubUser: { login: string, name: string, avatar_url: string } | null } }`

## Contribution History (JWT required)

- GET `/contribution-history`
  - Success: `{ success: true, data: ContributionHistory }`

- GET `/contribution-history/:username`
  - Success: `{ success: true, data: ContributionHistory }`

- GET `/contribution-history/stats/summary`
  - Success: `{ success: true, data: { username: string, analyzedAt: string, summary: ContributionHistory['summary'], stats: Partial<ContributionHistory['stats']> } }`

## Health Check

- GET `/health`
  - Success: `{ status: 'ok', timestamp: string }`

---

See `backend/src/types/index.ts` for TypeScript models.
