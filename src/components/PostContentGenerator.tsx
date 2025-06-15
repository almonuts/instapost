'use client';

import React, { useState, useCallback } from 'react';
import { MessageSquare, Hash, Copy, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { InstagramPostText } from '@/types';

export const PostContentGenerator: React.FC = () => {
  const { generatedPostContent, updateInstagramPostText } = useAppStore();
  const [expandedCaptions, setExpandedCaptions] = useState<Set<string>>(new Set());
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [selectedHashtagCategory, setSelectedHashtagCategory] = useState<string>('all');

  const toggleCaptionExpansion = useCallback((captionId: string) => {
    setExpandedCaptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(captionId)) {
        newSet.delete(captionId);
      } else {
        newSet.add(captionId);
      }
      return newSet;
    });
  }, []);

  const startEditingCaption = useCallback((caption: InstagramPostText) => {
    setEditingCaption(caption.id);
    setEditText(caption.caption);
  }, []);

  const saveCaption = useCallback(() => {
    if (editingCaption && editText.trim()) {
      updateInstagramPostText(editingCaption, {
        caption: editText.trim(),
        characterCount: editText.trim().length
      });
    }
    setEditingCaption(null);
    setEditText('');
  }, [editingCaption, editText, updateInstagramPostText]);

  const cancelEditing = useCallback(() => {
    setEditingCaption(null);
    setEditText('');
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // トーストメッセージなどを表示
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  }, []);

  const copyFullPost = useCallback(async (caption: InstagramPostText) => {
    const fullText = `${caption.caption}\n\n${caption.hashtags.join(' ')}`;
    await copyToClipboard(fullText);
  }, [copyToClipboard]);

  if (!generatedPostContent || !generatedPostContent.captions.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">投稿テキストが生成されていません</h3>
          <p className="text-sm text-gray-600">
            PR文生成時に投稿テキストとハッシュタグも自動生成されます
          </p>
        </div>
      </div>
    );
  }

  const getFilteredHashtags = () => {
    if (selectedHashtagCategory === 'all') {
      return generatedPostContent.suggestedHashtags;
    }
    return generatedPostContent.hashtagCategories[selectedHashtagCategory as keyof typeof generatedPostContent.hashtagCategories] || [];
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">投稿テキスト</h3>
        </div>
        <div className="text-sm text-gray-600">
          {generatedPostContent.captions.length}個のキャプション
        </div>
      </div>

      {/* キャプション一覧 */}
      <div className="space-y-4">
        {generatedPostContent.captions.map((caption, index) => (
          <div key={caption.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">キャプション {index + 1}</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {caption.characterCount}文字
                </span>
                <button
                  onClick={() => copyFullPost(caption)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="キャプション + ハッシュタグをコピー"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEditingCaption(caption)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleCaptionExpansion(caption.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {expandedCaptions.has(caption.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* キャプション表示/編集 */}
            {editingCaption === caption.id ? (
              <div className="space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  rows={6}
                  maxLength={300}
                  placeholder="投稿用キャプションを入力..."
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {editText.length}/300文字
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveCaption}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      保存
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      <X className="w-3 h-3 mr-1" />
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className={`text-gray-800 text-sm leading-relaxed ${
                  expandedCaptions.has(caption.id) ? '' : 'line-clamp-3'
                }`}>
                  {caption.caption}
                </p>
                
                {/* ハッシュタグ */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center mb-2">
                    <Hash className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-xs font-medium text-gray-700">
                      ハッシュタグ ({caption.hashtagCount}個)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {caption.hashtags.map((hashtag, hashIndex) => (
                      <span
                        key={hashIndex}
                        onClick={() => copyToClipboard(hashtag)}
                        className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ハッシュタグライブラリ */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Hash className="w-4 h-4 mr-2" />
            ハッシュタグライブラリ
          </h4>
          <select
            value={selectedHashtagCategory}
            onChange={(e) => setSelectedHashtagCategory(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">すべて</option>
            <option value="location">立地</option>
            <option value="property">物件</option>
            <option value="lifestyle">ライフスタイル</option>
            <option value="general">一般</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {getFilteredHashtags().map((hashtag, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(hashtag)}
              className="inline-block px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
              title="クリックでコピー"
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 