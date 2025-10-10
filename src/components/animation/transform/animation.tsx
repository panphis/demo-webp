"use client";

import { Config } from "@/types";
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  // 是否循环
  loop: boolean;
  // 动画持续时间（毫秒）- 可选，如果指定fps则忽略此参数
  duration?: number;
  // 目标帧率（fps）- 如果指定则会覆盖duration
  fps?: number;
  // 容器宽度（可选，默认使用单元格宽度）
  containerWidth?: number;
  // 容器高度（可选，默认使用单元格高度）
  containerHeight?: number;
  // 性能模式：true 为高性能模式，会在低性能设备上降级
  performanceMode?: boolean;
};

// DPR 变化检测 Hook
const useDPR = () => {
  const [dpr, setDPR] = useState(() => window.devicePixelRatio || 1);

  useEffect(() => {
    const handleDPRChange = () => {
      setDPR(window.devicePixelRatio || 1);
    };

    // 监听 DPR 变化
    const media = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    media.addEventListener("change", handleDPRChange);

    return () => {
      media.removeEventListener("change", handleDPRChange);
    };
  }, []);

  return dpr;
};

// 性能监控 Hook
const usePerformanceMonitor = () => {
  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(0);

  const recordFrame = useCallback(() => {
    const now = performance.now();
    if (lastFrameTime.current > 0) {
      const frameTime = now - lastFrameTime.current;
      frameTimeRef.current.push(frameTime);

      // 只保留最近 60 帧的数据
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }
    }
    lastFrameTime.current = now;
  }, []);

  const getAverageFrameTime = useCallback(() => {
    const times = frameTimeRef.current;
    if (times.length === 0) {
      return 0;
    }
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }, []);

  const isPerformancePoor = useCallback(() => {
    return getAverageFrameTime() > 20; // 超过 20ms 认为性能较差
  }, [getAverageFrameTime]);

  return { recordFrame, isPerformancePoor };
};

export const Animation: FC<Props & Config> = ({
  width,
  height,
  cellWidth,
  cellHeight,
  count,
  imgSrc,
  loop,
  duration = 3000,
  fps,
  containerWidth,
  containerHeight,
  performanceMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentFrameRef = useRef(0);

  // 使用自定义 Hooks
  const dpr = useDPR();
  const { recordFrame, isPerformancePoor } = usePerformanceMonitor();

  // 性能降级状态
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);

  // 计算实际使用的容器尺寸（稳定的值，不随 DPR 变化）
  const containerDimensions = useMemo(
    () => ({
      width: containerWidth || cellWidth,
      height: containerHeight || cellHeight,
    }),
    [containerWidth, containerHeight, cellWidth, cellHeight]
  );

  // 计算缩放比例（与原始代码保持一致）
  const scaleInfo = useMemo(() => {
    const scaleX = containerDimensions.width / cellWidth;
    const scaleY = containerDimensions.height / cellHeight;
    return { scaleX, scaleY };
  }, [
    containerDimensions.width,
    containerDimensions.height,
    cellWidth,
    cellHeight,
  ]);

  // 计算基础布局信息（不依赖 DPR）
  const layoutInfo = useMemo(() => {
    const cols = Math.floor(width / cellWidth);
    const rows = Math.ceil(count / cols);
    return { cols, rows };
  }, [width, cellWidth, count]);

  // 计算缩放后的精灵图尺寸
  const scaledSpriteSize = useMemo(
    () => ({
      width: width * scaleInfo.scaleX,
      height: height * scaleInfo.scaleY,
      cellWidth: cellWidth * scaleInfo.scaleX,
      cellHeight: cellHeight * scaleInfo.scaleY,
    }),
    [width, height, cellWidth, cellHeight, scaleInfo.scaleX, scaleInfo.scaleY]
  );

  // 计算所有帧的transform位置（使用CSS transform替代backgroundPosition）
  const frameTransforms = useMemo(() => {
    const transforms: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / layoutInfo.cols);
      const col = i % layoutInfo.cols;
      // 现在精灵图元素尺寸等于整个缩放后精灵图，通过负值移动显示不同区域
      // 要显示第1列，需要将大元素向左移动，让容器窗口看到右侧内容
      const translateX = -col * scaledSpriteSize.cellWidth;
      const translateY = -row * scaledSpriteSize.cellHeight;
      transforms.push(`translate(${translateX}px, ${translateY}px)`);
    }
    console.log(transforms);
    return transforms;
  }, [
    count,
    layoutInfo.cols,
    scaledSpriteSize.cellWidth,
    scaledSpriteSize.cellHeight,
  ]);

  // 优化的动画更新函数
  const updateFrame = useCallback(
    (frameIndex: number) => {
      if (!spriteRef.current) {
        return;
      }

      // 最终安全检查：防止访问无效帧
      const safeFrameIndex = Math.max(
        0,
        Math.min(Math.floor(frameIndex), count - 1)
      );

      // 确保不会访问超出精灵图范围的区域
      if (
        safeFrameIndex >= 0 &&
        safeFrameIndex < frameTransforms.length &&
        safeFrameIndex < count
      ) {
        const transform = frameTransforms[safeFrameIndex];
        if (
          transform &&
          typeof transform === "string" &&
          transform.length > 0
        ) {
          spriteRef.current.style.transform = transform;
        } else {
          // 后备：使用第0帧
          spriteRef.current.style.transform =
            frameTransforms[0] || "translate(0px, 0px)";
        }
      } else {
        // 使用最后一个有效帧
        const lastValidFrame = Math.min(count - 1, frameTransforms.length - 1);
        if (lastValidFrame >= 0) {
          spriteRef.current.style.transform = frameTransforms[lastValidFrame];
        }
      }
    },
    [frameTransforms, count]
  );

  // 性能监控和降级逻辑
  const checkPerformance = useCallback(() => {
    if (performanceMode && isPerformancePoor()) {
      setIsLowPerformanceMode(true);
    }
  }, [performanceMode, isPerformancePoor]);

  // 增强动画配置计算（防止精度问题）
  const animationConfig = useMemo(() => {
    if (fps) {
      // 使用更精确的计算，避免浮点数精度问题
      const calculatedDuration = Math.round((count / fps) * 1000);
      const frameInterval = Math.round((1000 / fps) * 100) / 100; // 保留2位小数
      return { duration: calculatedDuration, frameInterval };
    } else {
      const frameInterval = Math.round((duration / count) * 100) / 100; // 保留2位小数
      return { duration, frameInterval };
    }
  }, [fps, count, duration]);

  // 优化的动画循环（防止空白帧闪烁）
  const animate = useCallback(() => {
    const { duration: actualDuration, frameInterval } = animationConfig;
    let startTime: number | null = null;
    let frameCounter = 0;
    let lastFrameIndex = 0; // 记录上一帧，防止大跳跃

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;

      // �� 修复：更严格的帧索引计算
      let frameIndex: number;

      if (isLowPerformanceMode) {
        // 低性能模式的安全计算
        const cycleElapsed = elapsed % actualDuration;
        const rawFrameIndex = cycleElapsed / frameInterval;
        const normalFrameIndex = Math.floor(rawFrameIndex);

        // 确保 normalFrameIndex 在有效范围内
        const safeNormalIndex = Math.max(
          0,
          Math.min(normalFrameIndex, count - 1)
        );
        frameIndex = Math.floor(safeNormalIndex / 2) * 2; // 只播放偶数帧

        // 双重检查：确保偶数帧不超范围
        frameIndex = Math.max(0, Math.min(frameIndex, count - 1));
      } else {
        // 正常模式的安全计算
        const cycleElapsed = elapsed % actualDuration;
        const rawFrameIndex = cycleElapsed / frameInterval;
        frameIndex = Math.floor(rawFrameIndex);

        // 严格限制在有效范围内
        frameIndex = Math.max(0, Math.min(frameIndex, count - 1));
      }

      // 🔥 新增：防止大幅跳跃的平滑逻辑
      if (Math.abs(frameIndex - lastFrameIndex) > 3 && lastFrameIndex > 0) {
        // 如果跳跃超过3帧，进行平滑过渡
        const direction = frameIndex > lastFrameIndex ? 1 : -1;
        frameIndex = lastFrameIndex + direction * 3;
        frameIndex = Math.max(0, Math.min(frameIndex, count - 1));
      }

      // 🔥 最终安全检查：确保 frameIndex 绝对安全
      if (
        !Number.isInteger(frameIndex) ||
        frameIndex < 0 ||
        frameIndex >= count
      ) {
        console.warn(
          `Invalid frameIndex ${frameIndex}, using fallback ${lastFrameIndex}`
        );
        frameIndex = lastFrameIndex; // 使用上一帧作为后备
      }

      // 只在帧真正变化时更新
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        lastFrameIndex = frameIndex; // 更新记录
        updateFrame(frameIndex);

        // 性能监控
        recordFrame();
        frameCounter++;

        // 每 30 帧检查一次性能
        if (frameCounter % 30 === 0) {
          checkPerformance();
        }
      }

      // 检查是否需要继续动画
      if (loop || elapsed < actualDuration) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        // 非循环动画结束，确保停在最后一帧
        const finalFrame = count - 1;
        updateFrame(finalFrame);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  }, [
    animationConfig,
    count,
    loop,
    updateFrame,
    recordFrame,
    checkPerformance,
    isLowPerformanceMode,
  ]);

  // DPR 变化时的处理
  useEffect(() => {
    // DPR变化时重置性能状态
    setIsLowPerformanceMode(false);
  }, [dpr]);

  // 启动动画
  useEffect(() => {
    if (!spriteRef.current) {
      return;
    }

    // 初始化第一帧
    updateFrame(0);

    // 开始动画
    animate();

    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateFrame, animate]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${containerDimensions.width}px`,
        height: `${containerDimensions.height}px`,
        overflow: "hidden",
        position: "relative",
        // 启用硬件加速
        willChange: "transform",
        backfaceVisibility: "hidden",
        perspective: 1000,
      }}
    >
      <div
        ref={spriteRef}
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          width: `${scaledSpriteSize.width}px`,
          height: `${scaledSpriteSize.height}px`,
          position: "absolute",
          top: 0,
          left: 0,
          // GPU加速相关属性
          willChange: "transform",
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
          // 初始transform
          transform: "translate(0px, 0px)",
          // 在低性能模式下禁用一些CSS特效
          ...(isLowPerformanceMode && {
            filter: "none",
            boxShadow: "none",
          }),
        }}
      />
    </div>
  );
};
