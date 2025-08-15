# 環境変数ガイド

## Backend (.env)

| 変数名 | 例 | 説明 |
|---|---|---|
| PORT | 3001 | 開発用ポート（本番は 3000） |
| NODE_ENV | development | 環境名 |
| ALLOWED_ORIGINS | http://localhost:3000 | CORS 許可オリジン（カンマ区切り） |
| JWT_SECRET | change-me | JWT 署名用シークレット |
| SERVICE_URL | http://localhost:3000 | GitHub OAuth のリダイレクト先（フロントURL） |
| GH_CLIENT_ID | - | GitHub OAuth App Client ID |
| GH_CLIENT_SECRET | - | GitHub OAuth App Client Secret |
| GITHUB_TOKEN | - | GitHub Search API のレート上限緩和用（任意） |

## Frontend (.env)

| 変数名 | 例 | 説明 |
|---|---|---|
| VITE_API_BASE_URL | http://localhost:3001 | バックエンド API のベース URL |

## 補足

- `frontend/vite.config.ts` は開発時 `/api` を `http://localhost:3001` にプロキシします。
- 本番デプロイでは Frontend は Nginx、Backend は Node（Express）で稼働します。
