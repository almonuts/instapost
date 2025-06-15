import { PromptTemplate, PromptSettings } from '@/types';

// プリセットのプロンプトテンプレート
export const defaultPromptTemplates: PromptTemplate[] = [
  {
    id: 'default-balanced',
    name: 'バランス型（推奨）',
    description: '魅力的で読みやすく、幅広い層にアピールするPR文を生成します',
    systemPrompt: 'あなたは経験豊富な不動産マーケティングの専門家です。魅力的でキャッチーなPR文を作成することが得意で、物件の特徴を的確に捉えて効果的に表現できます。日本語で回答してください。',
    userPromptTemplate: `
以下の不動産物件情報から、Instagram投稿用のPR文を20種類程度生成してください。

【表現スタイル】
- トーン: {{tone}}
- スタイル: {{style}}
- ターゲット: {{targetAudience}}
- 重点: {{emphasis}}

【生成条件】
1. 文字数は15〜50文字程度
2. 物件の魅力を{{style === 'concise' ? '簡潔に' : '詳細に'}}表現
3. {{targetAudience}}層にアピールする表現を使用
4. {{emphasis}}の要素を特に重視
5. 以下のカテゴリに分類：location, price, features, specs, appeal, general, summary
6. 重要度を1〜5で評価（5が最重要）

【必須生成内容】
- **物件概要（summary）**: 物件種別、面積、価格、間取りなどの基本情報をリスト形式でまとめた文章を1〜2個必ず生成してください
  例: "3LDK・75㎡・駅徒歩5分・3980万円"
  例: "新築マンション｜2LDK｜60㎡｜駅近3分"

物件情報：
{{propertyText}}

出力は以下のJSON形式でお願いします：
{
  "prTexts": [
    {
      "text": "PR文のテキスト",
      "category": "location|price|features|specs|appeal|general|summary",
      "priority": 1-5の数値
    }
  ],
  "postContent": {
    "captions": [
      {
        "text": "投稿用キャプション（300文字以内）",
        "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2"]
      }
    ],
    "suggestedHashtags": ["#提案ハッシュタグ1", "#提案ハッシュタグ2"],
    "hashtagCategories": {
      "location": ["#立地関連のハッシュタグ"],
      "property": ["#物件関連のハッシュタグ"],
      "lifestyle": ["#ライフスタイル関連のハッシュタグ"],
      "general": ["#一般的なハッシュタグ"]
    }
  }
}

【投稿テキスト生成条件】
- キャプション: 2-3個生成、各300文字以内
- ハッシュタグ: 各キャプションに5-10個
- 投稿の魅力を伝える文章で、{{targetAudience}}層に響く内容
- 不動産・住まい関連の人気ハッシュタグを含める
`,
    settings: {
      tone: 'professional',
      style: 'detailed',
      targetAudience: 'general',
      emphasis: 'features'
    },
    isDefault: true
  },
  {
    id: 'family-friendly',
    name: 'ファミリー向け',
    description: '家族層をターゲットにした温かみのあるPR文を生成します',
    systemPrompt: 'あなたは家族向け不動産の専門アドバイザーです。家族の暮らしやすさ、子育て環境、安全性を重視した温かみのある表現が得意です。日本語で回答してください。',
    userPromptTemplate: `
以下の不動産物件情報から、ファミリー層向けのInstagram投稿用PR文を20種類程度生成してください。

【ファミリー特化設定】
- 家族の生活シーンを想像しやすい表現
- 子育て環境や教育施設への言及
- 安全性や住環境の良さを強調
- 温かみのある親しみやすい言葉遣い

【生成条件】
1. 文字数は15〜50文字程度
2. 家族の暮らしを豊かにする要素を重視
3. 子育て世代が気になるポイントを含める
4. 以下のカテゴリに分類：location, price, features, specs, appeal, general, summary
5. 重要度を1〜5で評価（5が最重要）

【必須生成内容】
- **物件概要（summary）**: 物件種別、面積、価格、間取りなどの基本情報をリスト形式でまとめた文章を1〜2個必ず生成してください
  例: "3LDK・75㎡・駅徒歩5分・3980万円"
  例: "ファミリー向けマンション｜3LDK｜80㎡｜小学校近く"

物件情報：
{{propertyText}}

出力は以下のJSON形式でお願いします：
{
  "prTexts": [
    {
      "text": "PR文のテキスト",
      "category": "location|price|features|specs|appeal|general|summary",
      "priority": 1-5の数値
    }
  ],
  "postContent": {
    "captions": [
      {
        "text": "投稿用キャプション（300文字以内）",
        "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2"]
      }
    ],
    "suggestedHashtags": ["#提案ハッシュタグ1", "#提案ハッシュタグ2"],
    "hashtagCategories": {
      "location": ["#立地関連のハッシュタグ"],
      "property": ["#物件関連のハッシュタグ"],
      "lifestyle": ["#ライフスタイル関連のハッシュタグ"],
      "general": ["#一般的なハッシュタグ"]
    }
  }
}

【投稿テキスト生成条件】
- キャプション: 2-3個生成、各300文字以内
- ハッシュタグ: 各キャプションに5-10個
- 投稿の魅力を伝える文章で、{{targetAudience}}層に響く内容
- 不動産・住まい関連の人気ハッシュタグを含める
`,
    settings: {
      tone: 'friendly',
      style: 'detailed',
      targetAudience: 'family',
      emphasis: 'lifestyle'
    }
  },
  {
    id: 'investment-focused',
    name: '投資家向け',
    description: '投資収益性や資産価値を重視したPR文を生成します',
    systemPrompt: 'あなたは不動産投資の専門アナリストです。収益性、立地条件、将来性を的確に分析し、投資価値を明確に示すことが得意です。日本語で回答してください。',
    userPromptTemplate: `
以下の不動産物件情報から、投資家向けのInstagram投稿用PR文を20種類程度生成してください。

【投資特化設定】
- 利回り、収益性、資産価値を重視
- 立地の将来性や開発予定を考慮
- 投資リスクの低さをアピール
- 数値的根拠を含む客観的な表現

【生成条件】
1. 文字数は15〜50文字程度
2. 投資価値と収益性を明確に表現
3. 立地や将来性の優位性を強調
4. 以下のカテゴリに分類：location, price, features, specs, appeal, general, summary
5. 重要度を1〜5で評価（5が最重要）

【必須生成内容】
- **物件概要（summary）**: 物件種別、面積、価格、間取り、利回りなどの投資指標をリスト形式でまとめた文章を1〜2個必ず生成してください
  例: "1K・25㎡・850万円・想定利回り7.2%"
  例: "投資用ワンルーム｜駅3分｜築5年｜満室稼働中"

物件情報：
{{propertyText}}

出力は以下のJSON形式でお願いします：
{
  "prTexts": [
    {
      "text": "PR文のテキスト",
      "category": "location|price|features|specs|appeal|general|summary",
      "priority": 1-5の数値
    }
  ],
  "postContent": {
    "captions": [
      {
        "text": "投稿用キャプション（300文字以内）",
        "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2"]
      }
    ],
    "suggestedHashtags": ["#提案ハッシュタグ1", "#提案ハッシュタグ2"],
    "hashtagCategories": {
      "location": ["#立地関連のハッシュタグ"],
      "property": ["#物件関連のハッシュタグ"],
      "lifestyle": ["#ライフスタイル関連のハッシュタグ"],
      "general": ["#一般的なハッシュタグ"]
    }
  }
}

【投稿テキスト生成条件】
- キャプション: 2-3個生成、各300文字以内
- ハッシュタグ: 各キャプションに5-10個
- 投稿の魅力を伝える文章で、{{targetAudience}}層に響く内容
- 不動産・住まい関連の人気ハッシュタグを含める
`,
    settings: {
      tone: 'professional',
      style: 'factual',
      targetAudience: 'investor',
      emphasis: 'investment'
    }
  },
  {
    id: 'young-casual',
    name: '若年層向けカジュアル',
    description: '若い世代にアピールするトレンド感のあるPR文を生成します',
    systemPrompt: 'あなたは若年層のライフスタイルに詳しい不動産コンサルタントです。トレンド感があり、SNS映えする表現で若い世代の心を掴むことが得意です。日本語で回答してください。',
    userPromptTemplate: `
以下の不動産物件情報から、若年層向けのInstagram投稿用PR文を20種類程度生成してください。

【若年層特化設定】
- トレンド感のある表現とキーワード使用
- ライフスタイルの充実感を重視
- SNS映えする魅力的な表現
- カジュアルで親しみやすい言葉遣い

【生成条件】
1. 文字数は15〜50文字程度
2. 若い世代のライフスタイルに刺さる表現
3. デザイン性や利便性を強調
4. 以下のカテゴリに分類：location, price, features, specs, appeal, general, summary
5. 重要度を1〜5で評価（5が最重要）

【必須生成内容】
- **物件概要（summary）**: 物件種別、面積、価格、間取りなどの基本情報をおしゃれにリスト形式でまとめた文章を1〜2個必ず生成してください
  例: "1K・30㎡・駅2分・月8万円でこの立地✨"
  例: "おしゃれ1LDK｜デザイナーズ｜新築｜渋谷エリア"

物件情報：
{{propertyText}}

出力は以下のJSON形式でお願いします：
{
  "prTexts": [
    {
      "text": "PR文のテキスト",
      "category": "location|price|features|specs|appeal|general|summary",
      "priority": 1-5の数値
    }
  ],
  "postContent": {
    "captions": [
      {
        "text": "投稿用キャプション（300文字以内）",
        "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2"]
      }
    ],
    "suggestedHashtags": ["#提案ハッシュタグ1", "#提案ハッシュタグ2"],
    "hashtagCategories": {
      "location": ["#立地関連のハッシュタグ"],
      "property": ["#物件関連のハッシュタグ"],
      "lifestyle": ["#ライフスタイル関連のハッシュタグ"],
      "general": ["#一般的なハッシュタグ"]
    }
  }
}

【投稿テキスト生成条件】
- キャプション: 2-3個生成、各300文字以内
- ハッシュタグ: 各キャプションに5-10個
- 投稿の魅力を伝える文章で、{{targetAudience}}層に響く内容
- 不動産・住まい関連の人気ハッシュタグを含める
`,
    settings: {
      tone: 'casual',
      style: 'creative',
      targetAudience: 'young',
      emphasis: 'lifestyle'
    }
  }
];

// プロンプト設定に基づいてテンプレートを生成
export const generatePromptFromSettings = (
  settings: PromptSettings,
  propertyText: string
): { systemPrompt: string; userPrompt: string } => {
  // 設定に最も適したテンプレートを選択
  const template = selectBestTemplate(settings);
  
  return {
    systemPrompt: template.systemPrompt,
    userPrompt: interpolateTemplate(template.userPromptTemplate, { ...settings, propertyText })
  };
};

// テンプレート内の変数を置換
const interpolateTemplate = (template: string, variables: any): string => {
  return template.replace(/\{\{(\w+(?:\s*===\s*'[^']*'\s*\?\s*'[^']*'\s*:\s*'[^']*')?)\}\}/g, (match, expr) => {
    // 三項演算子の処理
    const ternaryMatch = expr.match(/(\w+)\s*===\s*'([^']*)'\s*\?\s*'([^']*)'\s*:\s*'([^']*)'/);
    if (ternaryMatch) {
      const [, key, condition, trueValue, falseValue] = ternaryMatch;
      return variables[key] === condition ? trueValue : falseValue;
    }
    
    // 通常の変数置換
    return variables[expr] || match;
  });
};

// 設定に基づいて最適なテンプレートを選択
const selectBestTemplate = (settings: PromptSettings): PromptTemplate => {
  // ターゲット層に基づいてテンプレートを選択
  switch (settings.targetAudience) {
    case 'family':
      return defaultPromptTemplates.find(t => t.id === 'family-friendly') || defaultPromptTemplates[0];
    case 'investor':
      return defaultPromptTemplates.find(t => t.id === 'investment-focused') || defaultPromptTemplates[0];
    case 'young':
      return defaultPromptTemplates.find(t => t.id === 'young-casual') || defaultPromptTemplates[0];
    default:
      return defaultPromptTemplates[0]; // デフォルトテンプレート
  }
};

// トーンの日本語ラベル
export const toneLabels = {
  polite: '丁寧',
  casual: 'カジュアル',
  professional: 'プロフェッショナル',
  friendly: 'フレンドリー'
} as const;

// スタイルの日本語ラベル
export const styleLabels = {
  detailed: '詳細',
  concise: '簡潔',
  creative: 'クリエイティブ',
  factual: '事実重視'
} as const;

// ターゲット層の日本語ラベル
export const targetAudienceLabels = {
  family: 'ファミリー層',
  investor: '投資家',
  young: '若年層',
  senior: 'シニア層',
  general: '一般層'
} as const;

// 重点項目の日本語ラベル
export const emphasisLabels = {
  location: '立地',
  price: '価格',
  features: '設備・機能',
  investment: '投資価値',
  lifestyle: 'ライフスタイル'
} as const; 