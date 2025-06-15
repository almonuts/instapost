import OpenAI from 'openai';
import { GeneratedPRText } from '@/types';

// Note: 現在はAPIルート経由でOpenAIを使用しているため、
// このファイルは将来的な拡張のために残しています

export async function generatePRTexts(propertyText: string, apiKey: string): Promise<GeneratedPRText[]> {
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const prompt = `
以下の不動産物件情報から、Instagram投稿用のPR文を20種類程度生成してください。
各PR文は以下の条件に従ってください：

1. 文字数は15〜50文字程度
2. 物件の魅力を簡潔に表現
3. 以下のカテゴリに分類：location, price, features, specs, appeal, general
4. 重要度を1〜5で評価（5が最重要）

物件情報：
${propertyText}

出力は以下のJSON形式でお願いします：
{
  "prTexts": [
    {
      "text": "PR文のテキスト",
      "category": "location|price|features|specs|appeal|general",
      "priority": 1-5の数値
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'あなたは不動産マーケティングの専門家です。魅力的でキャッチーなPR文を作成することが得意です。日本語で回答してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response is empty');
    }

    const parsed = JSON.parse(content);
    
    return parsed.prTexts.map((text: any, index: number) => ({
      id: `pr_${Date.now()}_${index}`,
      text: text.text,
      category: text.category,
      priority: text.priority,
      characterCount: text.text.length
    }));
  } catch (error) {
    console.error('Error generating PR texts:', error);
    throw new Error('PR文の生成に失敗しました');
  }
} 