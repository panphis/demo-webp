"use client";

import { useEffect, useState } from "react";
import { animationSequenceManager } from "./animation-sequence-manager";

type Props = {
  onPreloadComplete?: () => void;
  onPreloadProgress?: (progress: number) => void;
};

export const ResourcePreloader: React.FC<Props> = ({ 
  onPreloadComplete, 
  onPreloadProgress 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const preloadResources = async () => {
      try {
        setIsLoading(true);
        setProgress(0);

        // 开始预加载
        const preloadPromise = animationSequenceManager.preloadResources();

        // 模拟进度更新（实际项目中可以基于真实进度）
        const progressInterval = setInterval(() => {
          const stats = animationSequenceManager.getResourceStats();
          const currentProgress = (stats.loaded / stats.total) * 100;
          setProgress(Math.min(currentProgress, 95)); // 最多显示95%，等待完成
          onPreloadProgress?.(currentProgress);
        }, 100);

        await preloadPromise;

        clearInterval(progressInterval);
        setProgress(100);
        onPreloadProgress?.(100);
        onPreloadComplete?.();
      } catch (error) {
        console.error("[ResourcePreloader] 预加载失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadResources();
  }, [onPreloadComplete, onPreloadProgress]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-center">
          正在加载动画资源...
        </h3>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {Math.round(progress)}% 完成
        </div>
      </div>
    </div>
  );
};
