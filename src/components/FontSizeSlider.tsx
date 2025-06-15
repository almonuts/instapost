'use client';

import React from 'react';
import { FONT_SIZE_CONFIG } from '@/types';

interface FontSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  previewText?: string;
  className?: string;
}

export const FontSizeSlider: React.FC<FontSizeSliderProps> = ({
  value,
  onChange,
  min = FONT_SIZE_CONFIG.min,
  max = FONT_SIZE_CONFIG.max,
  step = FONT_SIZE_CONFIG.step,
  previewText = "サンプルテキスト",
  className = ""
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(e.target.value);
    if (inputValue >= min && inputValue <= max) {
      onChange(inputValue);
    }
  };

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          フォントサイズ
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">px</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* スライダー */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        
        {/* 最小・最大値表示 */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{min}px</span>
          <span>{max}px</span>
        </div>
      </div>

      {/* プリセット値 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">クイック設定</div>
        <div className="flex space-x-2">
          {FONT_SIZE_CONFIG.presets.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                value === preset
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {preset}px
            </button>
          ))}
        </div>
      </div>

      {/* プレビュー */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-sm font-medium text-gray-700 mb-2">プレビュー</div>
        <div
          style={{ fontSize: `${value}px` }}
          className="font-sans text-gray-900 break-words"
        >
          {previewText}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider:focus::-webkit-slider-thumb {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .slider:focus::-moz-range-thumb {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
}; 