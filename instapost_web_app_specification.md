# Instagram不動産投稿半自動作成アプリ - ウェブアプリ版仕様書

## プロジェクト概要
不動産会社向けのInstagram投稿コンテンツを効率的に作成するウェブベース半自動化ツール。
ブラウザ上で動作し、物件画像と自由記述の物件情報から、LLMを活用して複数のPR文を生成し、各画像に最適な訴求文を配置した投稿を一括生成する。

## 技術スタック
### フロントエンド
- Next.js 14 + TypeScript + Tailwind CSS
- Fabric.js (Canvas画像テキスト合成)
- Zustand (状態管理)
- React Hook Form + Zod (フォーム管理・バリデーション)
- Lucide React (アイコン)
- React Slider (フォントサイズ調整)

### バックエンド
- Next.js API Routes
- SQLite + Prisma ORM (ローカルデータベース)
- Sharp.js (画像処理・最適化)

### 外部サービス
- OpenAI GPT-3.5 Turbo API (PR文生成・投稿文生成)
- Google Fonts (日本語フォント)

### デプロイ環境
- Vercel (推奨) / Netlify
- 環境変数による設定管理
- CDN経由での高速配信

## ユーザーワークフロー
1. **画像アップロード**: 最大10枚の物件画像をブラウザにアップロード
2. **物件情報入力**: 自由記述テキストで物件情報を入力
3. **PR文生成**: LLMが物件情報を20種類程度のPR文に分割
4. **PR文割り当て**: 各画像に対してPR文を手動または自動で割り当て
5. **レイアウト選択**: 事前搭載されたレイアウトとスライダーでフォントサイズを調整
6. **プレビュー確認**: PR文が挿入された画像をリアルタイムプレビュー
7. **画像ダウンロード**: 完成した画像をブラウザダウンロード
8. **投稿文・タグ生成**: 画像とは別に投稿テキストとハッシュタグを生成

## ディレクトリ構造
```
instagram-real-estate-web/
├── components/
│   ├── ImageUploader.tsx
│   ├── PropertyTextInput.tsx
│   ├── PRTextGenerator.tsx
│   ├── ImageTextAssignment.tsx
│   ├── LayoutSelector.tsx
│   ├── FontSizeSlider.tsx        # 新規: スライダーコンポーネント
│   ├── CanvasEditor.tsx
│   ├── ImagePreview.tsx
│   ├── PostTextGenerator.tsx
│   └── StepNavigation.tsx
├── pages/
│   ├── api/
│   │   ├── generate-pr-texts.ts
│   │   ├── generate-post-content.ts
│   │   ├── upload-image.ts
│   │   └── export-images.ts
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── lib/
│   ├── prisma.ts
│   ├── openai.ts
│   ├── image-processing.ts
│   ├── layouts.ts
│   └── validation.ts
├── store/
│   └── app-store.ts
├── types/
│   └── index.ts
├── public/
│   ├── fonts/
│   ├── layouts/
│   └── exports/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
├── tailwind.config.js
├── next.config.js
├── .env.local
└── README.md
```

## データ型定義（ウェブアプリ特化）

```typescript
// types/index.ts
export interface PropertyTextInput {
  rawText: string;
  inputDate: Date;
}

export interface GeneratedPRText {
  id: string;
  text: string;
  category: 'location' | 'price' | 'features' | 'specs' | 'appeal' | 'general';
  priority: number; // 1-5の重要度
  characterCount: number;
}

export interface ImageAssignment {
  imageId: string;
  assignedPRTextId: string;
  layoutId: string;
  fontSize: number; // 12-72の連続値
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TextLayout {
  id: string;
  name: string;
  previewImage: string;
  textArea: {
    x: number; // パーセント
    y: number; // パーセント
    width: number; // パーセント
    height: number; // パーセント
    maxLines: number;
    alignment: 'left' | 'center' | 'right';
    verticalAlignment: 'top' | 'middle' | 'bottom';
  };
  backgroundOverlay?: {
    color: string;
    opacity: number;
    blur?: number;
  };
  textStyle: {
    fontFamily: string;
    color: string;
    strokeColor?: string;
    strokeWidth?: number;
    shadow?: {
      offsetX: number;
      offsetY: number;
      blur: number;
      color: string;
    };
  };
}

export interface ProcessedImage {
  id: string;
  originalFile: File;
  processedUrl: string; // Blob URL
  assignment?: ImageAssignment;
  finalCanvasUrl?: string; // Data URL
}

export interface PostContent {
  mainText: string;
  hashtags: string[];
  callToAction: string;
  characterCount: number;
}

// ウェブアプリ特有の設定
export interface WebAppSettings {
  autoSave: boolean;
  previewQuality: 'low' | 'medium' | 'high';
  maxFileSize: number; // MB
  compressionLevel: number; // 0-100
}
```

## フォントサイズ調整機能（新規）

### FontSizeSlider コンポーネント
```typescript
// components/FontSizeSlider.tsx
interface FontSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  previewText?: string;
}

export const FontSizeSlider = ({
  value,
  onChange,
  min = 12,
  max = 72,
  step = 1,
  previewText = "サンプルテキスト"
}: FontSizeSliderProps) => {
  // スライダー実装
  // リアルタイムプレビュー
  // 数値入力併用
  // プリセット値（16, 24, 32, 48）へのクイックアクセス
};

// フォントサイズ設定
export const FONT_SIZE_CONFIG = {
  min: 12,
  max: 72,
  step: 1,
  presets: [16, 24, 32, 48, 64],
  defaultSize: 32
};
```

## ウェブアプリ特有の機能

### 1. ブラウザ最適化
```typescript
// 画像処理の最適化
const processImageForWeb = async (file: File): Promise<ProcessedImage> => {
  // Web Workers使用で UI ブロッキング回避
  // Canvas API でリサイズ
  // 段階的品質調整
  // メモリ使用量制限
};

// オフラインサポート（Service Worker）
const enableOfflineMode = () => {
  // 編集中データのローカルストレージ保存
  // 完了済みプロジェクトのキャッシュ
  // ネットワーク復旧時の自動同期
};
```

### 2. レスポンシブデザイン
```typescript
// ブレークポイント
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};

// モバイル対応
- タッチ操作対応
- スワイプナビゲーション
- モバイル最適化UI
- 縦画面レイアウト
```

### 3. パフォーマンス最適化
```typescript
// 仮想化リスト
import { FixedSizeList as List } from 'react-window';

// 画像遅延読み込み
const LazyImage = ({ src, alt, ...props }) => {
  // Intersection Observer使用
  // プレースホルダー表示
  // プログレッシブ読み込み
};

// メモ化
const MemoizedCanvasEditor = React.memo(CanvasEditor);
```

## API仕様（ウェブアプリ版）

### 1. セッション管理API
```typescript
// pages/api/session.ts
POST /api/session/create
Response: { sessionId: string, expiresAt: Date }

GET /api/session/:id
Response: { projectData: ProjectData }

DELETE /api/session/:id
Response: { success: boolean }
```

### 2. 画像アップロードAPI（ウェブ最適化）
```typescript
// pages/api/upload-image.ts
POST /api/upload-image
Request: FormData (最大10MB per file)
Response: {
  success: boolean;
  processedImages: {
    id: string;
    originalName: string;
    processedUrl: string; // Temporary URL
    thumbnailUrl: string;
    dimensions: { width: number; height: number };
    fileSize: number;
  }[];
}

// 段階的アップロード対応
POST /api/upload-image/chunk
Request: { chunk: Blob, chunkIndex: number, totalChunks: number }
```

### 3. リアルタイム同期API
```typescript
// WebSocket または Server-Sent Events
GET /api/sync/:sessionId
Response: SSE stream with project updates

// プロジェクト自動保存
POST /api/auto-save
Request: { sessionId: string, data: Partial<ProjectData> }
```

## デプロイ仕様

### Vercel設定
```json
// vercel.json
{
  "functions": {
    "pages/api/generate-pr-texts.ts": {
      "maxDuration": 30
    },
    "pages/api/upload-image.ts": {
      "maxDuration": 60
    }
  },
  "env": {
    "OPENAI_API_KEY": "@openai-api-key",
    "DATABASE_URL": "@database-url"
  }
}
```

### 環境変数
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB
NEXT_PUBLIC_SESSION_TIMEOUT=3600000 # 1 hour
```

## セキュリティ機能

### 1. ファイルアップロード制限
```typescript
const validateUpload = (file: File): boolean => {
  // ファイルタイプ検証
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  // ファイルサイズ制限
  const maxSize = 10 * 1024 * 1024; // 10MB
  // MIME type と拡張子の一致確認
  // ヘッダー検証
};
```

### 2. レート制限
```typescript
// API保護
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト制限
  message: 'リクエストが多すぎます'
});
```

## ブラウザ互換性

### 対応ブラウザ
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 必要な機能
- Canvas API
- File API
- Web Workers
- Local Storage
- CSS Grid/Flexbox

## パッケージ.json（ウェブアプリ版）
```json
{
  "name": "instagram-real-estate-web",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "fabric": "^5.3.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "prisma": "^5.4.0",
    "@prisma/client": "^5.4.0",
    "sharp": "^0.32.0",
    "openai": "^4.0.0",
    "lucide-react": "^0.290.0",
    "react-slider": "^2.0.4",        # フォントサイズスライダー
    "react-window": "^1.8.0",        # 仮想化
    "react-intersection-observer": "^9.5.0", # 遅延読み込み
    "html2canvas": "^1.4.0",
    "archiver": "^6.0.0"
  },
  "devDependencies": {
    "@types/fabric": "^5.3.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  }
}
``` 