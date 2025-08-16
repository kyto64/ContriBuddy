# Kontri

Kontri は、あなたのスキルや興味に合わせて OSS プロジェクトや貢献機会をおすすめする Web アプリです。GitHub API を活用し、特に初心者が意味のあるコントリビュートを見つけるのを支援します。

<kbd><img src="https://github.com/user-attachments/assets/abaaf604-63c7-4d7b-8d03-8057292dd35a" /></kbd>

## ✨ 主な機能

- パーソナライズされた推薦（言語・フレームワーク・興味・経験レベル）
- 初心者向け Issue の発見（good first issue 等）
- GitHub の最新データに基づく検索/集計
- Vue 3 + Vite + Tailwind のモダン UI、Pinia 状態管理

## 🚀 クイックスタート

### 前提条件
- Node.js v18+（推奨 v20+）
- npm
- GitHub OAuth App（Client ID/Secret）

### セットアップ手順

1. リポジトリを取得
```bash
git clone https://github.com/kyto64/Kontri.git
cd Kontri
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数ファイルを作成（サンプルから）
```bash
# Backend
cp backend/.env.development.example backend/.env.development

# Frontend
cp frontend/.env.development.example frontend/.env.development
```

4. 環境変数を設定
- Backend（`backend/.env.development`）
  - `JWT_SECRET`（任意の安全な文字列）
  - `GH_CLIENT_ID` / `GH_CLIENT_SECRET`（GitHub OAuth App）
  - `SERVICE_URL`（フロントのオリジン。例: http://localhost:3000）
  - `ALLOWED_ORIGINS`（CORS 許可。例: http://localhost:3000）
  - `PORT`（ローカル: 3001 推奨）
  - `GITHUB_TOKEN`（任意。検索 API のレート制限緩和用 PAT）
- Frontend（`frontend/.env.development`）
  - `VITE_API_BASE_URL`（例: http://localhost:3001）

5. 開発サーバー起動
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001（開発時）

補足:
- フロント開発サーバーは `/api` を `http://localhost:3001` にプロキシします（`frontend/vite.config.ts`）。
- 本番コンテナでは Backend は `PORT=3000` で待受、Fly.io の `internal_port = 3000` に合わせています。

## 🔐 認証フロー（GitHub OAuth）

1. フロントで `GET /api/auth/github/url` を呼び、GitHub 認可 URL を取得して遷移
2. GitHub から `SERVICE_URL/auth/github/callback` に `code` が返る
3. フロントが `POST /api/auth/github/callback` に `code` を送信
4. バックエンドで GitHub Access Token を交換・ユーザー情報を取得し、JWT を発行
5. フロントは JWT を `localStorage` に保存し、以降の API に付与

必要な権限/スコープ:
- GitHub OAuth App: `user:email`, `read:user`, `public_repo`

## 🧩 API エンドポイント概要

主要なパス（すべて `/api` 配下）:

- 認証
  - `GET  /api/auth/github/url`
  - `POST /api/auth/github/callback`（body: `{ code }`）
  - `GET  /api/auth/me`（要 JWT）
  - `POST /api/auth/logout`（要 JWT）

- GitHub 検索
  - `GET /api/github/repositories/search?language&minStars&maxStars&hasGoodFirstIssues&topics`
  - `GET /api/github/repositories/:owner/:repo`
  - `GET /api/github/repositories/:owner/:repo/issues?labels`
  - `GET /api/github/repositories/:owner/:repo/good-first-issues`

- 推薦
  - `POST /api/recommendations/generate`（skills と任意 filters を送信）
  - `GET  /api/recommendations/trending/:language?limit`
  - `GET  /api/recommendations/health`

- スキル分析（要 JWT）
  - `POST   /api/skills/analyze`
  - `GET    /api/skills/my-analysis`
  - `DELETE /api/skills/my-analysis`
  - `GET    /api/skills/status`

- 貢献履歴（要 JWT）
  - `GET /api/contribution-history`（自分）
  - `GET /api/contribution-history/:username`（指定ユーザーの公開情報）
  - `GET /api/contribution-history/stats/summary`

- ヘルスチェック
  - `GET /health`

詳細は `docs/API.md` を参照してください。

## 🛠️ 技術スタック

- Frontend: Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, Vue Router
- Backend: Node.js, Express, TypeScript, Zod, GitHub API

## 📁 プロジェクト構成

```
Kontri/
├── frontend/                 # Vue 3 + Vite
│   └── src/{components,views,stores,services,types,...}
├── backend/                  # Express + TypeScript API
│   └── src/{routes,services,types,middleware}
├── docs/                     # ドキュメント（API/環境変数など）
├── package.json              # ワークスペース（frontend, backend）
└── README.md
```

## 🔧 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発（フロント + バックエンド同時起動）
npm run dev

# 片方だけ起動
npm run dev:frontend
npm run dev:backend

# ビルド（frontend -> backend）
npm run build

# 型チェック
npm run type-check
```

## 🚢 デプロイ

Fly.io へのデプロイに対応しています（フロント: `kontri`、バックエンド: `kontri-api`）。
本番では Backend は `PORT=3000` で稼働します。Secrets/環境変数や Fly 構成は `DEPLOYMENT.md` を参照してください。

## 🤝 Contributing

歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 📄 License

MIT License（[LICENSE](LICENSE)）

## 🛡️ Security

脆弱性を見つけた場合は [SECURITY.md](SECURITY.md) を参照し、責任ある開示にご協力ください。

## 🐛 Issues

バグ報告や要望は [Issues](https://github.com/kyto64/Kontri/issues) へ。

---

Made with ❤️ for the OSS community
