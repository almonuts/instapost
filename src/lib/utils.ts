// ユーティリティ関数

/**
 * クライアント側でのみ実行される安全なID生成
 */
export const generateId = (prefix: string = 'id'): string => {
  if (typeof window === 'undefined') {
    // サーバーサイドでは固定値を返してハイドレーションエラーを防ぐ
    return `${prefix}_ssr_placeholder`;
  }
  
  // クライアント側では一意なIDを生成
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * ファイルサイズをフォーマット
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 色の16進数からRGBAへ変換
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 文字列を指定の長さで切り詰める
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 複数行テキストの描画関数
export const drawMultilineText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  fontSize: number, 
  type: 'fill' | 'stroke'
) => {
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.2; // 行間を20%増加
  const totalHeight = lines.length * lineHeight;
  
  // 垂直方向のアライメントに応じて開始Y位置を調整
  let startY = y;
  if (ctx.textBaseline === 'middle') {
    startY = y - (totalHeight - lineHeight) / 2;
  } else if (ctx.textBaseline === 'bottom') {
    startY = y - totalHeight + lineHeight;
  }
  
  lines.forEach((line, index) => {
    const lineY = startY + (index * lineHeight);
    if (type === 'fill') {
      ctx.fillText(line, x, lineY);
    } else {
      ctx.strokeText(line, x, lineY);
    }
  });
};

// 複数行テキストのサイズ測定関数
export const measureMultilineText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  fontSize: number
): { width: number; height: number } => {
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.2;
  
  let maxWidth = 0;
  lines.forEach(line => {
    const metrics = ctx.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  });
  
  return {
    width: maxWidth,
    height: lines.length * lineHeight
  };
}; 