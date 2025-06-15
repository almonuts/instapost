'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Type, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Eye,
  EyeOff,
  Trash2,
  Move,
  Crop,
  Palette,
  Settings,
  RotateCw,
  Sparkles,
  Camera,
  Layers
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { TextElement, CropSettings, ImageEditState, DecorationElement, ImageFilter } from '@/types';
import { generateId, drawMultilineText, measureMultilineText } from '@/lib/utils';
import { DesignTemplates } from './ImageEditor/DesignTemplates';
import { ImageFilters } from './ImageEditor/ImageFilters';
import { DecorationElements } from './ImageEditor/DecorationElements';

interface EditorState {
  selectedImageId: string | null;
  selectedTextId: string | null;
  selectedDecorationId: string | null;
  zoom: number;
  isDragging: boolean;
  isCropping: boolean;
  dragOffset: { x: number; y: number };
  cropMode: boolean;
  cropDragStart: { x: number; y: number } | null;
  tempCropSettings: CropSettings | null;
  imageZoom: number;
  imagePan: { x: number; y: number };
  activeTab: 'templates' | 'filters' | 'decorations' | 'text' | 'settings';
  templateCategory: string;
  decorationCategory: string;
}

interface CanvasState {
  width: number;
  height: number;
  imageArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const DEFAULT_CROP: CropSettings = {
  x: 0,
  y: 0,
  width: 400,
  height: 400,
  aspectRatio: 1.0
};

const DEFAULT_FILTER: ImageFilter = {
  id: 'none',
  name: '原画',
  cssFilter: 'none'
};

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 
  'Courier New', 'Verdana', 'Comic Sans MS', 'Impact',
  'Trebuchet MS', 'Arial Black', 'Tahoma', 'Palatino'
];

export const ImageEditor: React.FC = () => {
  const { 
    processedImages, 
    generatedPRTexts, 
    addProcessedImage,
    removeProcessedImage,
    setCurrentStep 
  } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: 600,
    height: 600,
    imageArea: { x: 0, y: 0, width: 600, height: 600 }
  });
  
  const [editorState, setEditorState] = useState<EditorState>({
    selectedImageId: null,
    selectedTextId: null,
    selectedDecorationId: null,
    zoom: 1,
    isDragging: false,
    isCropping: false,
    dragOffset: { x: 0, y: 0 },
    cropMode: false,
    cropDragStart: null,
    tempCropSettings: null,
    imageZoom: 1,
    imagePan: { x: 0, y: 0 },
    activeTab: 'templates',
    templateCategory: '',
    decorationCategory: ''
  });

  // 選択されたPR文
  const selectedPRTexts = generatedPRTexts.filter(text => text.isSelected);

  // 現在選択中の画像の編集状態を取得
  const getCurrentImageEditState = useCallback((): ImageEditState | null => {
    if (!editorState.selectedImageId) return null;
    const image = processedImages.find(img => img.id === editorState.selectedImageId);
    return image?.editState || null;
  }, [editorState.selectedImageId, processedImages]);

  // 現在選択中の画像のテキスト要素を取得
  const getCurrentTextElements = useCallback((): TextElement[] => {
    const editState = getCurrentImageEditState();
    return editState?.textElements || [];
  }, [getCurrentImageEditState]);

  // 現在選択中の画像の装飾要素を取得
  const getCurrentDecorationElements = useCallback((): DecorationElement[] => {
    const editState = getCurrentImageEditState();
    return editState?.decorationElements || [];
  }, [getCurrentImageEditState]);

  // 現在選択中の画像のフィルターを取得
  const getCurrentImageFilter = useCallback((): ImageFilter => {
    const editState = getCurrentImageEditState();
    return editState?.imageFilter || DEFAULT_FILTER;
  }, [getCurrentImageEditState]);

  // 現在選択中の画像のクロップ設定を取得
  const getCurrentCropSettings = useCallback((): CropSettings => {
    const editState = getCurrentImageEditState();
    return editState?.cropSettings || DEFAULT_CROP;
  }, [getCurrentImageEditState]);

  // 画像編集状態を更新
  const updateImageEditState = useCallback((imageId: string, updateFn: (prev: ImageEditState) => ImageEditState) => {
    const imageIndex = processedImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;

    const currentImage = processedImages[imageIndex];
    const currentEditState = currentImage.editState || {
      imageId,
      textElements: [],
      decorationElements: [],
      cropSettings: DEFAULT_CROP,
      imageFilter: DEFAULT_FILTER,
      lastModified: new Date()
    };

    const newEditState = updateFn(currentEditState);
    const updatedImage = { ...currentImage, editState: newEditState };
    
    removeProcessedImage(imageId);
    addProcessedImage(updatedImage);
  }, [processedImages, removeProcessedImage, addProcessedImage]);

  // Canvas座標からimage座標への変換
  const canvasToImageCoords = useCallback((canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return { x: 0, y: 0 };
    
    const imageArea = canvasState.imageArea;
    const relativeX = (canvasX - imageArea.x) / imageArea.width;
    const relativeY = (canvasY - imageArea.y) / imageArea.height;
    
    return {
      x: Math.max(0, Math.min(400, relativeX * 400)),
      y: Math.max(0, Math.min(400, relativeY * 400))
    };
  }, [canvasState.imageArea, currentImage]);

  // Image座標からcanvas座標への変換
  const imageToCanvasCoords = useCallback((imageX: number, imageY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return { x: 0, y: 0 };
    
    const imageArea = canvasState.imageArea;
    
    return {
      x: imageArea.x + (imageX / 400) * imageArea.width,
      y: imageArea.y + (imageY / 400) * imageArea.height
    };
  }, [canvasState.imageArea, currentImage]);

  // ズーム機能（クロップモード時のみ）
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (editorState.cropMode) {
      const zoomStep = 0.1;
      const newZoom = direction === 'in' 
        ? Math.min(3, editorState.imageZoom + zoomStep)
        : Math.max(0.5, editorState.imageZoom - zoomStep);
      
      setEditorState(prev => ({
        ...prev,
        imageZoom: newZoom
      }));
    } else {
      // 通常モード時は従来のビューズーム
      const zoomStep = 0.1;
      const newZoom = direction === 'in' 
        ? Math.min(2, editorState.zoom + zoomStep)
        : Math.max(0.5, editorState.zoom - zoomStep);
      
      setEditorState(prev => ({
        ...prev,
        zoom: newZoom
      }));
    }
  }, [editorState.cropMode, editorState.imageZoom, editorState.zoom]);

  // クロップ設定の更新
  const updateCropSettings = useCallback((updates: Partial<CropSettings>) => {
    if (!editorState.selectedImageId) return;

    updateImageEditState(editorState.selectedImageId, (prev) => ({
      ...prev,
      cropSettings: { ...prev.cropSettings, ...updates },
      lastModified: new Date()
    }));
  }, [editorState.selectedImageId, updateImageEditState]);

  // クロップ設定を適用
  const applyCrop = useCallback(() => {
    if (!editorState.selectedImageId || !currentImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 現在の表示状態からクロップ情報を計算
    const img = new Image();
    const objectUrl = URL.createObjectURL(currentImage);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imageAspect = img.width / img.height;
      const canvasAspect = canvasWidth / canvasHeight;
      
      // 元画像サイズでの表示領域を計算
      let baseWidth, baseHeight;
      if (imageAspect > canvasAspect) {
        baseHeight = canvasHeight;
        baseWidth = canvasHeight * imageAspect;
      } else {
        baseWidth = canvasWidth;
        baseHeight = canvasWidth / imageAspect;
      }
      
      // ズーム適用後のサイズ
      const zoomedWidth = baseWidth * editorState.imageZoom;
      const zoomedHeight = baseHeight * editorState.imageZoom;
      
      // 表示されている範囲を計算
      const visibleLeft = Math.max(0, -editorState.imagePan.x + (canvasWidth - zoomedWidth) / 2);
      const visibleTop = Math.max(0, -editorState.imagePan.y + (canvasHeight - zoomedHeight) / 2);
      const visibleWidth = Math.min(canvasWidth, zoomedWidth - visibleLeft);
      const visibleHeight = Math.min(canvasHeight, zoomedHeight - visibleTop);
      
      // 元画像の座標系に変換
      const cropX = (visibleLeft / zoomedWidth) * img.width;
      const cropY = (visibleTop / zoomedHeight) * img.height;
      const cropWidth = (visibleWidth / zoomedWidth) * img.width;
      const cropHeight = (visibleHeight / zoomedHeight) * img.height;
      
      // 正方形クロップにするため、小さい方に合わせる
      const cropSize = Math.min(cropWidth, cropHeight);
      const finalCropX = cropX + (cropWidth - cropSize) / 2;
      const finalCropY = cropY + (cropHeight - cropSize) / 2;
      
      updateCropSettings({
        x: finalCropX,
        y: finalCropY,
        width: cropSize,
        height: cropSize,
        aspectRatio: 1.0
      });
      
      // クロップモードを終了
      setEditorState(prev => ({
        ...prev,
        cropMode: false,
        imageZoom: 1,
        imagePan: { x: 0, y: 0 }
      }));
      
      console.log('クロップが適用されました:', {
        x: finalCropX,
        y: finalCropY,
        width: cropSize,
        height: cropSize
      });
    };
    
    img.src = objectUrl;
  }, [editorState.selectedImageId, editorState.imageZoom, editorState.imagePan, currentImage, updateCropSettings]);

  // 最初の画像を自動選択
  useEffect(() => {
    if (processedImages.length > 0 && !editorState.selectedImageId) {
      const firstImage = processedImages[0];
      setCurrentImage(firstImage.file);
      setEditorState(prev => ({ 
        ...prev, 
        selectedImageId: firstImage.id 
      }));
    }
  }, [processedImages, editorState.selectedImageId]);

  // クロップモードの切り替え
  const toggleCropMode = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      cropMode: !prev.cropMode,
      selectedTextId: null,
      imageZoom: 1,
      imagePan: { x: 0, y: 0 }
    }));
  }, []);

  // 画像選択処理
  const handleImageSelect = useCallback((imageId: string) => {
    const image = processedImages.find(img => img.id === imageId);
    if (image) {
      setCurrentImage(image.file);
      setEditorState(prev => ({ 
        ...prev, 
        selectedImageId: imageId,
        selectedTextId: null,
        cropMode: false,
        tempCropSettings: null,
        imageZoom: 1,
        imagePan: { x: 0, y: 0 }
      }));
    }
  }, [processedImages]);

  // PR文をテキスト要素として追加
  const addTextElement = useCallback((prText: string) => {
    if (!editorState.selectedImageId) return;

    const newElement: TextElement = {
      id: generateId('text'),
      text: prText,
      x: 200,
      y: 200,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      rotation: 0,
      opacity: 1,
      visible: true,
      width: 200,
      height: 40,
      strokeColor: '#000000',
      strokeWidth: 1,
      shadowColor: '#000000',
      shadowBlur: 4,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      textAlign: 'center',
      verticalAlign: 'middle'
    };

    updateImageEditState(editorState.selectedImageId, (prev) => ({
      ...prev,
      textElements: [...prev.textElements, newElement],
      lastModified: new Date()
    }));

    setEditorState(prev => ({
      ...prev,
      selectedTextId: newElement.id
    }));
  }, [editorState.selectedImageId, updateImageEditState]);

  // テキスト要素の更新
  const updateTextElement = useCallback((elementId: string, updates: Partial<TextElement>) => {
    if (!editorState.selectedImageId) return;

    updateImageEditState(editorState.selectedImageId, (prev) => ({
      ...prev,
      textElements: prev.textElements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
      lastModified: new Date()
    }));
  }, [editorState.selectedImageId, updateImageEditState]);

  // テキスト要素の削除
  const deleteTextElement = useCallback((elementId: string) => {
    if (!editorState.selectedImageId) return;

    updateImageEditState(editorState.selectedImageId, (prev) => ({
      ...prev,
      textElements: prev.textElements.filter(el => el.id !== elementId),
      lastModified: new Date()
    }));

    setEditorState(prev => ({
      ...prev,
      selectedTextId: prev.selectedTextId === elementId ? null : prev.selectedTextId
    }));
  }, [editorState.selectedImageId, updateImageEditState]);

  // Canvas描画
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !currentImage) return;

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const objectUrl = URL.createObjectURL(currentImage);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      // 描画エリア（キャンバス全体）
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // 画像のアスペクト比を計算
      const imageAspect = img.width / img.height;
      const canvasAspect = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, baseOffsetX, baseOffsetY;
      let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
      
      // クロップモードの場合は画像をエリアいっぱいに表示
      if (editorState.cropMode) {
        // エリア全体を埋めるように画像サイズを計算
        if (imageAspect > canvasAspect) {
          // 画像が横長：高さに合わせて、幅は切れる
          drawHeight = canvasHeight;
          drawWidth = canvasHeight * imageAspect;
        } else {
          // 画像が縦長：幅に合わせて、高さは切れる
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imageAspect;
        }
        
        // ズーム適用
        drawWidth *= editorState.imageZoom;
        drawHeight *= editorState.imageZoom;
        
        // 中央揃えからのオフセット + パン
        baseOffsetX = (canvasWidth - drawWidth) / 2 + editorState.imagePan.x;
        baseOffsetY = (canvasHeight - drawHeight) / 2 + editorState.imagePan.y;
      } else {
        // 通常モード：保存されたクロップ設定を適用
        const cropSettings = getCurrentCropSettings();
        
        // クロップ設定がデフォルトでない場合は、クロップ済み画像として表示
        if (cropSettings.x !== 0 || cropSettings.y !== 0 || 
            cropSettings.width !== 400 || cropSettings.height !== 400) {
          // クロップ領域を計算
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
        }
        
        // 画像全体が見えるように表示（余白付き）
        const maxSize = Math.min(canvasWidth, canvasHeight) * 0.9;
        drawWidth = maxSize;
        drawHeight = maxSize;
        
        baseOffsetX = (canvasWidth - drawWidth) / 2;
        baseOffsetY = (canvasHeight - drawHeight) / 2;
      }
      
      // 画像エリア状態を更新
      const newImageArea = { x: baseOffsetX, y: baseOffsetY, width: drawWidth, height: drawHeight };
      if (JSON.stringify(canvasState.imageArea) !== JSON.stringify(newImageArea)) {
        setCanvasState(prev => ({
          ...prev,
          imageArea: newImageArea
        }));
      }
      
      // 画像を描画（クロップ設定に応じて）
      ctx.drawImage(
        img, 
        sourceX, sourceY, sourceWidth, sourceHeight,
        baseOffsetX, baseOffsetY, drawWidth, drawHeight
      );
      
      // フィルター適用
      const currentFilter = getCurrentImageFilter();
      if (currentFilter.cssFilter !== 'none') {
        // フィルターを適用するために一時的なキャンバスを使用
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCanvas.width = drawWidth;
          tempCanvas.height = drawHeight;
          
          // 元の画像を一時キャンバスに描画
          tempCtx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, drawWidth, drawHeight
          );
          
          // フィルターを適用
          tempCtx.filter = currentFilter.cssFilter;
          tempCtx.globalCompositeOperation = 'source-over';
          tempCtx.drawImage(tempCanvas, 0, 0);
          
          // メインキャンバスにフィルター適用済み画像を描画
          ctx.clearRect(baseOffsetX, baseOffsetY, drawWidth, drawHeight);
          ctx.drawImage(tempCanvas, baseOffsetX, baseOffsetY);
        }
      }
      
      // 現在の画像のテキスト要素を描画
      const textElements = getCurrentTextElements();
      textElements.forEach(element => {
        if (!element.visible) return;

        ctx.save();
        
        // テキストの座標をcanvas座標系に変換
        // クロップモードでは座標系を調整
        let canvasCoords;
        if (editorState.cropMode) {
          // クロップモード：画像の実際の表示範囲に基づく座標
          canvasCoords = {
            x: baseOffsetX + (element.x / 400) * drawWidth,
            y: baseOffsetY + (element.y / 400) * drawHeight
          };
        } else {
          // 通常モード：固定サイズ基準の座標
          canvasCoords = {
            x: baseOffsetX + (element.x / 400) * drawWidth,
            y: baseOffsetY + (element.y / 400) * drawHeight
          };
        }
        
        const scaledFontSize = editorState.cropMode 
          ? (element.fontSize / 400) * Math.min(drawWidth, drawHeight)
          : (element.fontSize / 400) * Math.min(drawWidth, drawHeight);
        
        // フォント設定
        ctx.font = `${scaledFontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.globalAlpha = element.opacity;
        ctx.textAlign = element.textAlign as CanvasTextAlign;
        ctx.textBaseline = element.verticalAlign === 'middle' ? 'middle' : element.verticalAlign as CanvasTextBaseline;
        
        // 影の設定
        if (element.shadowBlur && element.shadowColor) {
          ctx.shadowColor = element.shadowColor;
          ctx.shadowBlur = (element.shadowBlur / 400) * Math.min(drawWidth, drawHeight);
          ctx.shadowOffsetX = ((element.shadowOffsetX || 0) / 400) * Math.min(drawWidth, drawHeight);
          ctx.shadowOffsetY = ((element.shadowOffsetY || 0) / 400) * Math.min(drawWidth, drawHeight);
        }
        
        // 回転
        if (element.rotation !== 0) {
          ctx.translate(canvasCoords.x, canvasCoords.y);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-canvasCoords.x, -canvasCoords.y);
        }
        
        // 背景描画
        if (element.backgroundColor) {
          const textMetrics = measureMultilineText(ctx, element.text, scaledFontSize);
          const bgPadding = (20 / 400) * Math.min(drawWidth, drawHeight);
          const bgWidth = textMetrics.width + bgPadding;
          const bgHeight = textMetrics.height + bgPadding / 2;
          const bgX = canvasCoords.x - bgWidth / 2;
          const bgY = canvasCoords.y - bgHeight / 2;
          
          ctx.fillStyle = element.backgroundColor;
          ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        }
        
        // アウトライン
        if (element.strokeColor && element.strokeWidth) {
          ctx.strokeStyle = element.strokeColor;
          ctx.lineWidth = (element.strokeWidth / 400) * Math.min(drawWidth, drawHeight);
          // 改行対応でテキストを描画
          drawMultilineText(ctx, element.text, canvasCoords.x, canvasCoords.y, scaledFontSize, 'stroke');
        }
        
        // テキスト本体
        ctx.fillStyle = element.color;
        // 改行対応でテキストを描画
        drawMultilineText(ctx, element.text, canvasCoords.x, canvasCoords.y, scaledFontSize, 'fill');
        
        // 選択状態の表示
        if (element.id === editorState.selectedTextId) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          // 複数行テキストのサイズを測定
          const textMetrics = measureMultilineText(ctx, element.text, scaledFontSize);
          const borderPadding = 10;
          const selectionRect = {
            x: canvasCoords.x - textMetrics.width / 2 - borderPadding,
            y: canvasCoords.y - textMetrics.height / 2 - borderPadding,
            width: textMetrics.width + borderPadding * 2,
            height: textMetrics.height + borderPadding * 2
          };
          
          ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
          ctx.setLineDash([]);
          
          // 選択ハンドル
          ctx.fillStyle = '#3B82F6';
          const handleSize = 8;
          // 四隅にハンドル
          [
            [selectionRect.x, selectionRect.y],
            [selectionRect.x + selectionRect.width, selectionRect.y],
            [selectionRect.x, selectionRect.y + selectionRect.height],
            [selectionRect.x + selectionRect.width, selectionRect.y + selectionRect.height]
          ].forEach(([x, y]) => {
            ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
          });
          
          // ドラッグ中のフィードバック
          if (editorState.isDragging) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
            ctx.fillRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
          }
        }
        
        ctx.restore();
      });
      
      // クロップモード時のオーバーレイ
      if (editorState.cropMode) {
        ctx.save();
        
        // クロップ範囲を示すボーダー
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
        ctx.setLineDash([]);
        
        // 情報表示
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.fillRect(10, 10, 200, 60);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText('クロップエリア', 20, 30);
        ctx.fillText(`ズーム: ${(editorState.imageZoom * 100).toFixed(0)}%`, 20, 50);
        
        ctx.restore();
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.error('画像の読み込みに失敗しました');
    };
    
    img.src = objectUrl;
  }, [currentImage, getCurrentCropSettings, getCurrentTextElements, getCurrentImageFilter, editorState.selectedTextId, editorState.cropMode, editorState.isDragging, editorState.imageZoom, editorState.imagePan, canvasState.imageArea]);

  // Canvas初期化とリサイズ
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const containerRect = container.getBoundingClientRect();
      const size = Math.min(600, containerRect.width - 40);
      
      // サイズが変更された場合のみ更新
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size;
        canvas.height = size;
        
        setCanvasState(prev => ({
          ...prev,
          width: size,
          height: size
        }));
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Canvas再描画（依存配列を最小限に）
  useEffect(() => {
    if (currentImage) {
      drawCanvas();
    }
  }, [currentImage, editorState.selectedTextId, editorState.cropMode, editorState.isDragging, editorState.selectedImageId, canvasState.width, canvasState.height, drawCanvas]);

  // マウスイベントハンドラー
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (e.clientY - rect.top) * (canvas.height / rect.height);

    console.log('Mouse down:', { canvasX, canvasY });

    if (editorState.cropMode) {
      // クロップモード: 画像パン操作
      setEditorState(prev => ({
        ...prev,
        isCropping: true,
        cropDragStart: { x: canvasX, y: canvasY }
      }));
      return;
    }

    // テキスト要素のクリック判定
    const textElements = getCurrentTextElements();
    let clickedElement: TextElement | null = null;
    
    for (const element of textElements) {
      const canvasCoords = imageToCanvasCoords(element.x, element.y);
      const distance = Math.sqrt(
        Math.pow(canvasX - canvasCoords.x, 2) + 
        Math.pow(canvasY - canvasCoords.y, 2)
      );
      
      console.log(`Element ${element.id}:`, { 
        elementPos: { x: element.x, y: element.y },
        canvasCoords,
        distance,
        text: element.text
      });
      
      if (distance < 80) { // クリック範囲を広げる
        clickedElement = element;
        break;
      }
    }

    if (clickedElement) {
      console.log('Clicked element:', clickedElement.id);
      const imageCoords = canvasToImageCoords(canvasX, canvasY);
      setEditorState(prev => ({
        ...prev,
        selectedTextId: clickedElement.id,
        isDragging: true,
        dragOffset: { 
          x: imageCoords.x - clickedElement.x, 
          y: imageCoords.y - clickedElement.y 
        }
      }));
    } else {
      console.log('No element clicked, deselecting');
      setEditorState(prev => ({
        ...prev,
        selectedTextId: null
      }));
    }
  }, [editorState.cropMode, getCurrentTextElements, imageToCanvasCoords, canvasToImageCoords]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (editorState.isCropping && editorState.cropDragStart) {
      // クロップモード: パン操作
      const deltaX = canvasX - editorState.cropDragStart.x;
      const deltaY = canvasY - editorState.cropDragStart.y;
      
      setEditorState(prev => ({
        ...prev,
        imagePan: { x: prev.imagePan.x + deltaX, y: prev.imagePan.y + deltaY },
        cropDragStart: { x: canvasX, y: canvasY }
      }));
      return;
    }

    if (editorState.isDragging && editorState.selectedTextId) {
      const imageCoords = canvasToImageCoords(canvasX, canvasY);
      const newX = imageCoords.x - editorState.dragOffset.x;
      const newY = imageCoords.y - editorState.dragOffset.y;

      console.log('Dragging:', { 
        canvasPos: { x: canvasX, y: canvasY },
        imageCoords,
        dragOffset: editorState.dragOffset,
        newPos: { x: newX, y: newY }
      });

      updateTextElement(editorState.selectedTextId, {
        x: Math.max(0, Math.min(400, newX)),
        y: Math.max(0, Math.min(400, newY))
      });
    }
  }, [editorState.isDragging, editorState.selectedTextId, editorState.dragOffset, editorState.isCropping, editorState.cropDragStart, canvasToImageCoords, updateTextElement]);

  const handleCanvasMouseUp = useCallback(() => {
    console.log('Mouse up');
    setEditorState(prev => ({
      ...prev,
      isDragging: false,
      isCropping: false,
      cropDragStart: null
    }));
  }, []);

  // 選択されたテキスト要素
  const selectedTextElement = getCurrentTextElements().find(
    el => el.id === editorState.selectedTextId
  );

  if (processedImages.length === 0) {
    return (
      <div className="text-center py-12">
        <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">画像をアップロードしてください</h3>
        <p className="text-gray-600">
          PR文を配置するためには、まず画像をアップロードする必要があります。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Type className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">画像編集</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={toggleCropMode}
            className={`p-2 rounded ${editorState.cropMode ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            <Crop className="w-4 h-4" />
          </button>
          {editorState.cropMode && (
            <button
              onClick={applyCrop}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              適用
            </button>
          )}
          <button
            onClick={() => handleZoom('out')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 text-sm bg-gray-100 rounded">
            {editorState.cropMode 
              ? `${Math.round(editorState.imageZoom * 100)}%`
              : `${Math.round(editorState.zoom * 100)}%`
            }
          </span>
          <button
            onClick={() => handleZoom('in')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 min-h-[600px]">
        {/* 左サイドバー: 画像選択 */}
        <div className="xl:col-span-1 space-y-4">
          <h4 className="font-medium text-gray-900">画像を選択</h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {processedImages.map((image) => (
              <div
                key={image.id}
                onClick={() => handleImageSelect(image.id)}
                className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                  editorState.selectedImageId === image.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image.thumbnail}
                  alt="プレビュー"
                  className="w-full h-20 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {image.file.name}
                </div>
                {image.editState && image.editState.textElements.length > 0 && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {image.editState.textElements.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 中央: キャンバス */}
        <div className="xl:col-span-3">
          <div ref={containerRef} className="bg-gray-100 rounded-lg p-5 h-fit">
            <canvas
              ref={canvasRef}
              className={`border border-gray-300 bg-white rounded shadow-sm w-full ${
                editorState.cropMode 
                  ? editorState.isCropping 
                    ? 'cursor-grabbing' 
                    : 'cursor-grab'
                  : editorState.isDragging 
                    ? 'cursor-grabbing' 
                    : editorState.selectedTextId 
                      ? 'cursor-grab' 
                      : 'cursor-pointer'
              }`}
              style={{ transform: `scale(${editorState.zoom})`, transformOrigin: 'center' }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
            <div className="mt-2 text-sm text-gray-600 text-center">
              {editorState.cropMode 
                ? 'クロップモード: ズームボタンで画像サイズを調整し、「適用」ボタンでクロップ' 
                : editorState.selectedTextId 
                  ? 'テキストをドラッグして位置を調整' 
                  : 'テキストをクリックして選択'
              }
            </div>
          </div>
        </div>

        {/* 右サイドバー: 操作パネル（固定幅・高さ） */}
        <div className="xl:col-span-2 flex flex-col space-y-4 max-h-[600px]">
          {/* 新しいタブベースのUI */}
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* タブヘッダー */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'templates', label: 'テンプレート', icon: <Sparkles className="w-4 h-4" /> },
                { id: 'filters', label: 'フィルター', icon: <Camera className="w-4 h-4" /> },
                { id: 'decorations', label: '装飾', icon: <Palette className="w-4 h-4" /> },
                { id: 'text', label: 'テキスト', icon: <Type className="w-4 h-4" /> },
                { id: 'settings', label: '設定', icon: <Settings className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditorState(prev => ({ ...prev, activeTab: tab.id as any }))}
                  className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                    editorState.activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-1 hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* タブコンテンツ */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {editorState.activeTab === 'templates' && (
                <DesignTemplates
                  onApplyTemplate={(template) => {
                    // TODO: テンプレート適用ロジック
                    console.log('Apply template:', template);
                  }}
                  selectedCategory={editorState.templateCategory}
                  onCategoryChange={(category) => setEditorState(prev => ({ ...prev, templateCategory: category }))}
                />
              )}

              {editorState.activeTab === 'filters' && (
                <ImageFilters
                  selectedFilter={getCurrentImageFilter().id}
                  onFilterChange={(filter) => {
                    if (!editorState.selectedImageId) return;
                    updateImageEditState(editorState.selectedImageId, (prev) => ({
                      ...prev,
                      imageFilter: filter,
                      lastModified: new Date()
                    }));
                  }}
                  previewImage={currentImage ? URL.createObjectURL(currentImage) : undefined}
                />
              )}

              {editorState.activeTab === 'decorations' && (
                <DecorationElements
                  onAddDecoration={(element) => {
                    // TODO: 装飾要素追加ロジック
                    console.log('Add decoration:', element);
                  }}
                  selectedCategory={editorState.decorationCategory}
                  onCategoryChange={(category) => setEditorState(prev => ({ ...prev, decorationCategory: category }))}
                />
              )}

              {editorState.activeTab === 'text' && (
                <div className="space-y-4">
                  {/* PR文選択エリア */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Type className="w-4 h-4 mr-2" />
                      PR文を追加
                    </h4>
                    {selectedPRTexts.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedPRTexts.map((prText) => (
                          <button
                            key={prText.id}
                            onClick={() => addTextElement(prText.text)}
                            className="w-full text-left p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors text-sm"
                          >
                            <div className="font-medium text-gray-900 mb-1 truncate">
                              {prText.text}
                            </div>
                            <div className="text-xs text-gray-500">
                              {prText.characterCount}文字 • {prText.category}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        <p className="text-sm">PR文が選択されていません</p>
                        <p className="text-xs mt-1">前のステップでPR文を選択してください</p>
                      </div>
                    )}
                  </div>

                  {/* テキストレイヤー管理 */}
                  {getCurrentTextElements().length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Layers className="w-4 h-4 mr-2" />
                        テキストレイヤー
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {getCurrentTextElements().map((element) => (
                          <div
                            key={element.id}
                            onClick={() => setEditorState(prev => ({ ...prev, selectedTextId: element.id, activeTab: 'settings' }))}
                            className={`p-2 border rounded cursor-pointer transition-colors text-sm ${
                              element.id === editorState.selectedTextId
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate flex-1">{element.text}</span>
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTextElement(element.id, { visible: !element.visible });
                                  }}
                                  className={`p-1 rounded ${element.visible ? 'text-blue-600' : 'text-gray-400'}`}
                                >
                                  {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTextElement(element.id);
                                  }}
                                  className="p-1 text-red-600 hover:text-red-800 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editorState.activeTab === 'settings' && selectedTextElement && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      テキスト設定
                    </h4>
                    <button
                      onClick={() => deleteTextElement(selectedTextElement.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* テキスト内容編集 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      テキスト内容
                    </label>
                    <textarea
                      value={selectedTextElement.text}
                      onChange={(e) => updateTextElement(selectedTextElement.id, { text: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* クイック設定 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">サイズ</label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedTextElement.fontSize}
                        onChange={(e) => updateTextElement(selectedTextElement.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 text-center">{selectedTextElement.fontSize}px</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">文字色</label>
                      <input
                        type="color"
                        value={selectedTextElement.color}
                        onChange={(e) => updateTextElement(selectedTextElement.id, { color: e.target.value })}
                        className="w-full h-8 rounded border border-gray-300"
                      />
                    </div>
                  </div>

                  {/* フォント選択 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">フォント</label>
                    <select
                      value={selectedTextElement.fontFamily}
                      onChange={(e) => updateTextElement(selectedTextElement.id, { fontFamily: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  {/* 詳細設定 */}
                  <details className="border border-gray-200 rounded">
                    <summary className="p-2 bg-gray-50 cursor-pointer text-xs font-medium">
                      詳細設定
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">背景色</label>
                          <input
                            type="color"
                            value={selectedTextElement.backgroundColor?.replace(/rgba?\([^)]*\)/, '#000000') || '#000000'}
                            onChange={(e) => updateTextElement(selectedTextElement.id, { backgroundColor: `${e.target.value}80` })}
                            className="w-full h-6 rounded border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">透明度</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={selectedTextElement.opacity}
                            onChange={(e) => updateTextElement(selectedTextElement.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {editorState.activeTab === 'settings' && !selectedTextElement && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">テキストを選択して編集</p>
                  <p className="text-xs mt-1">テキストタブからテキストを選択してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 次へボタン */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          画像編集が完了したら、次のステップに進んでダウンロードしてください
        </div>
        <button
          onClick={() => setCurrentStep(5)}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ダウンロードへ
          <Download className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}; 