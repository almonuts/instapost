import React from 'react';
import { Camera, Sun, Contrast, Palette } from 'lucide-react';

export interface ImageFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  cssFilter: string;
  preview: string;
}

const IMAGE_FILTERS: ImageFilter[] = [
  {
    id: 'none',
    name: '原画',
    icon: <Camera className="w-4 h-4" />,
    description: 'フィルターなし',
    cssFilter: 'none',
    preview: '📷'
  },
  {
    id: 'warm',
    name: 'ウォーム',
    icon: <Sun className="w-4 h-4" />,
    description: '暖かい雰囲気',
    cssFilter: 'sepia(0.3) saturate(1.2) brightness(1.1)',
    preview: '🌅'
  },
  {
    id: 'cool',
    name: 'クール',
    icon: <Palette className="w-4 h-4" />,
    description: 'クールな青み',
    cssFilter: 'hue-rotate(200deg) saturate(1.1) brightness(1.05)',
    preview: '🌊'
  },
  {
    id: 'vintage',
    name: 'ヴィンテージ',
    icon: <Camera className="w-4 h-4" />,
    description: 'レトロな風合い',
    cssFilter: 'sepia(0.5) contrast(1.2) brightness(0.9) saturate(0.8)',
    preview: '📸'
  },
  {
    id: 'bright',
    name: 'ブライト',
    icon: <Sun className="w-4 h-4" />,
    description: '明るく鮮やか',
    cssFilter: 'brightness(1.2) contrast(1.1) saturate(1.3)',
    preview: '☀️'
  },
  {
    id: 'dramatic',
    name: 'ドラマチック',
    icon: <Contrast className="w-4 h-4" />,
    description: 'コントラスト強調',
    cssFilter: 'contrast(1.4) brightness(0.95) saturate(1.2)',
    preview: '🎭'
  },
  {
    id: 'soft',
    name: 'ソフト',
    icon: <Camera className="w-4 h-4" />,
    description: '柔らかな印象',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.9) blur(0.5px)',
    preview: '🌸'
  },
  {
    id: 'monochrome',
    name: 'モノクローム',
    icon: <Contrast className="w-4 h-4" />,
    description: '白黒',
    cssFilter: 'grayscale(1) contrast(1.1)',
    preview: '⚫'
  },
  {
    id: 'pop',
    name: 'ポップ',
    icon: <Palette className="w-4 h-4" />,
    description: 'ポップで鮮やか',
    cssFilter: 'saturate(1.5) contrast(1.2) brightness(1.1) hue-rotate(10deg)',
    preview: '🎨'
  }
];

interface ImageFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: ImageFilter) => void;
  previewImage?: string;
}

export const ImageFilters: React.FC<ImageFiltersProps> = ({
  selectedFilter,
  onFilterChange,
  previewImage
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Camera className="w-4 h-4 mr-2" />
          フィルター
        </h4>
      </div>

      {/* フィルター一覧 */}
      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
        {IMAGE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter)}
            className={`group relative bg-white border-2 rounded-lg p-3 transition-all duration-200 ${
              selectedFilter === filter.id
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="text-center">
              {/* プレビュー */}
              <div className="w-full h-12 mb-2 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={filter.name}
                    className="w-full h-full object-cover"
                    style={{ filter: filter.cssFilter }}
                  />
                ) : (
                  <span className="text-lg">{filter.preview}</span>
                )}
              </div>
              
              {/* フィルター名 */}
              <div className="text-xs font-medium text-gray-900 mb-1">
                {filter.name}
              </div>
              
              {/* 説明 */}
              <div className="text-xs text-gray-500">
                {filter.description}
              </div>
            </div>
            
            {/* 選択状態のインジケーター */}
            {selectedFilter === filter.id && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}; 