"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { FC } from "react";
import { AnimationUnit } from "./animation-unit";
import { InternalAnimationState } from "../../types/animation";
import { AnimationController } from "./animation-controller";

export enum AnimationStatus {
  THINKING = "thinking",
  LISTENING = "listening",
  SPEAKING = "speaking",
}

type AnimationContentProps = {
  status: AnimationStatus;
};

export const AnimationContent: FC<AnimationContentProps> = ({ status }) => {
  const [currentState, setCurrentState] = useState<InternalAnimationState>(
    InternalAnimationState.wait
  );

  const controllerRef = useRef<AnimationController | null>(null);

  // 初始化动画控制器
  useEffect(() => {
    controllerRef.current = new AnimationController();
    return () => {
      controllerRef.current?.destroy();
    };
  }, []);

  // 处理动画完成
  const handleAnimationComplete = useCallback(() => {
    console.log(
      "Animation completed for status:",
      status,
      "currentState:",
      currentState
    );
    // console.log("Animation completed for state:", currentState);
    // thinking
    // 循环播放 wait 状态
    // listening
    // 播放 writing_start 状态
    // writing_start 播放完成之后 查看status 是否为 listening，如果是，则播放 writing_repeat 状态 否则播放 writing_end 状态
    // 等待状态改变成 其他状态的时候 先播放完 writing_end 状态，再切换到其他状态
    // speaking
    // 播放 talking_start 状态
    // talking_start 播放完成之后 查看 status。是否为 speaking，如果是，则播放 talking_repeat 状态， 否则播放 talking_end 状态
    // 等待状态改变成 其他状态的时候 先播放完 talking_end 状态，再切换到其他状态

    // 如果是新的状态不是是听的状态 但是动画正在播放 writing_start 或 writing_repeat 状态，则播放 writing_end 状态
    if (
      status !== AnimationStatus.LISTENING &&
      (currentState === InternalAnimationState.writing_start ||
        currentState === InternalAnimationState.writing_repeat)
    ) {
      playState(InternalAnimationState.writing_end);
      return;
    }

    // 如果 新的状态 不是 说的 状态 但动画还没说完
    if (
      status !== AnimationStatus.SPEAKING &&
      (currentState === InternalAnimationState.talk_start ||
        currentState === InternalAnimationState.talk_repeat)
    ) {
      playState(InternalAnimationState.talk_end);
      return;
    }

    // 如果还在听的状态，且动画是 writing_start 或 writing_repeat 状态，则播放 writing_start 状态
    if (
      (status === AnimationStatus.LISTENING &&
        currentState === InternalAnimationState.writing_start) ||
      currentState === InternalAnimationState.writing_repeat
    ) {
      playState(InternalAnimationState.writing_repeat);
      return;
    }

    if (
      status === AnimationStatus.SPEAKING &&
      (currentState === InternalAnimationState.talk_start ||
        currentState === InternalAnimationState.talk_repeat)
    ) {
      playState(InternalAnimationState.talk_repeat);
      return;
    }

    // wait / talk_end => listening
    if (
      status === AnimationStatus.LISTENING &&
      (currentState === InternalAnimationState.wait ||
        currentState === InternalAnimationState.talk_end)
    ) {
      playState(InternalAnimationState.writing_start);
      return;
    }

    // wait / writing_end => speaking
    if (
      status === AnimationStatus.SPEAKING &&
      (currentState === InternalAnimationState.wait ||
        currentState === InternalAnimationState.writing_end)
    ) {
      playState(InternalAnimationState.talk_start);
      return;
    }

    playState(InternalAnimationState.wait);
  }, [status, currentState]);

  // 播放单个状态
  const playState = useCallback((state: InternalAnimationState) => {
    console.log("playState:", state);
    controllerRef.current?.playState(state);
    setCurrentState(state);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* 动画显示区域 */}
      <div className="w-96 h-96 rounded-lg overflow-hidden">
        <AnimationUnit
          currentState={currentState}
          autoPlay={true}
          loop={true}
          onComplete={handleAnimationComplete}
        />
      </div>

      {/* 控制面板 */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
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
        <div className="flex items-center gap-2 flex-wrap text-black">
          <div className="text-sm text-gray-600">
            当前状态: <span className="font-medium">{currentState}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationContent;
