"use client";

import { useState, type FC } from "react";
import { useRouter } from "next/navigation";
import AnimationContent, { AnimationStatus } from "./animation-content";
import { cn } from "../../lib/utils";

export const Animation: FC = () => {
  const router = useRouter();

  const [status, setStatus] = useState<AnimationStatus>(
    AnimationStatus.THINKING
  );

  const onThinking = () => {
    setStatus(AnimationStatus.THINKING);
  };

  const onListening = () => {
    setStatus(AnimationStatus.LISTENING);
  };

  const onSpeaking = () => {
    setStatus(AnimationStatus.SPEAKING);
  };

  return (
    <div className="w-full h-full">
      <AnimationContent status={status} />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onThinking}
          className={cn(
            "px-3 py-1 border border-gray-300 rounded-md transition-colors",
            status === AnimationStatus.THINKING && "bg-gray-300"
          )}
        >
          等待
        </button>

        <button
          onClick={onListening}
          className={cn(
            "px-3 py-1 border border-gray-300 rounded-md transition-colors",
            status === AnimationStatus.LISTENING && "bg-gray-300"
          )}
        >
          记录
        </button>

        <button
          onClick={onSpeaking}
          className={cn(
            "px-3 py-1 border border-gray-300 rounded-md transition-colors",
            status === AnimationStatus.SPEAKING && "bg-gray-300"
          )}
        >
          对话
        </button>
        <button onClick={() => router.push("/")}>home</button>
      </div>
    </div>
  );
};
export default Animation;
