"use client";

import dynamic from "next/dynamic";

const NoSSRAnimation = dynamic(
  () => import("@/components/pixi-animation/animation"),
  {
    ssr: false,
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          动画序列播放演示
        </h1>

        {/* 动画容器 */}
        <div className="shadow-lg p-6 mb-8">
          <NoSSRAnimation />
        </div>
      </div>
    </div>
  );
}
