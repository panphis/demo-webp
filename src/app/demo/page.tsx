"use client";

import { AnimationStatus } from "@/components/pixi-animation/animation-content";
import { Animation } from "@/components/pixi-animation/animation";
import { useState } from "react";

export default function HomePage() {
  const [status, setStatus] = useState(AnimationStatus.THINKING);

  const handleThink = () => {
    setStatus(AnimationStatus.THINKING);
  };

  const handleListen = () => {
    setStatus(AnimationStatus.LISTENING);
  };

  const handleSpeak = () => {
    setStatus(AnimationStatus.SPEAKING);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* 动画容器 */}
        <div className="shadow-lg p-6 mb-8">
          <Animation className="w-96 h-96" status={status} />
        </div>

        <div className="flex gap-2 justify-center">
          <button onClick={handleThink}>Thinking</button>
          <button onClick={handleListen}>Listening</button>
          <button onClick={handleSpeak}>Speaking</button>
        </div>
      </div>
    </div>
  );
}
