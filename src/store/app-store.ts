import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  ProjectData, 
  ProcessedImage, 
  GeneratedPRText, 
  PropertyTextInput, 
  ImageAssignment,
  PostContent,
  WebAppSettings,
  ImageEditState,
  TextElement,
  PromptSettings,
  InstagramPostText,
  GeneratedPostContent
} from '@/types';

interface AppState {
  // プロジェクトデータ
  projectId: string | null;
  propertyText: PropertyTextInput | null;
  generatedPRTexts: GeneratedPRText[];
  generatedPostContent: GeneratedPostContent | null;
  processedImages: ProcessedImage[];
  postContent: PostContent | null;
  settings: WebAppSettings;
  
  // UI状態
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  
  // クライアント側の初期化フラグ
  isHydrated: boolean;
  
  // アクション
  setPropertyText: (text: PropertyTextInput) => void;
  setGeneratedPRTexts: (texts: GeneratedPRText[]) => void;
  updateGeneratedPRText: (textId: string, updates: Partial<GeneratedPRText>) => void;
  setGeneratedPostContent: (content: GeneratedPostContent) => void;
  updateInstagramPostText: (textId: string, updates: Partial<InstagramPostText>) => void;
  addProcessedImage: (image: ProcessedImage) => void;
  removeProcessedImage: (imageId: string) => void;
  updateProcessedImage: (imageId: string, updateFn: (image: ProcessedImage) => ProcessedImage) => void;
  updateImageAssignment: (imageId: string, assignment: ImageAssignment) => void;
  updateImageEditState: (imageId: string, editState: ImageEditState) => void;
  addTextElementToImage: (imageId: string, textElement: TextElement) => void;
  updateTextElementInImage: (imageId: string, textElementId: string, updates: Partial<TextElement>) => void;
  removeTextElementFromImage: (imageId: string, textElementId: string) => void;
  setPostContent: (content: PostContent) => void;
  updateSettings: (settings: Partial<WebAppSettings>) => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetProject: () => void;
  exportProject: () => ProjectData | null;
  setHydrated: () => void;
}

const defaultSettings: WebAppSettings = {
  autoSave: true,
  previewQuality: 'medium',
  maxFileSize: 10, // 10MB
  compressionLevel: 80,
  promptSettings: {
    tone: 'professional',
    style: 'detailed',
    targetAudience: 'general',
    emphasis: 'features'
  }
};

// クライアント側でのID生成
const generateProjectId = () => {
  if (typeof window === 'undefined') return null;
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初期状態
        projectId: null,
        propertyText: null,
        generatedPRTexts: [],
        generatedPostContent: null,
        processedImages: [],
        postContent: null,
        settings: defaultSettings,
        currentStep: 1,
        isLoading: false,
        error: null,
        isHydrated: false,

        // アクション
        setHydrated: () => set({ isHydrated: true }),

        setPropertyText: (text) =>
          set((state) => ({
            propertyText: text,
            projectId: state.projectId || generateProjectId()
          })),

        setGeneratedPRTexts: (texts) =>
          set({ generatedPRTexts: texts }),

        updateGeneratedPRText: (textId, updates) =>
          set((state) => ({
            generatedPRTexts: state.generatedPRTexts.map(text =>
              text.id === textId ? { ...text, ...updates } : text
            )
          })),

        setGeneratedPostContent: (content) =>
          set({ generatedPostContent: content }),

        updateInstagramPostText: (textId, updates) =>
          set((state) => {
            if (!state.generatedPostContent) return state;
            
            return {
              generatedPostContent: {
                ...state.generatedPostContent,
                captions: state.generatedPostContent.captions.map(caption =>
                  caption.id === textId ? { ...caption, ...updates } : caption
                )
              }
            };
          }),

        addProcessedImage: (image) =>
          set((state) => ({
            processedImages: [...state.processedImages.filter(img => img.id !== image.id), image]
          })),

        removeProcessedImage: (imageId) =>
          set((state) => ({
            processedImages: state.processedImages.filter(img => img.id !== imageId)
          })),

        updateProcessedImage: (imageId, updateFn) =>
          set((state) => ({
            processedImages: state.processedImages.map(img =>
              img.id === imageId ? updateFn(img) : img
            )
          })),

        updateImageAssignment: (imageId, assignment) =>
          set((state) => ({
            processedImages: state.processedImages.map(img =>
              img.id === imageId
                ? { ...img, assignment }
                : img
            )
          })),

        updateImageEditState: (imageId, editState) =>
          set((state) => ({
            processedImages: state.processedImages.map(img =>
              img.id === imageId
                ? { ...img, editState }
                : img
            )
          })),

        addTextElementToImage: (imageId, textElement) =>
          set((state) => ({
            processedImages: state.processedImages.map(img => {
              if (img.id !== imageId) return img;
              
              const currentEditState = img.editState || {
                imageId,
                textElements: [],
                cropSettings: { x: 0, y: 0, width: 400, height: 400, aspectRatio: 1.0 },
                lastModified: new Date()
              };
              
              return {
                ...img,
                editState: {
                  ...currentEditState,
                  textElements: [...currentEditState.textElements, textElement],
                  lastModified: new Date()
                }
              };
            })
          })),

        updateTextElementInImage: (imageId, textElementId, updates) =>
          set((state) => ({
            processedImages: state.processedImages.map(img => {
              if (img.id !== imageId || !img.editState) return img;
              
              return {
                ...img,
                editState: {
                  ...img.editState,
                  textElements: img.editState.textElements.map(el =>
                    el.id === textElementId ? { ...el, ...updates } : el
                  ),
                  lastModified: new Date()
                }
              };
            })
          })),

        removeTextElementFromImage: (imageId, textElementId) =>
          set((state) => ({
            processedImages: state.processedImages.map(img => {
              if (img.id !== imageId || !img.editState) return img;
              
              return {
                ...img,
                editState: {
                  ...img.editState,
                  textElements: img.editState.textElements.filter(el => el.id !== textElementId),
                  lastModified: new Date()
                }
              };
            })
          })),

        setPostContent: (content) =>
          set({ postContent: content }),

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          })),

        setCurrentStep: (step) =>
          set({ currentStep: step }),

        setLoading: (loading) =>
          set({ isLoading: loading }),

        setError: (error) =>
          set({ error }),

        resetProject: () =>
          set({
            projectId: null,
            propertyText: null,
            generatedPRTexts: [],
            generatedPostContent: null,
            processedImages: [],
            postContent: null,
            currentStep: 1,
            error: null
          }),

        exportProject: () => {
          const state = get();
          if (!state.projectId || !state.propertyText) return null;
          
          return {
            id: state.projectId,
            propertyText: state.propertyText,
            generatedPRTexts: state.generatedPRTexts,
            generatedPostContent: state.generatedPostContent,
            processedImages: state.processedImages,
            postContent: state.postContent ?? undefined,
            settings: state.settings,
            createdAt: new Date(), // 実際の実装では作成日時を保存
            updatedAt: new Date()
          };
        }
      }),
      {
        name: 'instapost-app-storage',
        partialize: (state) => ({
          // 永続化する状態を選択（isHydratedは除外）
          projectId: state.projectId,
          propertyText: state.propertyText,
          generatedPRTexts: state.generatedPRTexts,
          generatedPostContent: state.generatedPostContent,
          settings: state.settings,
          currentStep: state.currentStep
          // processedImages は File オブジェクトを含むため永続化しない
        })
      }
    ),
    { name: 'instapost-app' }
  )
); 