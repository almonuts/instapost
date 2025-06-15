'use client';

import React, { useState, useCallback } from 'react';
import { Wand2, RefreshCw, CheckCircle, Tag, Star, Edit2, Check, X } from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import { useAppStore } from '@/store/app-store';
import { GeneratedPRText } from '@/types';

export const PRTextGenerator: React.FC = () => {
  const { propertyText, generatedPRTexts, setGeneratedPRTexts, updateGeneratedPRText, setGeneratedPostContent, setCurrentStep, settings } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiInput, setShowApiInput] = useState(true);
  const [selectedTexts, setSelectedTexts] = useState<Set<string>>(new Set());

  const handleApiKeySubmit = useCallback(async (apiKey: string) => {
    if (!propertyText) {
      setApiError('物件情報が入力されていません');
      return;
    }

    setIsGenerating(true);
    setApiError(null);

    try {
      const response = await fetch('/api/generate-pr-texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyText: propertyText.rawText,
          apiKey: apiKey,
          promptSettings: settings.promptSettings
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'PR文の生成に失敗しました');
      }

      if (result.success && result.data) {
        // 高優先度のテキストと概要カテゴリにisSelectedフラグを追加
        const textsWithSelection = result.data.map((text: GeneratedPRText) => ({
          ...text,
          isSelected: text.priority >= 4 || text.category === 'summary'
        }));
        
        setGeneratedPRTexts(textsWithSelection);
        
        // 投稿テキストが含まれている場合は保存
        if (result.postContent) {
          setGeneratedPostContent(result.postContent);
        }
        
        setShowApiInput(false);
        
        // 高優先度のテキストと概要カテゴリを自動選択（UIとの整合性のため）
        const selectedIds = new Set<string>(
          textsWithSelection
            .filter((text: GeneratedPRText) => text.priority >= 4 || text.category === 'summary')
            .map((text: GeneratedPRText) => text.id)
        );
        setSelectedTexts(selectedIds);
      } else {
        throw new Error('無効なレスポンス形式です');
      }
    } catch (error: unknown) {
      console.error('PR文生成エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'PR文の生成中にエラーが発生しました';
      setApiError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [propertyText, setGeneratedPRTexts, settings, setGeneratedPostContent]);

  const handleRegenerateClick = useCallback(() => {
    setShowApiInput(true);
    setApiError(null);
  }, []);

  const handleTextSelect = useCallback((textId: string) => {
    const updatedTexts = generatedPRTexts.map(text => 
      text.id === textId 
        ? { ...text, isSelected: !text.isSelected }
        : text
    );
    setGeneratedPRTexts(updatedTexts);
    
    // 旧来のselectedTextsも更新（UIとの整合性のため）
    setSelectedTexts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(textId)) {
        newSet.delete(textId);
      } else {
        newSet.add(textId);
      }
      return newSet;
    });
  }, [generatedPRTexts, setGeneratedPRTexts]);

  const handleSelectAll = useCallback(() => {
    const updatedTexts = generatedPRTexts.map(text => ({ ...text, isSelected: true }));
    setGeneratedPRTexts(updatedTexts);
    setSelectedTexts(new Set(generatedPRTexts.map(text => text.id)));
  }, [generatedPRTexts, setGeneratedPRTexts]);

  const handleDeselectAll = useCallback(() => {
    const updatedTexts = generatedPRTexts.map(text => ({ ...text, isSelected: false }));
    setGeneratedPRTexts(updatedTexts);
    setSelectedTexts(new Set());
  }, [generatedPRTexts, setGeneratedPRTexts]);

  const handleNextStep = useCallback(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'location': return '📍';
      case 'price': return '💰';
      case 'features': return '✨';
      case 'specs': return '📐';
      case 'appeal': return '🎯';
      case 'summary': return '📋';
      default: return '📝';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'location': return '立地';
      case 'price': return '価格';
      case 'features': return '設備';
      case 'specs': return '仕様';
      case 'appeal': return 'アピール';
      case 'summary': return '概要';
      default: return '一般';
    }
  };

  if (!propertyText) {
    return (
      <div className="text-center py-12">
        <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">物件情報を入力してください</h3>
        <p className="text-gray-600">
          PR文を生成するには、まず物件情報を入力する必要があります。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Wand2 className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">PR文生成</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {generatedPRTexts.length > 0 && !showApiInput && (
            <button
              onClick={handleRegenerateClick}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              再生成
            </button>
          )}
        </div>
      </div>

      {/* 物件情報表示 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">入力済み物件情報</h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
          {propertyText.rawText}
        </p>
      </div>

      {/* APIキー入力またはPR文表示 */}
      {showApiInput ? (
        <ApiKeyInput
          onApiKeySubmit={handleApiKeySubmit}
          isLoading={isGenerating}
          error={apiError}
        />
      ) : (
        <div className="space-y-6">
          {/* 選択状況とアクション */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              {selectedTexts.size}個のPR文を選択中 / 全{generatedPRTexts.length}個
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                全選択
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                全解除
              </button>
            </div>
          </div>

          {/* PR文一覧 */}
          <div className="grid gap-3">
            {generatedPRTexts.map((prText) => (
              <EditablePRTextItem
                key={prText.id}
                prText={prText}
                isSelected={selectedTexts.has(prText.id)}
                onSelect={handleTextSelect}
                onUpdate={updateGeneratedPRText}
                getCategoryIcon={getCategoryIcon}
                getCategoryName={getCategoryName}
              />
            ))}
          </div>

          {/* 次へボタン */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              選択したPR文を画像に配置します
            </div>
            <button
              onClick={handleNextStep}
              disabled={selectedTexts.size === 0}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              画像編集へ
              <Tag className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// インライン編集可能なPR文アイテムコンポーネント
interface EditablePRTextItemProps {
  prText: GeneratedPRText;
  isSelected: boolean;
  onSelect: (textId: string) => void;
  onUpdate: (textId: string, updates: Partial<GeneratedPRText>) => void;
  getCategoryIcon: (category: string) => string;
  getCategoryName: (category: string) => string;
}

const EditablePRTextItem: React.FC<EditablePRTextItemProps> = ({ 
  prText, 
  isSelected, 
  onSelect, 
  onUpdate,
  getCategoryIcon,
  getCategoryName
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(prText.text);

  // prText.textが変更されたときにeditTextを同期
  React.useEffect(() => {
    if (!isEditing) {
      setEditText(prText.text);
    }
  }, [prText.text, isEditing]);

  const handleSave = useCallback(() => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== prText.text) {
      onUpdate(prText.id, {
        text: trimmedText,
        characterCount: trimmedText.length
      });
    }
    setIsEditing(false);
  }, [editText, prText.id, prText.text, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditText(prText.text);
    setIsEditing(false);
  }, [prText.text]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  return (
    <div
      className={`group border rounded-lg p-4 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">
              {getCategoryIcon(prText.category)}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {getCategoryName(prText.category)}
            </span>
            <div className="flex items-center ml-2">
              {Array.from({ length: prText.priority }).map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-gray-900 font-medium border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {editText.length}文字
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={handleSave}
                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                    title="保存"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="キャンセル"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <p className="text-gray-900 font-medium mb-1 flex-1 cursor-pointer" onClick={() => onSelect(prText.id)}>
                  {prText.text}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded group-hover:opacity-100 opacity-0 transition-opacity"
                  title="編集"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                {prText.characterCount}文字
              </div>
            </div>
          )}
        </div>
        
        <div className="ml-4">
          {isSelected && !isEditing && (
            <CheckCircle className="w-5 h-5 text-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
}; 