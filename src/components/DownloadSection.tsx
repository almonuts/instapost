'use client';

import React, { useState, useCallback } from 'react';
import { Download, Package, Image as ImageIcon, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { TextElement, CropSettings } from '@/types';
import { drawMultilineText, measureMultilineText } from '@/lib/utils';

interface DownloadProgress {
  imageId: string;
  imageName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface PreviewState {
  isOpen: boolean;
  imageId: string | null;
  previewUrl: string | null;
}

export const DownloadSection: React.FC = () => {
  const { processedImages, setCurrentStep } = useAppStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);
  const [downloadFormat, setDownloadFormat] = useState<'jpg' | 'png'>('jpg');
  const [quality, setQuality] = useState(90);
  const [preview, setPreview] = useState<PreviewState>({
    isOpen: false,
    imageId: null,
    previewUrl: null
  });

  // エディット済みの画像のみフィルタリング
  const editedImages = processedImages.filter(image => {
    if (!image.editState) return false;
    
    // テキスト要素がある場合
    if (image.editState.textElements.length > 0) return true;
    
    // クロップが適用されている場合（デフォルト値と異なる）
    const crop = image.editState.cropSettings;
    if (crop && (crop.x !== 0 || crop.y !== 0 || crop.width !== 400 || crop.height !== 400)) {
      return true;
    }
    
    return false;
  });

  // 単一画像の合成とダウンロード
  const processAndDownloadImage = useCallback(async (
    image: { id: string; file: File; editState?: { textElements: TextElement[]; cropSettings: CropSettings } },
    filename: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(image.file);
      
      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);
          
          // Instagram用正方形サイズ (1080x1080)
          const targetSize = 1080;
          canvas.width = targetSize;
          canvas.height = targetSize;
          
          // 背景を白で塗りつぶし
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetSize, targetSize);
          
          const cropSettings = image.editState?.cropSettings;
          let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
          
          // クロップ設定が存在し、デフォルト値と異なる場合はクロップを適用
          if (cropSettings && 
              (cropSettings.x !== 0 || cropSettings.y !== 0 || 
               cropSettings.width !== 400 || cropSettings.height !== 400)) {
            
            // ImageEditorと同じクロップロジック
            sourceX = Math.max(0, Math.min(cropSettings.x, img.width));
            sourceY = Math.max(0, Math.min(cropSettings.y, img.height));
            sourceWidth = Math.min(cropSettings.width, img.width - sourceX);
            sourceHeight = Math.min(cropSettings.height, img.height - sourceY);
            
            // 正方形になるように調整
            const size = Math.min(sourceWidth, sourceHeight);
            sourceX = sourceX + (sourceWidth - size) / 2;
            sourceY = sourceY + (sourceHeight - size) / 2;
            sourceWidth = size;
            sourceHeight = size;
          } else {
            // デフォルト: 画像全体を正方形にクロップ
            const size = Math.min(img.width, img.height);
            sourceX = (img.width - size) / 2;
            sourceY = (img.height - size) / 2;
            sourceWidth = size;
            sourceHeight = size;
          }
          
          // 画像を正方形でクロップして描画
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, targetSize, targetSize
          );
          
          // テキスト要素を描画
          if (image.editState && image.editState.textElements.length > 0) {
            image.editState.textElements.forEach(element => {
              if (!element.visible) return;

              ctx.save();
              
              // 座標をキャンバスサイズに変換
              const x = (element.x / 400) * targetSize;
              const y = (element.y / 400) * targetSize;
              const fontSize = (element.fontSize / 400) * targetSize;
              
              // フォント設定
              ctx.font = `${fontSize}px ${element.fontFamily}`;
              ctx.fillStyle = element.color;
              ctx.globalAlpha = element.opacity;
              ctx.textAlign = element.textAlign as CanvasTextAlign;
              ctx.textBaseline = element.verticalAlign === 'middle' ? 'middle' : element.verticalAlign as CanvasTextBaseline;
              
              // 回転
              if (element.rotation !== 0) {
                ctx.translate(x, y);
                ctx.rotate((element.rotation * Math.PI) / 180);
                ctx.translate(-x, -y);
              }
              
              // 影の設定
              if (element.shadowBlur && element.shadowColor) {
                ctx.shadowColor = element.shadowColor;
                ctx.shadowBlur = (element.shadowBlur / 400) * targetSize;
                ctx.shadowOffsetX = ((element.shadowOffsetX || 0) / 400) * targetSize;
                ctx.shadowOffsetY = ((element.shadowOffsetY || 0) / 400) * targetSize;
              }
              
              // 背景描画
              if (element.backgroundColor) {
                const textMetrics = measureMultilineText(ctx, element.text, fontSize);
                const bgPadding = (20 / 400) * targetSize;
                const bgWidth = textMetrics.width + bgPadding;
                const bgHeight = textMetrics.height + (10 / 400) * targetSize;
                const bgX = x - bgWidth / 2;
                const bgY = y - bgHeight / 2;
                
                ctx.fillStyle = element.backgroundColor;
                ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
              }
              
              // アウトライン
              if (element.strokeColor && element.strokeWidth) {
                ctx.strokeStyle = element.strokeColor;
                ctx.lineWidth = (element.strokeWidth / 400) * targetSize;
                drawMultilineText(ctx, element.text, x, y, fontSize, 'stroke');
              }
              
              // テキスト本体
              ctx.fillStyle = element.color;
              drawMultilineText(ctx, element.text, x, y, fontSize, 'fill');
              
              ctx.restore();
            });
          }
          
          // ダウンロード実行
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
              resolve();
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, `image/${downloadFormat}`, quality / 100);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = objectUrl;
    });
  }, [downloadFormat, quality]);

  // プレビュー画像生成
  const generatePreview = useCallback(async (
    image: { id: string; file: File; editState?: { textElements: TextElement[]; cropSettings: CropSettings } }
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(image.file);
      
      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);
          
          // プレビュー用サイズ (400x400)
          const targetSize = 400;
          canvas.width = targetSize;
          canvas.height = targetSize;
          
          // 背景を白で塗りつぶし
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetSize, targetSize);
          
          const cropSettings = image.editState?.cropSettings;
          let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
          
          // クロップ処理（同じロジック）
          if (cropSettings && 
              (cropSettings.x !== 0 || cropSettings.y !== 0 || 
               cropSettings.width !== 400 || cropSettings.height !== 400)) {
            
            sourceX = Math.max(0, Math.min(cropSettings.x, img.width));
            sourceY = Math.max(0, Math.min(cropSettings.y, img.height));
            sourceWidth = Math.min(cropSettings.width, img.width - sourceX);
            sourceHeight = Math.min(cropSettings.height, img.height - sourceY);
            
            const size = Math.min(sourceWidth, sourceHeight);
            sourceX = sourceX + (sourceWidth - size) / 2;
            sourceY = sourceY + (sourceHeight - size) / 2;
            sourceWidth = size;
            sourceHeight = size;
          } else {
            const size = Math.min(img.width, img.height);
            sourceX = (img.width - size) / 2;
            sourceY = (img.height - size) / 2;
            sourceWidth = size;
            sourceHeight = size;
          }
          
          // 画像描画
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, targetSize, targetSize
          );
          
          // テキスト要素描画
          if (image.editState && image.editState.textElements.length > 0) {
            image.editState.textElements.forEach(element => {
              if (!element.visible) return;

              ctx.save();
              
              const x = (element.x / 400) * targetSize;
              const y = (element.y / 400) * targetSize;
              const fontSize = (element.fontSize / 400) * targetSize;
              
              ctx.font = `${fontSize}px ${element.fontFamily}`;
              ctx.fillStyle = element.color;
              ctx.globalAlpha = element.opacity;
              ctx.textAlign = element.textAlign as CanvasTextAlign;
              ctx.textBaseline = element.verticalAlign === 'middle' ? 'middle' : element.verticalAlign as CanvasTextBaseline;
              
              if (element.rotation !== 0) {
                ctx.translate(x, y);
                ctx.rotate((element.rotation * Math.PI) / 180);
                ctx.translate(-x, -y);
              }
              
              if (element.shadowBlur && element.shadowColor) {
                ctx.shadowColor = element.shadowColor;
                ctx.shadowBlur = (element.shadowBlur / 400) * targetSize;
                ctx.shadowOffsetX = ((element.shadowOffsetX || 0) / 400) * targetSize;
                ctx.shadowOffsetY = ((element.shadowOffsetY || 0) / 400) * targetSize;
              }
              
              if (element.backgroundColor) {
                const textMetrics = measureMultilineText(ctx, element.text, fontSize);
                const bgPadding = (20 / 400) * targetSize;
                const bgWidth = textMetrics.width + bgPadding;
                const bgHeight = textMetrics.height + (10 / 400) * targetSize;
                const bgX = x - bgWidth / 2;
                const bgY = y - bgHeight / 2;
                
                ctx.fillStyle = element.backgroundColor;
                ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
              }
              
              if (element.strokeColor && element.strokeWidth) {
                ctx.strokeStyle = element.strokeColor;
                ctx.lineWidth = (element.strokeWidth / 400) * targetSize;
                drawMultilineText(ctx, element.text, x, y, fontSize, 'stroke');
              }
              
              ctx.fillStyle = element.color;
              drawMultilineText(ctx, element.text, x, y, fontSize, 'fill');
              
              ctx.restore();
            });
          }
          
          resolve(canvas.toDataURL('image/png'));
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = objectUrl;
    });
  }, []);

  // プレビューを開く
  const handlePreview = useCallback(async (image: typeof editedImages[0]) => {
    try {
      const previewUrl = await generatePreview(image);
      setPreview({
        isOpen: true,
        imageId: image.id,
        previewUrl
      });
    } catch (error) {
      console.error('Preview generation error:', error);
    }
  }, [generatePreview, editedImages]);

  // プレビューを閉じる
  const closePreview = useCallback(() => {
    if (preview.previewUrl) {
      // Data URLの場合は自動的にガベージコレクション対象になるのでrevokeは不要
    }
    setPreview({
      isOpen: false,
      imageId: null,
      previewUrl: null
    });
  }, [preview.previewUrl]);

  // 全画像一括ダウンロード
  const handleBatchDownload = useCallback(async () => {
    if (editedImages.length === 0) return;

    setIsDownloading(true);
    
    // プログレス初期化
    const initialProgress: DownloadProgress[] = editedImages.map(image => ({
      imageId: image.id,
      imageName: image.file.name,
      status: 'pending',
      progress: 0
    }));
    setDownloadProgress(initialProgress);

    for (let i = 0; i < editedImages.length; i++) {
      const image = editedImages[i];
      
      try {
        // ステータス更新
        setDownloadProgress(prev => prev.map(item =>
          item.imageId === image.id
            ? { ...item, status: 'processing', progress: 50 }
            : item
        ));

        // ファイル名生成
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
        const baseName = image.file.name.replace(/\.[^/.]+$/, '');
        
        // 編集内容を示すサフィックス
        const editTypes = [];
        if (image.editState?.textElements && image.editState.textElements.length > 0) {
          editTypes.push(`text${image.editState.textElements.length}`);
        }
        const crop = image.editState?.cropSettings;
        if (crop && (crop.x !== 0 || crop.y !== 0 || crop.width !== 400 || crop.height !== 400)) {
          editTypes.push('cropped');
        }
        
        const suffix = editTypes.length > 0 ? `_${editTypes.join('_')}` : '_edited';
        const filename = `${baseName}${suffix}_${timestamp}.${downloadFormat}`;

        // 画像処理とダウンロード
        await processAndDownloadImage(image, filename);

        // 完了ステータス更新
        setDownloadProgress(prev => prev.map(item =>
          item.imageId === image.id
            ? { ...item, status: 'completed', progress: 100 }
            : item
        ));

        // 少し間隔を空ける
        if (i < editedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`Error processing image ${image.id}:`, error);
        
        setDownloadProgress(prev => prev.map(item =>
          item.imageId === image.id
            ? { 
                ...item, 
                status: 'error', 
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : item
        ));
      }
    }

    setIsDownloading(false);
  }, [editedImages, processAndDownloadImage, downloadFormat]);

  // 単一画像ダウンロード
  const handleSingleDownload = useCallback(async (image: typeof editedImages[0]) => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      const baseName = image.file.name.replace(/\.[^/.]+$/, '');
      
      // 編集内容を示すサフィックス
      const editTypes = [];
      if (image.editState?.textElements && image.editState.textElements.length > 0) {
        editTypes.push(`text${image.editState.textElements.length}`);
      }
      const crop = image.editState?.cropSettings;
      if (crop && (crop.x !== 0 || crop.y !== 0 || crop.width !== 400 || crop.height !== 400)) {
        editTypes.push('cropped');
      }
      
      const suffix = editTypes.length > 0 ? `_${editTypes.join('_')}` : '_edited';
      const filename = `${baseName}${suffix}_${timestamp}.${downloadFormat}`;
      
      await processAndDownloadImage(image, filename);
    } catch (error) {
      console.error('Download error:', error);
    }
  }, [processAndDownloadImage, downloadFormat]);

  if (editedImages.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">編集済み画像がありません</h3>
        <p className="text-gray-600 mb-4">
          画像にPR文を配置してから、こちらでダウンロードしてください。
        </p>
        <button
          onClick={() => setCurrentStep(4)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          画像編集に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Download className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">ダウンロード</h3>
        </div>
        <div className="text-sm text-gray-600">
          {editedImages.length}個の編集済み画像
        </div>
      </div>

      {/* ダウンロード設定 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">ダウンロード設定</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* フォーマット選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像フォーマット
            </label>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'jpg' | 'png')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="jpg">JPEG (.jpg)</option>
              <option value="png">PNG (.png)</option>
            </select>
          </div>

          {/* 品質設定 */}
          {downloadFormat === 'jpg' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                画質: {quality}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* 一括ダウンロード */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">一括ダウンロード</h4>
          <button
            onClick={handleBatchDownload}
            disabled={isDownloading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Package className="w-4 h-4 mr-2" />
            {isDownloading ? '処理中...' : '全てダウンロード'}
          </button>
        </div>

        {/* ダウンロード進捗 */}
        {downloadProgress.length > 0 && (
          <div className="space-y-2">
            {downloadProgress.map((progress) => (
              <div key={progress.imageId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  {progress.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  )}
                  {progress.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  {progress.status === 'processing' && (
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  )}
                  {progress.status === 'pending' && (
                    <div className="w-4 h-4 mr-2 bg-gray-300 rounded-full"></div>
                  )}
                  <span className="text-sm text-gray-700 truncate">{progress.imageName}</span>
                </div>
                <div className="flex items-center">
                  {progress.status === 'error' && progress.error && (
                    <span className="text-xs text-red-600 mr-2">{progress.error}</span>
                  )}
                  <span className="text-xs text-gray-500">{progress.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 個別画像ダウンロード */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">個別ダウンロード</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editedImages.map((image) => (
            <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.thumbnail}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                  {image.file.name}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {(() => {
                    const textCount = image.editState?.textElements.length || 0;
                    const crop = image.editState?.cropSettings;
                    const isCropped = crop && (crop.x !== 0 || crop.y !== 0 || crop.width !== 400 || crop.height !== 400);
                    
                    const features = [];
                    if (textCount > 0) features.push(`${textCount}個のテキスト`);
                    if (isCropped) features.push('クロップ済み');
                    
                    return features.length > 0 ? features.join(' • ') : '編集済み';
                  })()}
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handlePreview(image)}
                    className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    プレビュー
                  </button>
                  
                  <button
                    onClick={() => handleSingleDownload(image)}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    ダウンロード
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 完了メッセージ */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900 mb-1">
              Instagram投稿用画像の準備完了
            </h4>
            <p className="text-sm text-green-800">
              ダウンロードした画像は1080x1080pxの正方形フォーマットです。
              そのままInstagramに投稿できます。
            </p>
          </div>
        </div>
      </div>

      {/* 新しいプロジェクト */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            if (confirm('新しいプロジェクトを開始しますか？現在のデータは失われます。')) {
              window.location.reload();
            }
          }}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          新しいプロジェクトを開始
        </button>
      </div>

      {/* プレビューモーダル */}
      {preview.isOpen && preview.previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closePreview}>
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">プレビュー</h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={preview.previewUrl}
                alt="プレビュー"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-sm text-gray-600 text-center mb-4">
              最終的なダウンロード画像は1080x1080pxで保存されます
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closePreview}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  const image = editedImages.find(img => img.id === preview.imageId);
                  if (image) {
                    handleSingleDownload(image);
                    closePreview();
                  }
                }}
                disabled={isDownloading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                このままダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 