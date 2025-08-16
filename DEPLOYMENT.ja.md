# Kontri Deployment Setup Guide

このドキュメントは現行の Fly.io 設定（frontend: `kontri`, backend: `kontri-api`）に基づきます。

## 必要な環境変数（本番）

バックエンド（`kontri-api`）:
- `JWT_SECRET`
- `GH_CLIENT_ID`
- `GH_CLIENT_SECRET`
- `SERVICE_URL`（例: `https://kontri.fly.dev`）
- `ALLOWED_ORIGINS`（例: `https://kontri.fly.dev`）
- `GITHUB_TOKEN`（任意）
- `PORT=3000`（fly.toml に合わせて 3000）

フロントエンド（`kontri`）:
- `VITE_API_BASE_URL`（例: `https://kontri-api.fly.dev`）

## GitHub Actions Secrets Configuration

自動デプロイ用に以下を設定:

- `FLY_API_TOKEN`: Fly.io API トークン

> 取得例
> ```bash
> flyctl auth token
> ```

レポジトリ: Settings > Secrets and variables > Actions > New repository secret

## 環境 (Environments)

- `production` 環境を作成し、必要に応じて保護ルールを追加

## 手動デプロイ

```bash
# backend
cd backend
flyctl deploy

# frontend
cd ../frontend
flyctl deploy
```

## ランタイム/ポート

- backend: `internal_port = 3000`（`backend/fly.toml`） → コンテナ内 `PORT=3000` で起動
- frontend: `internal_port = 80`（`frontend/fly.toml`）

## トラブルシュート

- 認証エラー: `flyctl auth whoami` でトークン確認、`FLY_API_TOKEN` を再設定
- ビルド失敗: Actions ログで依存関係を確認
- ヘルス失敗: backend の `/health` を確認（`https://<backend-app>.fly.dev/health`）
- ログ確認:
  ```bash
  flyctl logs -a kontri-api
  flyctl logs -a kontri
  ```
