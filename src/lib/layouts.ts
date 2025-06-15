import { TextLayout } from '@/types';

// 後方互換性のため、旧形式のレイアウト定義を維持しつつ新形式にマッピング
export const defaultLayouts: TextLayout[] = [
  {
    id: 'layout-bottom-center',
    textId: '', // 動的に設定される
    x: 100,
    y: 400,
    width: 400,
    height: 100,
    fontSize: 32,
    fontFamily: 'Noto Sans JP',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    alignment: 'center',
    verticalAlignment: 'bottom'
  },
  {
    id: 'layout-top-left',
    textId: '',
    x: 50,
    y: 50,
    width: 300,
    height: 120,
    fontSize: 28,
    fontFamily: 'Noto Sans JP',
    color: '#333333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    alignment: 'left',
    verticalAlignment: 'top'
  },
  {
    id: 'layout-center-overlay',
    textId: '',
    x: 150,
    y: 200,
    width: 350,
    height: 150,
    fontSize: 36,
    fontFamily: 'Noto Sans JP',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    alignment: 'center',
    verticalAlignment: 'middle'
  },
  {
    id: 'layout-right-sidebar',
    textId: '',
    x: 400,
    y: 100,
    width: 150,
    height: 300,
    fontSize: 24,
    fontFamily: 'Noto Sans JP',
    color: '#333333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    alignment: 'left',
    verticalAlignment: 'top'
  },
  {
    id: 'layout-bottom-full',
    textId: '',
    x: 50,
    y: 450,
    width: 500,
    height: 80,
    fontSize: 30,
    fontFamily: 'Noto Sans JP',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    alignment: 'center',
    verticalAlignment: 'bottom'
  }
];

export const getLayoutById = (id: string): TextLayout | undefined => {
  return defaultLayouts.find(layout => layout.id === id);
};

export const getDefaultLayout = (): TextLayout => {
  return defaultLayouts[0];
}; 