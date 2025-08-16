# Kontri API 仕様

ベースURL: `http://<backend-host>:<port>/api`

認証: JWT（`Authorization: Bearer <token>`）。`/api/auth/github/callback` で取得。

## Auth

- GET `/auth/github/url`
  - 概要: GitHub OAuth 認可URLを返す
  - レスポンス: `{ url: string, clientId: string }`

- POST `/auth/github/callback`
  - Body: `{ code: string }`
  - 成功: `{ success: true, token: string, user: AuthUser }`

- GET `/auth/me`（要JWT）
  - 成功: `{ user: AuthUser }`

- POST `/auth/logout`（要JWT）
  - 成功: `{ success: true }`

## GitHub 検索

- GET `/github/repositories/search`
  - Query: `language?`, `minStars?`, `maxStars?`, `hasGoodFirstIssues?`, `topics?`（カンマ区切り）
  - 成功: `{ success: true, data: { repositories: GitHubRepo[], count: number } }`

- GET `/github/repositories/:owner/:repo`
  - 成功: `{ success: true, data: GitHubRepo }`

- GET `/github/repositories/:owner/:repo/issues`
  - Query: `labels?`（カンマ区切り）
  - 成功: `{ success: true, data: { issues: GitHubIssue[], count: number } }`

- GET `/github/repositories/:owner/:repo/good-first-issues`
  - 成功: `{ success: true, data: { issues: GitHubIssue[], count: number } }`

## 推薦

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
  - 成功: `{ success: true, data: { recommendations: ProjectRecommendation[], totalCount: number, processingTime: number }, message: string }`

- GET `/recommendations/trending/:language?limit=10`
  - 成功: `{ success: true, data: { language: string, repositories: GitHubRepo[], count: number } }`

- GET `/recommendations/health`
  - 成功: `{ status: 'ok', service: 'recommendations', timestamp: string }`

- POST `/recommendations/generate/personalized`（要JWT）
  - リクエスト Body は `/recommendations/generate` と同様
  - GitHub のスター/フォロー情報を用いて候補集合を拡張し、最近の公開イベントから推定した「既に貢献済み」のリポジトリを除外します。
  - 成功: `{ success: true, data: { recommendations: ProjectRecommendation[], totalCount: number } }`

## スキル分析（要JWT）

- POST `/skills/analyze`
  - 成功: `{ success: true, data: SkillAnalysisResult }`

- GET `/skills/my-analysis`
  - 成功: `{ success: true, data: SkillAnalysisResult | null }`

- DELETE `/skills/my-analysis`
  - 成功: `{ success: true, message: string }`

- GET `/skills/status`
  - 成功: `{ success: true, data: { hasGitHubToken: boolean, hasAnalysis: boolean, lastAnalyzedAt: string | null, githubUser: { login: string, name: string, avatar_url: string } | null } }`

## 貢献履歴（要JWT）

- GET `/contribution-history`
  - 成功: `{ success: true, data: ContributionHistory }`

- GET `/contribution-history/:username`
  - 成功: `{ success: true, data: ContributionHistory }`

- GET `/contribution-history/stats/summary`
  - 成功: `{ success: true, data: { username: string, analyzedAt: string, summary: ContributionHistory['summary'], stats: Partial<ContributionHistory['stats']> } }`

## ヘルスチェック

- GET `/health`
  - 成功: `{ status: 'ok', timestamp: string }`

---

型定義は `backend/src/types/index.ts` を参照してください。
