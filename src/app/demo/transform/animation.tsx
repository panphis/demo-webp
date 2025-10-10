"use client";

import { type FC, useId, useEffect, useMemo, useRef } from "react";

type Props = {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  count: number;
  imgSrc: string;
  // 是否循环
  loop: boolean;
  // 动画持续时间（毫秒）- 可选，如果指定fps则忽略此参数
  duration?: number;
  // 容器宽度（可选，默认使用单元格宽度）
  containerWidth?: number;
  // 容器高度（可选，默认使用单元格高度）
  containerHeight?: number;
  // 性能模式：true 为高性能模式，会在低性能设备上降级
  performanceMode?: boolean;
};

const animationNamePrefix = "animation";
export const Animation: FC<Props> = ({
  width,
  height,
  cellWidth,
  cellHeight,
  count,
  imgSrc,
  duration = 2,
  containerWidth,
  containerHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const currentFrameRef = useRef(0);
  const id = useId();
  const time = useMemo(() => {
    return duration / count;
  }, [duration, count]);

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
    return transforms;
  }, [
    count,
    layoutInfo.cols,
    scaledSpriteSize.cellWidth,
    scaledSpriteSize.cellHeight,
  ]);

  // 生成真正的步进式CSS关键帧动画
  const keyframes = useMemo(() => {
    let keyframeRules = "";
    for (let i = 0; i < count; i++) {
      const percentage = (i / count) * 100;
      const row = Math.floor(i / layoutInfo.cols);
      const col = i % layoutInfo.cols;
      // 现在精灵图元素尺寸等于整个缩放后精灵图，通过负值移动显示不同区域
      // 要显示第1列，需要将大元素向左移动，让容器窗口看到右侧内容
      const translateX = -col * scaledSpriteSize.cellWidth;
      const translateY = -row * scaledSpriteSize.cellHeight;

      keyframeRules += `
        ${percentage.toFixed(2)}% {
          transform: translate(${translateX}px, ${translateY}px);
        }
      `;
    }

    // 添加 100% 关键帧，回到第一帧（循环）
    keyframeRules += `
      100% {
        background-position: 0px 0px;
      }
    `;
    return `
      @keyframes ${animationNamePrefix}-${id} {
        ${keyframeRules}
      }
    `;
  }, [
    id,
    count,
    layoutInfo.cols,
    containerDimensions,
    count,
    layoutInfo.cols,
    scaledSpriteSize.cellWidth,
    scaledSpriteSize.cellHeight,
  ]);

  // 动画CSS属性 - 使用 steps() 确保精确的帧切换
  const animationStyle = useMemo(() => {
    return {
      animation: `${animationNamePrefix}-${id} ${duration}s steps(1) infinite`,
    };
  }, [id, duration]);

  // useEffect(() => {
  //   const dom = spriteRef.current;
  //   if (!dom) {
  //     return;
  //   }
  //   const interval = setInterval(() => {
  //     dom.style.transform = frameTransforms[currentFrameRef.current];
  //     currentFrameRef.current++;
  //     if (currentFrameRef.current >= count) {
  //       currentFrameRef.current = 0;
  //     }
  //   }, time);
  //   return () => clearInterval(interval);
  // }, [frameTransforms]);

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
      <style
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: keyframes }}
      />
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
          ...animationStyle,
        }}
      />
    </div>
  );
};
