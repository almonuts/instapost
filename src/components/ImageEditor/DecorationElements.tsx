import React from 'react';
import { 
  Heart, Star, Circle, Square, Triangle, Zap, 
  Sparkles, Sun, Moon, Cloud, Flame, Snowflake,
  Music, Coffee, Camera, Gift, Crown, Diamond
} from 'lucide-react';

export interface DecorationElement {
  id: string;
  name: string;
  type: 'icon' | 'emoji' | 'shape';
  icon?: React.ReactNode;
  emoji?: string;
  category: 'basic' | 'nature' | 'objects' | 'symbols' | 'shapes';
  defaultSize: number;
  defaultColor: string;
}

const DECORATION_ELEMENTS: DecorationElement[] = [
  // Basic Icons
  {
    id: 'heart',
    name: 'ハート',
    type: 'icon',
    icon: <Heart className="w-full h-full" />,
    category: 'basic',
    defaultSize: 24,
    defaultColor: '#EF4444'
  },
  {
    id: 'star',
    name: '星',
    type: 'icon',
    icon: <Star className="w-full h-full" />,
    category: 'basic',
    defaultSize: 24,
    defaultColor: '#F59E0B'
  },
  {
    id: 'sparkles',
    name: 'キラキラ',
    type: 'icon',
    icon: <Sparkles className="w-full h-full" />,
    category: 'basic',
    defaultSize: 24,
    defaultColor: '#8B5CF6'
  },
  {
    id: 'zap',
    name: '稲妻',
    type: 'icon',
    icon: <Zap className="w-full h-full" />,
    category: 'basic',
    defaultSize: 24,
    defaultColor: '#EAB308'
  },
  
  // Nature
  {
    id: 'sun',
    name: '太陽',
    type: 'icon',
    icon: <Sun className="w-full h-full" />,
    category: 'nature',
    defaultSize: 28,
    defaultColor: '#F59E0B'
  },
  {
    id: 'moon',
    name: '月',
    type: 'icon',
    icon: <Moon className="w-full h-full" />,
    category: 'nature',
    defaultSize: 24,
    defaultColor: '#6B7280'
  },
  {
    id: 'cloud',
    name: '雲',
    type: 'icon',
    icon: <Cloud className="w-full h-full" />,
    category: 'nature',
    defaultSize: 28,
    defaultColor: '#94A3B8'
  },
  {
    id: 'flame',
    name: '炎',
    type: 'icon',
    icon: <Flame className="w-full h-full" />,
    category: 'nature',
    defaultSize: 24,
    defaultColor: '#DC2626'
  },
  {
    id: 'snowflake',
    name: '雪',
    type: 'icon',
    icon: <Snowflake className="w-full h-full" />,
    category: 'nature',
    defaultSize: 24,
    defaultColor: '#60A5FA'
  },
  
  // Objects
  {
    id: 'music',
    name: '音楽',
    type: 'icon',
    icon: <Music className="w-full h-full" />,
    category: 'objects',
    defaultSize: 24,
    defaultColor: '#8B5CF6'
  },
  {
    id: 'coffee',
    name: 'コーヒー',
    type: 'icon',
    icon: <Coffee className="w-full h-full" />,
    category: 'objects',
    defaultSize: 24,
    defaultColor: '#92400E'
  },
  {
    id: 'camera',
    name: 'カメラ',
    type: 'icon',
    icon: <Camera className="w-full h-full" />,
    category: 'objects',
    defaultSize: 24,
    defaultColor: '#374151'
  },
  {
    id: 'gift',
    name: 'ギフト',
    type: 'icon',
    icon: <Gift className="w-full h-full" />,
    category: 'objects',
    defaultSize: 24,
    defaultColor: '#DC2626'
  },
  
  // Symbols
  {
    id: 'crown',
    name: '王冠',
    type: 'icon',
    icon: <Crown className="w-full h-full" />,
    category: 'symbols',
    defaultSize: 24,
    defaultColor: '#F59E0B'
  },
  {
    id: 'diamond',
    name: 'ダイヤモンド',
    type: 'icon',
    icon: <Diamond className="w-full h-full" />,
    category: 'symbols',
    defaultSize: 24,
    defaultColor: '#60A5FA'
  },
  
  // Shapes
  {
    id: 'circle',
    name: '円',
    type: 'icon',
    icon: <Circle className="w-full h-full" />,
    category: 'shapes',
    defaultSize: 32,
    defaultColor: '#3B82F6'
  },
  {
    id: 'square',
    name: '四角',
    type: 'icon',
    icon: <Square className="w-full h-full" />,
    category: 'shapes',
    defaultSize: 32,
    defaultColor: '#10B981'
  },
  {
    id: 'triangle',
    name: '三角',
    type: 'icon',
    icon: <Triangle className="w-full h-full" />,
    category: 'shapes',
    defaultSize: 32,
    defaultColor: '#F59E0B'
  },
  
  // Emoji decorations
  {
    id: 'emoji-fire',
    name: '火',
    type: 'emoji',
    emoji: '🔥',
    category: 'symbols',
    defaultSize: 32,
    defaultColor: '#DC2626'
  },
  {
    id: 'emoji-rocket',
    name: 'ロケット',
    type: 'emoji',
    emoji: '🚀',
    category: 'symbols',
    defaultSize: 32,
    defaultColor: '#3B82F6'
  },
  {
    id: 'emoji-party',
    name: 'パーティー',
    type: 'emoji',
    emoji: '🎉',
    category: 'symbols',
    defaultSize: 32,
    defaultColor: '#F59E0B'
  },
  {
    id: 'emoji-100',
    name: '100点',
    type: 'emoji',
    emoji: '💯',
    category: 'symbols',
    defaultSize: 32,
    defaultColor: '#DC2626'
  }
];

interface DecorationElementsProps {
  onAddDecoration: (element: DecorationElement) => void;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

export const DecorationElements: React.FC<DecorationElementsProps> = ({
  onAddDecoration,
  selectedCategory = 'all',
  onCategoryChange
}) => {
  const categories = [
    { id: 'all', name: '全て', icon: '🎨' },
    { id: 'basic', name: 'ベーシック', icon: '⭐' },
    { id: 'nature', name: '自然', icon: '🌿' },
    { id: 'objects', name: 'オブジェクト', icon: '📷' },
    { id: 'symbols', name: 'シンボル', icon: '👑' },
    { id: 'shapes', name: '図形', icon: '🔷' }
  ];

  const filteredElements = selectedCategory === 'all' 
    ? DECORATION_ELEMENTS 
    : DECORATION_ELEMENTS.filter(element => element.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          装飾要素
        </h4>
      </div>

      {/* カテゴリータブ */}
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* 装飾要素一覧 */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
        {filteredElements.map((element) => (
          <button
            key={element.id}
            onClick={() => onAddDecoration(element)}
            className="group relative bg-white border border-gray-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-sm transition-all duration-200 aspect-square flex items-center justify-center"
            title={element.name}
          >
            <div className="w-6 h-6 flex items-center justify-center" style={{ color: element.defaultColor }}>
              {element.type === 'emoji' ? (
                <span className="text-lg">{element.emoji}</span>
              ) : (
                element.icon
              )}
            </div>
            
            {/* ホバー時のツールチップ */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {element.name}
            </div>
          </button>
        ))}
      </div>

      {filteredElements.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">選択したカテゴリーに要素がありません</p>
        </div>
      )}
    </div>
  );
}; 