"use client";

import { useRef, useState } from "react";
import { SequenceAnimation, SequenceAnimationRef } from "@/components/pixi-animation";
import { AnimationMainState, AnimationState } from "@/types/animation";

export default function SequenceAnimationPage() {
  const animationRef = useRef<SequenceAnimationRef>(null);
  const [currentState, setCurrentState] = useState<AnimationState>({
    main: AnimationMainState.INIT,
    sub: "start" as any
  });

  const handleStateChange = (state: AnimationState) => {
    setCurrentState(state);
    console.log("状态变化:", state);
  };

  const handleAnimationComplete = (state: AnimationState) => {
    console.log("动画完成:", state);
  };

  const changeToListen = () => {
    animationRef.current?.setTargetState(AnimationMainState.LISTEN);
  };

  const changeToTranslate = () => {
    animationRef.current?.setTargetState(AnimationMainState.TRANSLATE);
  };

  const changeToInit = () => {
    animationRef.current?.setTargetState(AnimationMainState.INIT);
  };

  const play = () => {
    animationRef.current?.play();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          动画序列播放演示
        </h1>
        
        {/* 动画容器 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="h-96 w-full">
            <SequenceAnimation
              ref={animationRef}
              onStateChange={handleStateChange}
              onAnimationComplete={handleAnimationComplete}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={changeToInit}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentState.main === AnimationMainState.INIT
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              初始化状态
            </button>
            
            <button
              onClick={changeToListen}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentState.main === AnimationMainState.LISTEN
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              监听状态
            </button>
            
            <button
              onClick={changeToTranslate}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentState.main === AnimationMainState.TRANSLATE
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              翻译状态
            </button>
            
            <button
              onClick={play}
              className="px-4 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              重新播放
            </button>
          </div>

          {/* 状态显示 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">当前状态</h3>
            <div className="text-sm text-gray-600">
              <p>主状态: <span className="font-mono">{currentState.main}</span></p>
              <p>子状态: <span className="font-mono">{currentState.sub}</span></p>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">使用说明</h2>
          <div className="text-blue-700 space-y-2">
            <p>• <strong>初始化状态</strong>: 播放初始化动画，包含 start → repeat → end 序列</p>
            <p>• <strong>监听状态</strong>: 播放监听动画，包含 start → repeat → end 序列</p>
            <p>• <strong>翻译状态</strong>: 播放翻译动画，包含 start → repeat → end 序列</p>
            <p>• 状态流程：init → listen → translate，listen 和 translate 可以互相切换</p>
            <p>• 在 repeat 状态下，动画会持续循环播放直到状态改变</p>
            <p>• 状态改变时会先播放当前状态的 end 动画，然后切换到新状态的 start 动画</p>
          </div>
        </div>
      </div>
    </div>
  );
}
