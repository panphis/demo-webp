"use client";

import { Status } from "@/lib/constants";
import { Animation } from "@/components/pixi-animation/animation";
import { useState } from "react";

export default function HomePage() {
  const [status, setStatus] = useState(Status.thinking);
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* 动画容器 */}
        <div className="shadow-lg p-6 mb-8">
          <Animation className="w-96 h-96" status={status} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStatus(Status.thinking)}>Thinking</button>
          <button onClick={() => setStatus(Status.listening)}>Listening</button>
          <button onClick={() => setStatus(Status.speaking)}>Speaking</button>
        </div>
      </div>
    </div>
  );
}
