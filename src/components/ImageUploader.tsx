'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { processImageFile, validateImageFile } from '@/lib/image-processing';
import { useAppStore } from '@/store/app-store';
import { ProcessedImage } from '@/types';

export const ImageUploader: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { processedImages, addProcessedImage, removeProcessedImage } = useAppStore();

  const handleFileSelect = useCallback(async (files: FileList) => {
    setError(null);
    setIsProcessing(true);

    try {
      const fileArray = Array.from(files);
      
      // 最大10枚の制限
      if (processedImages.length + fileArray.length > 10) {
        setError('画像は最大10枚まで追加できます');
        setIsProcessing(false);
        return;
      }

      for (const file of fileArray) {
        // ファイル検証
        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        try {
          // 画像処理
          const processedImage = await processImageFile(file);
          addProcessedImage(processedImage);
        } catch (err) {
          console.error('Image processing error:', err);
          setError(`${file.name}: 画像の処理に失敗しました`);
        }
      }
    } catch (err) {
      setError('ファイルの処理中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages.length, addProcessedImage]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // input要素をリセット
    e.target.value = '';
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback((imageId: string) => {
    removeProcessedImage(imageId);
  }, [removeProcessedImage]);

  return (
    <div className="space-y-6">
      {/* アップロードエリア */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              画像をアップロード
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ドラッグ&ドロップまたはクリックして画像を選択してください
            </p>
            
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
              <ImageIcon className="w-4 h-4 mr-2" />
              ファイルを選択
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>対応形式: JPEG, PNG, WebP</p>
            <p>最大ファイルサイズ: 10MB</p>
            <p>最大枚数: 10枚</p>
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">画像を処理中...</p>
            </div>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* アップロード済み画像一覧 */}
      {processedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            アップロード済み画像 ({processedImages.length}/10)
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processedImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: (imageId: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove }) => {
  return (
    <div className="relative group">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={image.thumbnail}
          alt={image.originalFile.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* 削除ボタン */}
      <button
        onClick={() => onRemove(image.id)}
        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
        title="画像を削除"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* ファイル名 */}
      <div className="mt-2 text-xs text-gray-600 truncate" title={image.originalFile.name}>
        {image.originalFile.name}
      </div>
      
      {/* ファイルサイズ */}
      <div className="text-xs text-gray-500">
        {(image.fileSize / 1024 / 1024).toFixed(1)} MB
        {image.isOptimized && (
          <span className="text-green-600 ml-1">
            ({image.compressionRatio?.toFixed(0)}% 圧縮)
          </span>
        )}
      </div>
    </div>
  );
}; 