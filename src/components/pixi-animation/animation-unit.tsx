"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { FC } from "react";
import * as PIXI from "pixi.js";
import { useAnimationResources } from "./resource-cache";
import { InternalAnimationState } from "../../types/animation";
import { Placeholder } from "./placeholder";

interface AnimationUnitProps {
  /** 当前动画状态 */
  currentState?: InternalAnimationState;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 是否循环播放 */
  loop?: boolean;
  /** 动画播放速度 (fps) */
  fps?: number;
  /** 动画完成回调 */
  onComplete?: () => void;
  /** 状态切换回调 */
  onStateChange?: (state: InternalAnimationState) => void;
}

export const AnimationUnit: FC<AnimationUnitProps> = ({
  currentState = InternalAnimationState.wait,
  autoPlay = true,
  loop = false,
  onComplete,
  onStateChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const spriteRef = useRef<PIXI.Sprite | null>(null);
  const animationRef = useRef<{
    currentFrame: number;
    totalFrames: number;
    isPlaying: boolean;
    animationId?: number;
    timeoutId?: NodeJS.Timeout;
  }>({
    currentFrame: 0,
    totalFrames: 0,
    isPlaying: false,
  });

  const { loading, resources } = useAnimationResources();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [containerSize, setContainerSize] = useState({
    width: 400,
    height: 400,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取当前状态的资源
  const currentResource = useMemo(() => {
    return resources[currentState];
  }, [resources, currentState]);

  // 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;

    // 使用 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 初始获取容器尺寸
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  // 初始化 PIXI 应用
  const initializePixi = useCallback(async () => {
    if (!canvasRef.current || appRef.current || !isMounted) {
      return;
    }

    try {
      const app = new PIXI.Application();
      await app.init({
        canvas: canvasRef.current,
        width: containerSize.width,
        height: containerSize.height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      appRef.current = app;
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize PIXI:", error);
    }
  }, [containerSize.width, containerSize.height, isMounted]);

  // 创建动画精灵
  const createAnimatedSprite = useCallback(async () => {
    if (!appRef.current || !currentResource) return;

    try {
      // 清理现有精灵
      if (spriteRef.current) {
        appRef.current.stage.removeChild(spriteRef.current);
        spriteRef.current.destroy();
      }

      const { frames } = currentResource;
      const totalFrames = frames.length;

      if (totalFrames === 0) {
        return;
      }

      // 创建精灵并设置第一帧
      const sprite = new PIXI.Sprite(frames[0]);
      sprite.anchor.set(0.5);
      sprite.x = containerSize.width / 2;
      sprite.y = containerSize.height / 2;

      // 缩放以适应容器
      const scale = Math.min(
        containerSize.width / 1000,
        containerSize.height / 1000
      );
      sprite.scale.set(scale);

      appRef.current.stage.addChild(sprite);
      spriteRef.current = sprite;

      // 更新动画状态
      animationRef.current = {
        currentFrame: 0,
        totalFrames,
        isPlaying: false,
      };

      // 如果自动播放，开始动画
      if (autoPlay) {
        // 直接在这里开始动画，避免循环依赖
        animationRef.current.isPlaying = true;
        animationRef.current.totalFrames = totalFrames;

        const animate = () => {
          if (!animationRef.current.isPlaying || !spriteRef.current) return;

          const { currentFrame, totalFrames } = animationRef.current;

          // 更新当前帧
          spriteRef.current.texture = frames[currentFrame];

          // 计算下一帧
          let nextFrame = currentFrame + 1;

          // 检查是否到达最后一帧
          if (nextFrame >= totalFrames) {
            if (loop) {
              nextFrame = 0; // 循环播放
            } else {
              // 单次播放完成
              animationRef.current.isPlaying = false;
              onComplete?.();
              return;
            }
          }

          animationRef.current.currentFrame = nextFrame;
          animationRef.current.animationId = requestAnimationFrame(animate);
        };

        // 开始动画循环
        const frameInterval = 1000 / currentResource.config.fps;
        animationRef.current.timeoutId = setTimeout(() => {
          animationRef.current.animationId = requestAnimationFrame(animate);
        }, frameInterval);
      }
    } catch (error) {
      console.error("Failed to create animated sprite:", error);
    }
  }, [
    currentResource,
    containerSize.width,
    containerSize.height,
    autoPlay,
    loop,
    currentResource,
    onComplete,
  ]);

  // 开始动画
  const startAnimation = useCallback(() => {
    if (!spriteRef.current || !currentResource) return;

    const { frames } = currentResource;
    const totalFrames = frames.length;

    if (totalFrames === 0) return;

    animationRef.current.isPlaying = true;
    animationRef.current.totalFrames = totalFrames;

    const animate = () => {
      if (!animationRef.current.isPlaying || !spriteRef.current) return;

      const { currentFrame, totalFrames } = animationRef.current;

      // 更新当前帧
      spriteRef.current.texture = frames[currentFrame];

      // 计算下一帧
      let nextFrame = currentFrame + 1;

      // 检查是否到达最后一帧
      if (nextFrame >= totalFrames) {
        if (loop) {
          nextFrame = 0; // 循环播放
        } else {
          // 单次播放完成
          animationRef.current.isPlaying = false;
          onComplete?.();
          return;
        }
      }

      animationRef.current.currentFrame = nextFrame;
      animationRef.current.animationId = requestAnimationFrame(animate);
    };

    // 开始动画循环
    const frameInterval = 1000 / currentResource.config.fps;
    animationRef.current.timeoutId = setTimeout(() => {
      animationRef.current.animationId = requestAnimationFrame(animate);
    }, frameInterval);
  }, [currentResource, loop, onComplete]);

  // 停止动画
  const stopAnimation = useCallback(() => {
    animationRef.current.isPlaying = false;
    if (animationRef.current.animationId) {
      cancelAnimationFrame(animationRef.current.animationId);
      animationRef.current.animationId = undefined;
    }
    if (animationRef.current.timeoutId) {
      clearTimeout(animationRef.current.timeoutId);
      animationRef.current.timeoutId = undefined;
    }
  }, []);

  // 重置动画
  const resetAnimation = useCallback(() => {
    stopAnimation();
    animationRef.current.currentFrame = 0;
    if (spriteRef.current && currentResource) {
      spriteRef.current.texture = currentResource.frames[0];
    }
  }, [stopAnimation, currentResource]);

  // 切换动画状态
  const changeState = useCallback(
    (newState: InternalAnimationState) => {
      if (newState !== currentState) {
        onStateChange?.(newState);
      }
    },
    [currentState, onStateChange]
  );

  // 组件挂载状态管理
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // 监听 canvas 元素挂载
  useEffect(() => {
    if (
      canvasRef.current &&
      isMounted &&
      containerSize.width > 0 &&
      containerSize.height > 0
    ) {
      // 使用 setTimeout 确保 canvas 完全渲染
      setTimeout(() => {
        initializePixi();
      }, 100);
    }
  }, [
    canvasRef.current,
    isMounted,
    containerSize.width,
    containerSize.height,
    initializePixi,
  ]);

  // 初始化 PIXI 应用
  useEffect(() => {
    if (
      containerSize.width > 0 &&
      containerSize.height > 0 &&
      isMounted &&
      canvasRef.current
    ) {
      initializePixi();
    }
  }, [initializePixi, containerSize.width, containerSize.height, isMounted]);

  // 当容器尺寸变化时，重新调整 PIXI 应用
  useEffect(() => {
    if (
      appRef.current &&
      isInitialized &&
      containerSize.width > 0 &&
      containerSize.height > 0
    ) {
      appRef.current.renderer.resize(containerSize.width, containerSize.height);
      // 重新创建动画精灵以适应新尺寸
      if (currentResource) {
        createAnimatedSprite();
      }
    }
  }, [
    containerSize.width,
    containerSize.height,
    isInitialized,
    currentResource,
    createAnimatedSprite,
  ]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  // 当资源加载完成时创建动画精灵
  useEffect(() => {
    if (isInitialized && currentResource && !loading) {
      createAnimatedSprite();
    }
  }, [isInitialized, currentResource, loading, createAnimatedSprite]);

  // 当状态改变时重新创建动画
  useEffect(() => {
    if (currentResource && isInitialized) {
      createAnimatedSprite();
    }
  }, [currentState, createAnimatedSprite, currentResource, isInitialized]);

  // 暴露控制方法
  const controls = useMemo(
    () => ({
      play: startAnimation,
      pause: stopAnimation,
      reset: resetAnimation,
      changeState,
    }),
    [startAnimation, stopAnimation, resetAnimation, changeState]
  );

  // 将控制方法暴露给父组件（通过 ref）
  useEffect(() => {
    if (canvasRef.current) {
      (canvasRef.current as any).animationControls = controls;
    }
  }, [controls]);

  // 始终渲染 canvas，必要时以占位层覆盖，避免初始化死锁
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ minHeight: "200px" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {(loading || !isInitialized) && (
        <div className="absolute inset-0">
          <Placeholder />
        </div>
      )}
      {!loading && isInitialized && !currentResource && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Animation resource not available</div>
        </div>
      )}
    </div>
  );
};

export default AnimationUnit;
