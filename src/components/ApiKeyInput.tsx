'use client';

import React, { useState, useCallback } from 'react';
import { Key, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySubmit,
  isLoading = false,
  error = null
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateApiKey = useCallback((key: string) => {
    // OpenAI APIキーの基本的なフォーマット検証
    const openaiKeyPattern = /^sk-[a-zA-Z0-9]{48}$/;
    return openaiKeyPattern.test(key);
  }, []);

  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setApiKey(value);
    setIsValid(validateApiKey(value));
  }, [validateApiKey]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onApiKeySubmit(apiKey);
    }
  }, [apiKey, isValid, isLoading, onApiKeySubmit]);

  const toggleShowApiKey = useCallback(() => {
    setShowApiKey(prev => !prev);
  }, []);

  const maskApiKey = (key: string) => {
    if (key.length < 10) return key;
    return `${key.substring(0, 7)}${'*'.repeat(key.length - 14)}${key.substring(key.length - 7)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Key className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">OpenAI APIキー入力</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">セキュリティについて</p>
              <ul className="space-y-1 text-xs">
                <li>• APIキーはセッション中のみ使用され、保存されません</li>
                <li>• 通信は暗号化されています</li>
                <li>• ページを離れるとAPIキーは自動的に削除されます</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI APIキー
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`w-full px-3 py-2 pr-20 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error ? 'border-red-300' : isValid ? 'border-green-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                {isValid && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <button
                  type="button"
                  onClick={toggleShowApiKey}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            {apiKey && !showApiKey && (
              <div className="mt-1 text-xs text-gray-500">
                表示中: {maskApiKey(apiKey)}
              </div>
            )}
            
            {error && (
              <div className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              APIキーは <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                OpenAI Platform
              </a> で取得できます
            </div>
            
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  処理中...
                </>
              ) : (
                'PR文を生成'
              )}
            </button>
          </div>
        </form>

        <div className="text-xs text-gray-500 space-y-1">
          <p>ℹ️ APIキーの形式: sk-で始まる48文字の英数字</p>
          <p>ℹ️ 生成されるPR文の数により、約0.01〜0.05ドルの費用が発生します</p>
        </div>
      </div>
    </div>
  );
}; 