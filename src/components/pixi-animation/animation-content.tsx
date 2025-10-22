"use client";

import { useState, useCallback, useRef, useEffect, Fragment } from "react";
import type { FC } from "react";
import { AnimationUnit } from "./animation-unit";
import { InternalAnimationState } from "../../types/animation";
import {
  AnimationController,
  AnimationSequences,
} from "./animation-controller";

export const AnimationContent: FC = () => {
  const [currentState, setCurrentState] = useState<InternalAnimationState>(
    InternalAnimationState.wait
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSequence, setCurrentSequence] = useState<string>("");

  const controllerRef = useRef<AnimationController | null>(null);

  // 初始化动画控制器
  useEffect(() => {
    controllerRef.current = new AnimationController();

    return () => {
      controllerRef.current?.destroy();
    };
  }, []);

  // 确保在组件挂载后开始播放
  useEffect(() => {
    if (isPlaying) {
      console.log("Component mounted, should start playing");
    }
  }, [isPlaying]);

  // 处理状态切换
  const handleStateChange = useCallback((newState: InternalAnimationState) => {
    setCurrentState(newState);
  }, []);

  // 处理动画完成
  const handleAnimationComplete = useCallback(() => {
    console.log("Animation completed for state:", currentState);
  }, [currentState]);

  // 播放单个状态
  const playState = useCallback((state: InternalAnimationState) => {
    controllerRef.current?.playState(state);
    setCurrentState(state);
    setCurrentSequence("");
  }, []);

  // 播放动画序列
  const playSequence = useCallback(
    (sequenceName: keyof typeof AnimationSequences) => {
      const sequence = AnimationSequences[sequenceName];
      controllerRef.current?.playSequence(sequence);
      setCurrentSequence(sequence.name);
    },
    []
  );

  // 播放控制
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      controllerRef.current?.pause();
      setIsPlaying(false);
    } else {
      controllerRef.current?.playState(currentState);
      setIsPlaying(true);
    }
  }, [isPlaying, currentState]);

  // 停止动画
  const handleStop = useCallback(() => {
    controllerRef.current?.stop();
    setIsPlaying(false);
    setCurrentSequence("");
  }, []);

  // 重置动画
  const handleReset = useCallback(() => {
    controllerRef.current?.reset();
    setCurrentState(InternalAnimationState.wait);
    setIsPlaying(false);
    setCurrentSequence("");
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* 动画显示区域 */}
      <div className="w-96 h-96 rounded-lg overflow-hidden">
        <AnimationUnit
          currentState={currentState}
          autoPlay={isPlaying}
          loop={true}
          fps={24}
          onComplete={handleAnimationComplete}
          onStateChange={handleStateChange}
        />
      </div>

      {/* 控制面板 */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
        {/* 动画序列控制 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">动画序列</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AnimationSequences).map(([key, sequence]) => (
              <button
                key={key}
                onClick={() =>
                  playSequence(key as keyof typeof AnimationSequences)
                }
                className="px-3 py-1 text-xs rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              >
                {sequence.name}
              </button>
            ))}
          </div>
        </div>

        {/* 单个状态控制 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">单个状态</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(InternalAnimationState).map(state => (
              <button
                key={state}
                onClick={() => playState(state)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  currentState === state
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {state.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePlayPause}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              isPlaying
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isPlaying ? "暂停" : "播放"}
          </button>

          <button
            onClick={handleStop}
            className="px-4 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            停止
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            重置
          </button>

          <div className="text-sm text-gray-600">
            当前状态: <span className="font-medium">{currentState}</span>
            {currentSequence && (
              <span className="ml-2 text-purple-600">
                序列: {currentSequence}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationContent;
