// types/index.ts
export interface PropertyTextInput {
  rawText: string;
  processedData?: {
    price?: string;
    location?: string;
    size?: string;
    features?: string[];
  };
  characterCount: number;
}

export interface GeneratedPRText {
  id: string;
  text: string;
  category: 'location' | 'price' | 'features' | 'specs' | 'appeal' | 'general' | 'summary';
  priority: number; // 1-5 (5が最重要)
  characterCount: number;
  isSelected?: boolean; // ユーザーが選択したかどうか
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  rotation: number;
  opacity: number;
  visible: boolean;
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
}

export interface DecorationElement {
  id: string;
  type: 'icon' | 'emoji' | 'shape';
  iconId?: string; // lucide-reactのアイコンID
  emoji?: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
}

export interface ImageFilter {
  id: string;
  name: string;
  cssFilter: string;
}

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number; // 1.0 for square (Instagram)
}

export interface ImageEditState {
  imageId: string;
  textElements: TextElement[];
  decorationElements: DecorationElement[];
  cropSettings: CropSettings;
  imageFilter: ImageFilter;
  lastModified: Date;
}

export interface ImageAssignment {
  imageId: string;
  prTextIds: string[];
  layout: TextLayout;
}

export interface TextLayout {
  id: string;
  textId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  rotation: number;
  opacity: number;
  zIndex: number;
  alignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'middle' | 'bottom';
}

export interface ProcessedImage {
  id: string;
  file: File;
  originalFile: File;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  thumbnail: string; // Base64またはBlob URL
  isOptimized: boolean;
  compressionRatio?: number;
  assignment?: ImageAssignment;
  editState?: ImageEditState;
}

export interface InstagramPostText {
  id: string;
  caption: string; // 投稿文（キャプション）
  hashtags: string[]; // ハッシュタグ配列
  characterCount: number;
  hashtagCount: number;
}

export interface GeneratedPostContent {
  captions: InstagramPostText[];
  suggestedHashtags: string[];
  hashtagCategories: {
    location: string[];
    property: string[];
    lifestyle: string[];
    general: string[];
  };
}

export interface PostContent {
  id: string;
  images: ProcessedImage[];
  generatedImages: string[]; // 編集済み画像のBlob URL
  metadata: {
    totalImages: number;
    totalTexts: number;
    exportFormat: 'jpg' | 'png';
    quality: number;
    createdAt: Date;
  };
}

export interface WebAppSettings {
  autoSave: boolean;
  previewQuality: 'low' | 'medium' | 'high';
  maxFileSize: number; // MB
  compressionLevel: number; // 0-100
  // プロンプト設定
  promptSettings: PromptSettings;
}

export interface PromptSettings {
  tone: 'polite' | 'casual' | 'professional' | 'friendly';
  style: 'detailed' | 'concise' | 'creative' | 'factual';
  targetAudience: 'family' | 'investor' | 'young' | 'senior' | 'general';
  emphasis: 'location' | 'price' | 'features' | 'investment' | 'lifestyle';
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  settings: PromptSettings;
  isDefault?: boolean;
}

export interface ProjectData {
  id: string;
  propertyText: PropertyTextInput;
  generatedPRTexts: GeneratedPRText[];
  processedImages: ProcessedImage[];
  postContent?: PostContent;
  settings: WebAppSettings;
  createdAt: Date;
  updatedAt: Date;
}

export const FONT_SIZE_CONFIG = {
  min: 12,
  max: 72,
  step: 1,
  presets: [16, 24, 32, 48, 64],
  defaultSize: 32
} as const;

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 