import { ProcessedImage } from '@/types';
import { generateId } from './utils';

export async function processImageFile(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // ファイル検証
    if (!file.type.startsWith('image/')) {
      reject(new Error('サポートされていないファイル形式です'));
      return;
    }

    // ファイルサイズ制限（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('ファイルサイズが10MBを超えています'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Instagram推奨サイズ（1080x1080）にリサイズ
        const targetSize = 1080;
        const { width, height } = img;
        
        let newWidth = width;
        let newHeight = height;
        
        // アスペクト比を保持してリサイズ
        if (width > height) {
          if (width > targetSize) {
            newWidth = targetSize;
            newHeight = (height * targetSize) / width;
          }
        } else {
          if (height > targetSize) {
            newHeight = targetSize;
            newWidth = (width * targetSize) / height;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (ctx) {
          // 高品質な描画設定
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // 画像を描画
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Data URLを生成（サムネイル用）
          const thumbnail = canvas.toDataURL('image/jpeg', 0.9);
          
          // 圧縮率計算
          const originalSize = file.size;
          const compressedSize = thumbnail.length * 0.75; // Base64は約25%オーバーヘッド
          const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
          
          const processedImage: ProcessedImage = {
            id: generateId('img'),
            file: file,
            originalFile: file,
            dimensions: {
              width: newWidth,
              height: newHeight
            },
            fileSize: file.size,
            thumbnail: thumbnail,
            isOptimized: newWidth < width || newHeight < height,
            compressionRatio: compressionRatio > 0 ? compressionRatio : undefined
          };
          
          resolve(processedImage);
        } else {
          reject(new Error('Canvasコンテキストの取得に失敗しました'));
        }
      } catch (error) {
        reject(new Error('画像の処理中にエラーが発生しました'));
      }
    };

    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'));
    };

    // Blob URLを作成して画像を読み込み
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
}

export function createCanvasWithText(
  imageUrl: string,
  text: string,
  layout: any,
  fontSize: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          // 画像を描画
          ctx.drawImage(img, 0, 0);

          // テキストエリアの計算
          const textArea = layout.textArea;
          const x = (textArea.x / 100) * canvas.width;
          const y = (textArea.y / 100) * canvas.height;
          const width = (textArea.width / 100) * canvas.width;
          const height = (textArea.height / 100) * canvas.height;

          // 背景オーバーレイ
          if (layout.backgroundOverlay) {
            ctx.fillStyle = `${layout.backgroundOverlay.color}${Math.floor(layout.backgroundOverlay.opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.fillRect(x, y, width, height);
          }

          // テキストスタイル設定
          const style = layout.textStyle;
          ctx.font = `${fontSize}px "${style.fontFamily}"`;
          ctx.fillStyle = style.color;
          ctx.textAlign = textArea.alignment as CanvasTextAlign;
          ctx.textBaseline = 'top';

          // 影の設定
          if (style.shadow) {
            ctx.shadowColor = style.shadow.color;
            ctx.shadowBlur = style.shadow.blur;
            ctx.shadowOffsetX = style.shadow.offsetX;
            ctx.shadowOffsetY = style.shadow.offsetY;
          }

          // テキストの改行処理
          const lines = wrapText(ctx, text, width, fontSize);
          const lineHeight = fontSize * 1.2;
          
          let textY = y;
          if (textArea.verticalAlignment === 'middle') {
            textY = y + (height - lines.length * lineHeight) / 2;
          } else if (textArea.verticalAlignment === 'bottom') {
            textY = y + height - lines.length * lineHeight;
          }

          // テキストを描画
          lines.forEach((line, index) => {
            const lineY = textY + index * lineHeight + fontSize;
            let lineX = x;
            
            if (textArea.alignment === 'center') {
              lineX = x + width / 2;
            } else if (textArea.alignment === 'right') {
              lineX = x + width;
            }

            // アウトライン
            if (style.strokeColor && style.strokeWidth) {
              ctx.strokeStyle = style.strokeColor;
              ctx.lineWidth = style.strokeWidth;
              ctx.strokeText(line, lineX, lineY);
            }

            // テキスト本体
            ctx.fillText(line, lineX, lineY);
          });

          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          reject(new Error('Canvasコンテキストの取得に失敗しました'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = imageUrl;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function downloadCanvas(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      resolve();
    }, 'image/jpeg', 0.9);
  });
}

export function validateImageFile(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return 'JPEG、PNG、WebP形式の画像ファイルのみサポートしています';
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return 'ファイルサイズは10MB以下にしてください';
  }
  
  return null;
} 