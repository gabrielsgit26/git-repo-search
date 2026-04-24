# Git Repo Search

GitHub API を利用して、リポジトリの検索・絞り込み・並び替え・詳細確認を行う Next.js アプリケーションです。  
検索体験の連続性（一覧状態の保持、スクロール位置復元）と、読みやすい UI/UX を重視して実装しています。

## 主な機能

### 1. リポジトリ検索
- キーワード入力で GitHub の `search/repositories` を実行
- 検索ボタン押下後に結果一覧を表示
- 0 件時、エラー時、読み込み中の状態をそれぞれ表示

### 2. 言語フィルター / 並び順
- 検索実行後にフィルター UI を表示（初期画面では非表示）
- **言語フィルター**
  - 「すべての言語」+ 検索結果に関連する言語候補を動的生成
  - 候補は出現頻度順で表示
- **並び順**
  - スターが多い順 / 少ない順
  - フォークが多い順 / 少ない順
  - 最近更新された順 / 更新が古い順
- フィルターまたは並び順変更時は、条件に合わせて再検索を実行

### 3. 一覧表示
- カード形式でリポジトリ情報を表示
  - オーナーアバター
  - フルネーム
  - 説明文
  - 使用言語
  - スター数
- `さらに読み込む` でページネーション読み込み（Load More）
- ホバー時にわずかな視覚フィードバック
- 一度開いたリポジトリは既読風のリンク色で表示

### 4. 詳細ページ
- 一覧から別ページ遷移（モーダルではなくページ遷移）
- 以下を表示
  - リポジトリ名 / オーナー
  - 使用言語
  - スター数
  - ウォッチャー数
  - フォーク数
  - オープンイシュー数
  - Clone URL（コピー機能付き）
- モバイル表示ではヘッダー構造を最適化し、外部リンク導線を維持

### 5. 状態保持（戻る体験の改善）
- 検索キーワード、結果一覧、ページ番号などをクライアント状態で保持
- 詳細ページから戻った際に、前回のスクロール位置を復元

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui（Button / Card / Input / Select）
- **Icons**: lucide-react
- **Theme**: next-themes
- **State**: React Context (`SearchStateProvider`)

## ディレクトリ構成（主要部分）

```text
app/
  page.tsx                          # 検索ページ（検索・フィルター・一覧）
  repo/[owner]/[repo]/page.tsx      # 詳細ページ
  api/repositories/route.ts          # GitHub検索プロキシAPI
components/
  search-state-provider.tsx          # 検索状態の共有
  ui/                                # 共通UIコンポーネント
lib/
  github.ts                          # API呼び出しラッパー
```

## ローカル起動方法

### 前提
- Node.js / npm が利用可能であること

### 手順

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 利用可能な npm スクリプト

```bash
npm run dev       # 開発サーバー起動
npm run build     # 本番ビルド
npm run start     # 本番サーバー起動
npm run lint      # ESLint 実行
npm run typecheck # TypeScript 型チェック
npm run format    # ts/tsx を Prettier で整形
```

## API 仕様（アプリ内部）

### `GET /api/repositories`

GitHub Search API へのプロキシ。クライアントからはこのエンドポイントを利用します。

#### クエリパラメータ
- `q` (必須): 検索キーワード
- `page` (任意): ページ番号（デフォルト: 1）
- `per_page` (任意): 取得件数（10〜20に補正）
- `language` (任意): 言語フィルター
- `sort` (任意):  
  `stars-desc` / `stars-asc` / `forks-desc` / `forks-asc` / `updated-desc` / `updated-asc`

#### レスポンス形式

```json
{
  "totalCount": 12345,
  "items": []
}
```

エラー時:

```json
{
  "totalCount": 0,
  "items": [],
  "error": "エラーメッセージ"
}
```

## 実装上のポイント

- **検索条件の一貫性**
  - 検索語・言語・並び順を単一の状態として管理し、再検索時に必ず反映
- **過剰な再描画の抑制**
  - スクロール復元は初回のみ実行し、再レンダリング時の巻き戻りを回避
- **アクセシビリティ**
  - `aria-label` を付与し、キーボード操作を考慮した UI を採用
- **UI/UX**
  - 穏やかなトランジション、控えめなホバー、読みやすい余白設計

## 注意事項

- GitHub API は未認証で利用しているため、レート制限の影響を受けます。
- ネットワーク状況や GitHub 側制限により、検索が失敗する場合があります。

## 今後の改善案

- GitHub Personal Access Token による認証リクエスト対応
- 言語候補の件数表示（例: TypeScript (42)）
- ソートやフィルター状態の URL クエリ同期（共有可能 URL）
- テスト拡充（UI テスト / API ハンドラのユニットテスト）
