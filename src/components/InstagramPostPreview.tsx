'use client';

import React from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

interface InstagramPostPreviewProps {
  currentStep: number;
}

export const InstagramPostPreview: React.FC<InstagramPostPreviewProps> = ({ currentStep }) => {
  const { processedImages, generatedPRTexts, generatedPostContent } = useAppStore();

  const selectedPRTexts = generatedPRTexts.filter(text => text.isSelected);
  const mainImage = processedImages.length > 0 ? processedImages[0] : null;
  const mainCaption = generatedPostContent?.captions[0];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 sticky top-32">
      {/* ヘッダー */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900">プレビュー</h3>
        <p className="text-xs text-gray-500">Instagram投稿</p>
      </div>

      {/* Instagram投稿モックアップ */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
        {/* プロフィールヘッダー */}
        <div className="flex items-center p-3 border-b border-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">不</span>
          </div>
          <div className="ml-2">
            <div className="font-semibold text-xs">realestate_pro</div>
          </div>
        </div>

        {/* メイン画像エリア */}
        <div className="relative aspect-square bg-gray-50">
          {mainImage ? (
            <div className="relative w-full h-full">
              <img
                src={mainImage.thumbnail}
                alt="物件画像"
                className="w-full h-full object-cover"
              />
              
              {/* オーバーレイテキスト */}
              {selectedPRTexts.length > 0 && (
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  {selectedPRTexts.slice(0, 2).map((text, index) => (
                    <div
                      key={text.id}
                      className="bg-black/70 text-white px-2 py-1 rounded mb-1 text-xs font-medium"
                    >
                      {text.text.length > 40 ? `${text.text.substring(0, 40)}...` : text.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                  📸
                </div>
                <span className="text-xs">画像なし</span>
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Heart className="w-4 h-4 text-gray-400" />
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <Send className="w-4 h-4 text-gray-400" />
            </div>
            <Bookmark className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* キャプション */}
        <div className="p-3">
          <div className="text-xs">
            <span className="font-semibold">realestate_pro</span>
            {mainCaption ? (
              <div className="mt-1">
                <p className="text-gray-800 text-xs leading-relaxed mb-2">
                  {mainCaption.caption.length > 80 
                    ? `${mainCaption.caption.substring(0, 80)}...` 
                    : mainCaption.caption
                  }
                </p>
                <div className="flex flex-wrap gap-1">
                  {mainCaption.hashtags.slice(0, 3).map((hashtag, index) => (
                    <span key={index} className="text-blue-600 text-xs">
                      {hashtag}
                    </span>
                  ))}
                  {mainCaption.hashtags.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{mainCaption.hashtags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-xs mt-1">
                投稿テキストを生成中...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ステータス */}
      <div className="mt-4">
        <div className="text-xs text-gray-500 mb-2">作成状況</div>
        <div className="space-y-2">
          <div className={`flex items-center justify-between text-xs p-2 rounded-lg ${
            processedImages.length > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
          }`}>
            <span>画像</span>
            {processedImages.length > 0 ? '✓' : '○'}
          </div>
          
          <div className={`flex items-center justify-between text-xs p-2 rounded-lg ${
            selectedPRTexts.length > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
          }`}>
            <span>画像テキスト</span>
            {selectedPRTexts.length > 0 ? `✓ ${selectedPRTexts.length}個` : '○'}
          </div>
          
          <div className={`flex items-center justify-between text-xs p-2 rounded-lg ${
            mainCaption ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
          }`}>
            <span>キャプション</span>
            {mainCaption ? '✓' : '○'}
          </div>
        </div>
      </div>

      {/* 現在のステップ表示 */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
        <div className="text-center">
          <div className="text-xs font-medium text-purple-900 mb-1">
            {getCurrentStepTitle(currentStep)}
          </div>
          <div className="text-xs text-purple-700">
            ステップ {currentStep} / 5
          </div>
        </div>
      </div>
    </div>
  );
};

const getCurrentStepTitle = (step: number): string => {
  switch (step) {
    case 1: return '画像をアップロード中';
    case 2: return '物件情報を入力中';
    case 3: return 'AIコンテンツ生成中';
    case 4: return '画像編集中';
    case 5: return 'ダウンロード準備完了';
    default: return '作成中';
  }
}; 