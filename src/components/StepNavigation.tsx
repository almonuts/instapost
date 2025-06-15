'use client';

import React from 'react';
import { ChevronRight, Camera, FileText, Sparkles, Palette, Download } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export const StepNavigation: React.FC = () => {
  const { currentStep, setCurrentStep, processedImages, propertyText, generatedPRTexts, generatedPostContent } = useAppStore();

  const steps = [
    {
      id: 1,
      title: '画像',
      icon: Camera,
      isCompleted: processedImages.length > 0
    },
    {
      id: 2,
      title: '物件情報',
      icon: FileText,
      isCompleted: !!propertyText
    },
    {
      id: 3,
      title: 'AI生成',
      icon: Sparkles,
      isCompleted: generatedPRTexts.length > 0 && !!generatedPostContent
    },
    {
      id: 4,
      title: '編集',
      icon: Palette,
      isCompleted: false
    },
    {
      id: 5,
      title: 'DL',
      icon: Download,
      isCompleted: false
    }
  ];

  const handleStepClick = (stepId: number) => {
    if (stepId <= getMaxAccessibleStep()) {
      setCurrentStep(stepId);
    }
  };

  const getMaxAccessibleStep = () => {
    if (!processedImages.length) return 1;
    if (!propertyText) return 2;
    if (!generatedPRTexts.length) return 3;
    return 5;
  };

  const getStepStatus = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step?.isCompleted) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId <= getMaxAccessibleStep()) return 'accessible';
    return 'locked';
  };

  const getCompletionPercentage = () => {
    const completedSteps = steps.filter(step => step.isCompleted).length;
    return (completedSteps / steps.length) * 100;
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const IconComponent = step.icon;
            const isClickable = status !== 'locked';
            
            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => isClickable && handleStepClick(step.id)}
                  className={`
                    group relative flex flex-col items-center px-4 py-3 rounded-xl transition-all duration-300 min-w-[80px]
                    ${status === 'current' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' 
                      : status === 'completed' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105' 
                        : status === 'accessible'
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                          : 'bg-gray-50 text-gray-400'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {/* アイコン/ステップ番号 */}
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg mb-2 transition-all duration-300
                    ${status === 'current' 
                      ? 'bg-white/20 text-white' 
                      : status === 'completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-transparent'
                    }
                  `}>
                    {status === 'completed' ? (
                      <span className="text-sm font-bold">✓</span>
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>

                  {/* ステップタイトル */}
                  <span className={`text-xs font-medium ${
                    status === 'current' ? 'text-white' : ''
                  }`}>
                    {step.title}
                  </span>

                  {/* アクティブインジケーター */}
                  {status === 'current' && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* 接続線 */}
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 transition-all duration-300
                    ${getStepStatus(step.id) === 'completed' && getStepStatus(steps[index + 1].id) !== 'locked'
                      ? 'bg-gradient-to-r from-green-400 to-purple-400' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 進捗バー */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          
          {/* 進捗テキスト */}
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">
              ステップ {currentStep} / {steps.length}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {Math.round(getCompletionPercentage())}% 完了
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 