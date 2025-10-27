"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { FC } from "react";
import { Application, AnimatedSprite, Texture } from "pixi.js";
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
  /** 动画完成回调 */
  onComplete?: () => void;
}

export const AnimationUnit: FC<AnimationUnitProps> = ({
  currentState = InternalAnimationState.wait,
  autoPlay = true,
  loop = false,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const spriteRef = useRef<AnimatedSprite | null>(null);
  const currentResourceRef = useRef<any>(null); // 存储当前资源引用
  const onCompleteRef = useRef(onComplete); // 使用 ref 保存最新的 onComplete
  const animationRef = useRef<{
    currentFrame: number;
    totalFrames: number;
    isPlaying: boolean;
    timeoutId?: NodeJS.Timeout;
  }>({
    currentFrame: 0,
    totalFrames: 0,
    isPlaying: false,
  });

  // 更新 onComplete ref - 确保闭包中总是使用最新的回调
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const { loading, resources } = useAnimationResources();
  const [isInitialized, setIsInitialized] = useState(false);
  const [containerSize, setContainerSize] = useState({
    width: 400,
    height: 400,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

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
    if (!canvasRef.current || appRef.current || !mountedRef.current) {
      return;
    }

    try {
      const app = new Application();
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
  }, [containerSize.width, containerSize.height]);

  // 更新 sprite 的 textures（用于状态切换）
  const updateSpriteTextures = useCallback(
    (
      frames: Texture[],
      totalFrames: number,
      fps: number,
      shouldAutoPlay: boolean
    ) => {
      if (!spriteRef.current) return;

      // 停止当前动画
      animationRef.current.isPlaying = false;
      if (animationRef.current.timeoutId) {
        clearTimeout(animationRef.current.timeoutId);
        animationRef.current.timeoutId = undefined;
      }

      // 更新动画状态
      animationRef.current.currentFrame = 0;
      animationRef.current.totalFrames = totalFrames;

      // 更新 sprite 的第一帧
      spriteRef.current.texture = frames[0];

      // 如果自动播放，重新启动动画
      if (shouldAutoPlay) {
        animationRef.current.isPlaying = true;
        const frameTime = 1000 / fps;
        animationRef.current.timeoutId = setTimeout(() => {
          animateWithRef(frames, totalFrames, fps);
        }, frameTime);
      }
    },
    []
  );

  // 动画驱动函数 - 使用 setTimeout 精确控制播放速度
  const animateWithRef = (
    frames: Texture[],
    totalFrames: number,
    fps: number
  ) => {
    if (!spriteRef.current || !animationRef.current.isPlaying) {
      return;
    }

    try {
      const currentFrame = animationRef.current.currentFrame;
      spriteRef.current.texture = frames[currentFrame];

      // 计算下一帧
      let nextFrame = currentFrame + 1;

      // 检查是否超过最后一帧
      if (nextFrame >= totalFrames) {
        onCompleteRef.current?.();
        if (loop) {
          nextFrame = 0; // 循环播放
        } else {
          // 单次播放：停留在最后一帧
          animationRef.current.isPlaying = false;
          return;
        }
      }

      animationRef.current.currentFrame = nextFrame;

      // 计算下一帧需要的等待时间（毫秒）
      const frameTime = 1000 / fps;
      animationRef.current.timeoutId = setTimeout(() => {
        animateWithRef(frames, totalFrames, fps);
      }, frameTime);
    } catch (error) {
      console.warn("[AnimationUnit] Animation error:", error);
    }
  };

  // 创建动画精灵
  const createAnimatedSprite = useCallback(async () => {
    if (!appRef.current || !currentResource) return;

    try {
      const { frames } = currentResource;
      const totalFrames = frames.length;

      if (totalFrames === 0) {
        return;
      }

      // 如果 sprite 已存在，只更新 textures，不重新创建
      if (
        spriteRef.current &&
        appRef.current.stage.children.includes(spriteRef.current)
      ) {
        const fps = currentResource.config.fps;
        updateSpriteTextures(frames, totalFrames, fps, autoPlay);
        return;
      }

      // 清理现有精灵
      if (spriteRef.current) {
        appRef.current.stage.removeChild(spriteRef.current);
        spriteRef.current.destroy();
      }

      // 创建精灵并设置第一帧
      const sprite = new AnimatedSprite({
        textures: frames,
        autoUpdate: false,
      });
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
      if (animationRef.current.timeoutId) {
        clearTimeout(animationRef.current.timeoutId);
      }
      animationRef.current = {
        currentFrame: 0,
        totalFrames,
        isPlaying: false,
      };

      // 如果自动播放，开始动画
      if (autoPlay) {
        const fps = currentResource.config.fps;
        const frameTime = 1000 / fps;
        animationRef.current.isPlaying = true;
        animationRef.current.timeoutId = setTimeout(() => {
          animateWithRef(frames, totalFrames, fps);
        }, frameTime);
      }
    } catch (error) {
      console.error("Failed to create animated sprite:", error);
    }
  }, [containerSize.width, containerSize.height, currentResource]);

  // 开始动画
  const startAnimation = useCallback(() => {
    if (!spriteRef.current || !currentResource) return;

    const totalFrames = spriteRef.current.textures.length;
    if (totalFrames === 0) return;

    const fps = currentResource.config.fps;
    const frames = currentResource.frames;
    const frameTime = 1000 / fps;

    if (animationRef.current.timeoutId) {
      clearTimeout(animationRef.current.timeoutId);
    }

    animationRef.current.isPlaying = true;
    animationRef.current.totalFrames = totalFrames;
    animationRef.current.timeoutId = setTimeout(() => {
      animateWithRef(frames, totalFrames, fps);
    }, frameTime);
  }, [currentResource]);

  // 停止动画
  const stopAnimation = useCallback(() => {
    animationRef.current.isPlaying = false;
    if (animationRef.current.timeoutId) {
      clearTimeout(animationRef.current.timeoutId);
      animationRef.current.timeoutId = undefined;
    }
  }, []);

  // 重置动画
  const resetAnimation = useCallback(() => {
    stopAnimation();
    animationRef.current.currentFrame = 0;
    if (spriteRef.current && currentResourceRef.current) {
      spriteRef.current.texture = currentResourceRef.current.frames[0];
    }
  }, [stopAnimation]);

  // 初始化 PIXI 应用
  useEffect(() => {
    if (
      canvasRef.current &&
      containerSize.width > 0 &&
      containerSize.height > 0 &&
      mountedRef.current
    ) {
      initializePixi();
    }
  }, [
    canvasRef.current,
    containerSize.width,
    containerSize.height,
    initializePixi,
  ]);

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
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (animationRef.current.timeoutId) {
        clearTimeout(animationRef.current.timeoutId);
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  // 当资源加载完成或状态改变时创建/更新动画精灵
  useEffect(() => {
    if (isInitialized && currentResource && !loading) {
      createAnimatedSprite();
    }
  }, [
    isInitialized,
    currentResource,
    loading,
    createAnimatedSprite,
    currentState,
  ]);

  // 暴露控制方法
  const controls = useMemo(
    () => ({
      play: startAnimation,
      pause: stopAnimation,
      reset: resetAnimation,
    }),
    [startAnimation, stopAnimation, resetAnimation]
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
