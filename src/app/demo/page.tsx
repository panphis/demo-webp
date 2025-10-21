"use client";

import { useRef, useState } from "react";

import { Animation } from "@/components/pixi-animation";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          动画序列播放演示
        </h1>

        {/* 动画容器 */}
        <div className="shadow-lg p-6 mb-8">
          <div className="h-96 w-96 mx-auto">
            <Animation />
          </div>
        </div>
      </div>
    </div>
  );
}
