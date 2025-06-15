'use client';

import React, { useEffect } from 'react';
import { StepNavigation } from '@/components/StepNavigation';
import { InstagramPostPreview } from '@/components/InstagramPostPreview';
import { ImageUploader } from '@/components/ImageUploader';
import { PropertyTextInput } from '@/components/PropertyTextInput';
import { PRTextGenerator } from '@/components/PRTextGenerator';
import { PostContentGenerator } from '@/components/PostContentGenerator';
import { ImageEditor } from '@/components/ImageEditor';
import { DownloadSection } from '@/components/DownloadSection';
import { useAppStore } from '@/store/app-store';
import { Instagram, Zap } from 'lucide-react';

export default function HomePage() {
  const { currentStep, error, isHydrated, setHydrated } = useAppStore();

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  const getStepConfig = () => {
    switch (currentStep) {
      case 1:
        return {
          title: '画像をアップロード',
          description: '物件写真を選択してください',
          component: <ImageUploader />
        };
      case 2:
        return {
          title: '物件情報を入力',
          description: '基本情報を入力してAI生成の準備をします',
          component: <PropertyTextInput />
        };
      case 3:
        return {
          title: 'AI コンテンツ生成',
          description: '画像テキストと投稿キャプションを生成します',
          component: (
            <div className="space-y-8">
              <PRTextGenerator />
              <PostContentGenerator />
            </div>
          )
        };
      case 4:
        return {
          title: '画像編集',
          description: 'テキストの配置とデザインを調整します',
          component: <ImageEditor />
        };
      case 5:
        return {
          title: 'ダウンロード',
          description: '完成した投稿画像をダウンロードします',
          component: <DownloadSection />
        };
      default:
        return {
          title: '開始',
          description: '投稿作成を始めましょう',
          component: <ImageUploader />
        };
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  const stepConfig = getStepConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">InstaPost Creator</h1>
                <p className="text-sm text-gray-600">不動産投稿作成ツール</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* ステップナビゲーション */}
      <StepNavigation />

      {/* エラー表示 */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* メインワークエリア */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
              {/* ステップヘッダー */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold">
                    {currentStep}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">{stepConfig.title}</h2>
                </div>
                <p className="text-gray-600 ml-11">{stepConfig.description}</p>
              </div>

              {/* ステップコンテンツ */}
              <div className="min-h-[400px]">
                {stepConfig.component}
              </div>
            </div>
          </div>

          {/* サイドバー プレビュー */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <InstagramPostPreview currentStep={currentStep} />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-16 py-8 border-t border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 InstaPost Creator - Powered by AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
