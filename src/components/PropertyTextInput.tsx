'use client';

import React, { useState, useCallback } from 'react';
import { Save, FileText, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { PropertyTextInput as PropertyTextInputType } from '@/types';

export const PropertyTextInput: React.FC = () => {
  const { propertyText, setPropertyText, setCurrentStep } = useAppStore();
  const [currentText, setCurrentText] = useState(propertyText?.rawText || '');
  const [characterCount, setCharacterCount] = useState(currentText.length);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCurrentText(text);
    setCharacterCount(text.length);
  }, []);

  const handleSave = useCallback(() => {
    if (currentText.trim()) {
      const propertyTextData: PropertyTextInputType = {
        rawText: currentText.trim(),
        characterCount: currentText.length
      };
      setPropertyText(propertyTextData);
      setCurrentStep(3); // 次のステップへ自動進行
    }
  }, [currentText, setPropertyText, setCurrentStep]);

  const handleClear = useCallback(() => {
    setCurrentText('');
    setCharacterCount(0);
  }, []);

  // サンプルテキスト
  const sampleTexts = [
    {
      title: "新築マンション",
      text: "新築分譲マンション\n駅徒歩3分、南向き、3LDK\n価格：4,800万円\n間取り：75㎡\n設備：オートロック、宅配ボックス、床暖房\n周辺：スーパー徒歩1分、小学校徒歩5分"
    },
    {
      title: "中古戸建て",
      text: "築10年戸建て住宅\n4LDK、駐車場2台\n価格：3,200万円\n土地面積：150㎡、建物面積：110㎡\nリフォーム済み、太陽光パネル設置済み\n閑静な住宅街、公園近く"
    },
    {
      title: "投資物件",
      text: "投資用ワンルームマンション\n駅徒歩5分、築5年\n価格：1,800万円\n想定利回り：6.2%\n管理費・修繕積立金込み\n入居者募集中、サブリース対応可能"
    }
  ];

  const insertSampleText = useCallback((text: string) => {
    setCurrentText(text);
    setCharacterCount(text.length);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">物件情報入力</h3>
        </div>
        
        <div className="space-y-4">
          {/* テキストエリア */}
          <div>
            <label htmlFor="property-text" className="block text-sm font-medium text-gray-700 mb-2">
              物件の詳細情報を入力してください
            </label>
            <textarea
              id="property-text"
              value={currentText}
              onChange={handleTextChange}
              placeholder="例：新築分譲マンション、駅徒歩3分、3LDK、価格4800万円、南向き、オートロック付き..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={2000}
            />
            
            {/* 文字数表示 */}
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">
                最大2,000文字まで入力可能
              </div>
              <div className={`text-sm ${characterCount > 1800 ? 'text-red-600' : 'text-gray-600'}`}>
                {characterCount}/2,000
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={!currentText}
            >
              クリア
            </button>
            
            <button
              onClick={handleSave}
              disabled={!currentText.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              保存して次へ
            </button>
          </div>
        </div>
      </div>

      {/* 入力のヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Lightbulb className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">入力のヒント</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 物件の種類（マンション、戸建て、土地など）</li>
              <li>• 価格・間取り・面積</li>
              <li>• 立地・交通アクセス</li>
              <li>• 設備・特徴</li>
              <li>• 周辺環境</li>
            </ul>
          </div>
        </div>
      </div>

      {/* サンプルテキスト */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">サンプルテキスト</h4>
        <div className="grid gap-3">
          {sampleTexts.map((sample, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-md p-3">
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-sm font-medium text-gray-800">{sample.title}</h5>
                <button
                  onClick={() => insertSampleText(sample.text)}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded px-2 py-1 transition-colors"
                >
                  使用
                </button>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {sample.text.replace(/\n/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 保存済みデータ表示 */}
      {propertyText && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">保存済み物件情報</h4>
          <p className="text-sm text-green-800 whitespace-pre-wrap">
            {propertyText.rawText}
          </p>
          <div className="text-xs text-green-600 mt-2">
            文字数: {propertyText.characterCount}文字
          </div>
        </div>
      )}
    </div>
  );
}; 