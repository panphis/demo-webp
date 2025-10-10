"use client";

import { Config } from "@/types";
import { useMemo, useId } from "react";

type Props = {
  // 动画持续时间（秒）
  duration?: number;
  // 容器宽度（可选，默认使用单元格宽度）
  containerWidth?: number;
  // 容器高度（可选，默认使用单元格高度）
  containerHeight?: number;
};

const animationNamePrefix = "animation";

export const Animation: React.FC<Props & Config> = ({
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
  // 计算实际使用的容器尺寸
  const containerDimensions = useMemo(
    () => ({
      width: containerWidth || cellWidth,
      height: containerHeight || cellHeight,
    }),
    [containerWidth, containerHeight, cellWidth, cellHeight]
  );

  // 计算基础布局信息
  const layoutInfo = useMemo(() => {
    const cols = Math.floor(width / cellWidth);
    const rows = Math.ceil(count / cols);
    return { cols, rows };
  }, [width, cellWidth, count]);

  const id = useId();

  // 计算精灵图的缩放比例和背景尺寸
  const backgroundSize = useMemo(() => {
    const scaleX = containerDimensions.width / cellWidth;
    const scaleY = containerDimensions.height / cellHeight;
    return {
      width: width * scaleX,
      height: height * scaleY,
    };
  }, [containerDimensions, cellWidth, cellHeight, width, height]);

  // 生成真正的步进式CSS关键帧动画
  const keyframes = useMemo(() => {
    let keyframeRules = "";

    // 为每一帧生成精确的关键帧
    for (let i = 0; i < count; i++) {
      const percentage = (i / count) * 100;
      const row = Math.floor(i / layoutInfo.cols);
      const col = i % layoutInfo.cols;

      // 计算当前帧在精灵图中的位置（像素值）
      const bgX = -col * containerDimensions.width;
      const bgY = -row * containerDimensions.height;

      keyframeRules += `
        ${percentage.toFixed(2)}% {
          background-position: ${bgX}px ${bgY}px;
        }
      `;
    }

    // 添加 100% 关键帧，回到第一帧（循环）
    keyframeRules += `
      100% {
        background-position: 0px 0px;
      }
    `;
    console.log(keyframeRules);
    return `
        @keyframes ${animationNamePrefix}-${id} {
        ${keyframeRules}
      }
    `;
  }, [id, count, layoutInfo.cols, containerDimensions]);

  // 动画CSS属性 - 使用 steps() 确保精确的帧切换
  const animationStyle = useMemo(() => {
    return {
      animation: `${animationNamePrefix}-${id} ${duration}s steps(1) infinite`,
    };
  }, [id, duration]);

  return (
    <>
      {/* 注入CSS动画 */}
      <style
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: keyframes }}
      />

      <div
        suppressHydrationWarning={true}
        style={{
          width: `${containerDimensions.width}px`,
          height: `${containerDimensions.height}px`,
          overflow: "hidden",
          position: "relative",
          // 启用硬件加速
          willChange: "background-position",
          backfaceVisibility: "hidden",
          backgroundImage: `url(${imgSrc})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${backgroundSize.width}px ${backgroundSize.height}px`,
          backgroundPosition: "0px 0px",
          transform: "translateZ(0)",
          // 应用CSS动画
          ...animationStyle,
        }}
      />
    </>
  );
};
