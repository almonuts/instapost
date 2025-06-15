import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GeneratedPRText, PromptSettings, InstagramPostText, GeneratedPostContent } from '@/types';
import { generatePromptFromSettings } from '@/lib/prompt-templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyText, apiKey, promptSettings } = body;

    // 入力検証
    if (!propertyText || typeof propertyText !== 'string') {
      return NextResponse.json(
        { error: '物件情報が必要です' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'APIキーが必要です' },
        { status: 400 }
      );
    }

    // APIキーのフォーマット検証
    const openaiKeyPattern = /^sk-[a-zA-Z0-9]{48}$/;
    if (!openaiKeyPattern.test(apiKey)) {
      return NextResponse.json(
        { error: '無効なAPIキー形式です' },
        { status: 400 }
      );
    }

    // プロンプト設定のデフォルト値
    const defaultPromptSettings: PromptSettings = {
      tone: 'professional',
      style: 'detailed', 
      targetAudience: 'general',
      emphasis: 'features'
    };

    const settings = promptSettings || defaultPromptSettings;
    
    console.log('Received prompt settings:', settings);

    // OpenAI クライアント初期化（リクエスト毎に新しいインスタンス）
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // プロンプト設定に基づいてプロンプトを生成
    const { systemPrompt, userPrompt } = generatePromptFromSettings(
      settings,
      propertyText
    );

    console.log('Generated prompts:', { systemPrompt, userPrompt });

    // OpenAI API呼び出し
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    }, {
      timeout: 30000 // 30秒のタイムアウト
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'OpenAIからのレスポンスが空です' },
        { status: 500 }
      );
    }

    // JSONパース
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'OpenAIのレスポンス形式が無効です' },
        { status: 500 }
      );
    }

    // PR文データの変換
    if (!parsed.prTexts || !Array.isArray(parsed.prTexts)) {
      return NextResponse.json(
        { error: 'PR文データが見つかりません' },
        { status: 500 }
      );
    }

    const generatedPRTexts: GeneratedPRText[] = parsed.prTexts.map((text: any, index: number) => ({
      id: `pr_${Date.now()}_${index}`,
      text: text.text || '',
      category: text.category || 'general',
      priority: text.priority || 1,
      characterCount: (text.text || '').length
    }));

    // 投稿テキストデータの変換（もし含まれている場合）
    let generatedPostContent: GeneratedPostContent | null = null;
    
    if (parsed.postContent) {
      const captions: InstagramPostText[] = (parsed.postContent.captions || []).map((caption: any, index: number) => ({
        id: `caption_${Date.now()}_${index}`,
        caption: caption.text || '',
        hashtags: caption.hashtags || [],
        characterCount: (caption.text || '').length,
        hashtagCount: (caption.hashtags || []).length
      }));

      generatedPostContent = {
        captions,
        suggestedHashtags: parsed.postContent.suggestedHashtags || [],
        hashtagCategories: {
          location: parsed.postContent.hashtagCategories?.location || [],
          property: parsed.postContent.hashtagCategories?.property || [],
          lifestyle: parsed.postContent.hashtagCategories?.lifestyle || [],
          general: parsed.postContent.hashtagCategories?.general || []
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: generatedPRTexts,
      postContent: generatedPostContent,
      usage: response.usage
    });

  } catch (error: any) {
    console.error('PR文生成エラー:', error);

    // OpenAI固有のエラーハンドリング
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'APIキーが無効です。正しいOpenAI APIキーを入力してください。' },
        { status: 401 }
      );
    } else if (error.status === 429) {
      return NextResponse.json(
        { error: 'APIの利用制限に達しています。しばらくしてから再試行してください。' },
        { status: 429 }
      );
    } else if (error.status === 402) {
      return NextResponse.json(
        { error: 'OpenAIアカウントの残高が不足しています。' },
        { status: 402 }
      );
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
      return NextResponse.json(
        { error: 'ネットワークエラーが発生しました。インターネット接続を確認してください。' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'PR文の生成中にエラーが発生しました。再試行してください。' },
      { status: 500 }
    );
  }
} 