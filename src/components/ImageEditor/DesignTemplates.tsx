import React from 'react';
import { Palette, Sparkles, Heart, Star, Circle, Square } from 'lucide-react';

interface DesignTemplate {
  id: string;
  name: string;
  category: 'modern' | 'vintage' | 'minimal' | 'bold' | 'cute';
  preview: string;
  textStyles: {
    title?: {
      fontSize: number;
      fontFamily: string;
      color: string;
      backgroundColor?: string;
      position: { x: number; y: number };
    };
    subtitle?: {
      fontSize: number;
      fontFamily: string;
      color: string;
      backgroundColor?: string;
      position: { x: number; y: number };
    };
  };
  backgroundStyle?: {
    type: 'solid' | 'gradient';
    colors: string[];
  };
  decorations?: Array<{
    type: 'icon' | 'shape';
    icon?: React.ReactNode;
    position: { x: number; y: number };
    size: number;
    color: string;
  }>;
}

const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'モダンミニマル',
    category: 'modern',
    preview: '🎨',
    textStyles: {
      title: {
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#1F2937',
        position: { x: 200, y: 100 }
      },
      subtitle: {
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#6B7280',
        position: { x: 200, y: 300 }
      }
    }
  },
  {
    id: 'vintage-warm',
    name: 'ヴィンテージ',
    category: 'vintage',
    preview: '📸',
    textStyles: {
      title: {
        fontSize: 44,
        fontFamily: 'Georgia',
        color: '#92400E',
        backgroundColor: 'rgba(254, 243, 199, 0.8)',
        position: { x: 200, y: 120 }
      },
      subtitle: {
        fontSize: 28,
        fontFamily: 'Georgia',
        color: '#451A03',
        position: { x: 200, y: 280 }
      }
    },
    backgroundStyle: {
      type: 'gradient',
      colors: ['#FEF3C7', '#F59E0B']
    }
  },
  {
    id: 'bold-impact',
    name: 'インパクト',
    category: 'bold',
    preview: '💥',
    textStyles: {
      title: {
        fontSize: 52,
        fontFamily: 'Impact',
        color: '#FFFFFF',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        position: { x: 200, y: 150 }
      },
      subtitle: {
        fontSize: 32,
        fontFamily: 'Arial Black',
        color: '#1F2937',
        position: { x: 200, y: 250 }
      }
    }
  },
  {
    id: 'cute-pastel',
    name: 'キュートパステル',
    category: 'cute',
    preview: '🌸',
    textStyles: {
      title: {
        fontSize: 40,
        fontFamily: 'Comic Sans MS',
        color: '#EC4899',
        backgroundColor: 'rgba(252, 231, 243, 0.8)',
        position: { x: 200, y: 130 }
      },
      subtitle: {
        fontSize: 26,
        fontFamily: 'Comic Sans MS',
        color: '#7C3AED',
        position: { x: 200, y: 270 }
      }
    },
    decorations: [
      { type: 'icon', icon: <Heart />, position: { x: 50, y: 50 }, size: 24, color: '#F472B6' },
      { type: 'icon', icon: <Star />, position: { x: 350, y: 80 }, size: 20, color: '#A78BFA' },
      { type: 'icon', icon: <Heart />, position: { x: 80, y: 320 }, size: 18, color: '#FB7185' }
    ]
  },
  {
    id: 'minimal-clean',
    name: 'クリーンミニマル',
    category: 'minimal',
    preview: '✨',
    textStyles: {
      title: {
        fontSize: 36,
        fontFamily: 'Helvetica',
        color: '#374151',
        position: { x: 200, y: 180 }
      },
      subtitle: {
        fontSize: 20,
        fontFamily: 'Helvetica',
        color: '#9CA3AF',
        position: { x: 200, y: 220 }
      }
    },
    decorations: [
      { type: 'shape', position: { x: 50, y: 180 }, size: 4, color: '#3B82F6' },
      { type: 'shape', position: { x: 350, y: 180 }, size: 4, color: '#3B82F6' }
    ]
  }
];

interface DesignTemplatesProps {
  onApplyTemplate: (template: DesignTemplate) => void;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

export const DesignTemplates: React.FC<DesignTemplatesProps> = ({
  onApplyTemplate,
  selectedCategory = 'all',
  onCategoryChange
}) => {
  const categories = [
    { id: 'all', name: '全て', icon: <Palette className="w-4 h-4" /> },
    { id: 'modern', name: 'モダン', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'vintage', name: 'ヴィンテージ', icon: <Circle className="w-4 h-4" /> },
    { id: 'minimal', name: 'ミニマル', icon: <Square className="w-4 h-4" /> },
    { id: 'bold', name: 'インパクト', icon: <Star className="w-4 h-4" /> },
    { id: 'cute', name: 'キュート', icon: <Heart className="w-4 h-4" /> }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? DESIGN_TEMPLATES 
    : DESIGN_TEMPLATES.filter(template => template.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          デザインテンプレート
        </h4>
      </div>

      {/* カテゴリータブ */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.icon}
            <span className="ml-1 hidden sm:inline">{category.name}</span>
          </button>
        ))}
      </div>

      {/* テンプレート一覧 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onApplyTemplate(template)}
            className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{template.preview}</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                {template.name}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {template.category}
              </div>
            </div>
            
            {/* ホバー時のオーバーレイ */}
            <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200" />
            
            {/* 適用ボタン */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">
                適用
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Palette className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">選択したカテゴリーにテンプレートがありません</p>
        </div>
      )}
    </div>
  );
}; 