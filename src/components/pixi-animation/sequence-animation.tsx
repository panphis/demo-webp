"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { animationSequenceManager } from "./animation-sequence-manager";
import { AnimationMainState, AnimationState } from "../../types/animation";

type Props = {
  className?: string;
  targetState?: AnimationMainState; // 外部控制的目标状态
  onStateChange?: (state: AnimationState) => void;
  onAnimationComplete?: (state: AnimationState) => void;
};

export interface SequenceAnimationRef {
  setTargetState: (state: AnimationMainState) => void;
  getCurrentState: () => AnimationState;
  play: () => void;
  pause: () => void;
}

export const SequenceAnimation = forwardRef<SequenceAnimationRef, Props>(
  ({ className, targetState, onStateChange, onAnimationComplete }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasMountRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState("Loading...");
    const [currentState, setCurrentState] = useState<AnimationState>({
      main: AnimationMainState.INIT,
      sub: "start" as any
    });

    // 暴露控制接口
    useImperativeHandle(ref, () => ({
      setTargetState: (state: AnimationMainState) => {
        animationSequenceManager.setTargetState(state);
      },
      getCurrentState: () => {
        return animationSequenceManager.getCurrentState();
      },
      play: () => {
        // 重新开始播放当前动画
        const state = animationSequenceManager.getCurrentState();
        animationSequenceManager.setTargetState(state.main);
      },
      pause: () => {
        // 暂停功能可以通过状态管理实现
        console.log("Pause functionality can be implemented here");
      }
    }), []);

    useEffect(() => {
      if (!canvasMountRef.current) {
        return;
      }

      const initializeAnimation = async () => {
        try {
          setStatus("Loading...");
          
          // 注册状态变化回调
          animationSequenceManager.onStateChange((newState) => {
            setCurrentState(newState);
            onStateChange?.(newState);
          });

          // 注册动画完成回调
          animationSequenceManager.onAnimationComplete((state) => {
            onAnimationComplete?.(state);
          });

          if (canvasMountRef.current) {
            await animationSequenceManager.initialize(canvasMountRef.current);
          }
          
          setStatus("Ready");
        } catch (error) {
          console.error("[SequenceAnimation] Initialization failed:", error);
          setStatus("Error");
        }
      };

      initializeAnimation();

      // 清理函数
      return () => {
        if (canvasMountRef.current) {
          animationSequenceManager.unregisterContainer(canvasMountRef.current);
        }
        animationSequenceManager.removeCallbacks();
      };
    }, [onStateChange, onAnimationComplete]);

    // 监听外部状态变化
    useEffect(() => {
      if (targetState !== undefined) {
        animationSequenceManager.setTargetState(targetState);
      }
    }, [targetState]);

    return (
      <div ref={containerRef} className={cn(className, "overflow-hidden z-0")}>
        <div
          ref={canvasMountRef}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        />
        {/* 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
            <div>状态: {status}</div>
            <div>当前: {currentState.main} - {currentState.sub}</div>
          </div>
        )}
      </div>
    );
  }
);

SequenceAnimation.displayName = "SequenceAnimation";
