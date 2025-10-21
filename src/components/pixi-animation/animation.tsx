"use client";

import { useState, useRef, useEffect } from "react";
import type { FC } from "react";

import { useAnimationResources } from "./resource-cache";
import { Placeholder } from "./placeholder";
import AnimationContent from "./animation-content";

export const Animation: FC = () => {
  const [hasError, setHasError] = useState(false);
  const { loading, resources } = useAnimationResources();

  // 检查是否在客户端环境
  useEffect(() => {
    if (typeof window === "undefined") {
      setHasError(true);
    }
  }, []);

  // 错误处理
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">动画组件需要客户端环境</div>
      </div>
    );
  }

  console.log(loading, resources);

  return (
    <div className="w-full h-full">
      {loading ? <Placeholder /> : <AnimationContent />}
    </div>
  );
};
export default Animation;
