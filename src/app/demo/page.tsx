"use client";

import { AnimationStatus } from "@/components/pixi-animation/animation-content";
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
        {/* 动画容器 */}
        <div className="shadow-lg p-6 mb-8">
          <NoSSRAnimation className="w-96 h-96" status={AnimationStatus.THINKING} />
        </div>
      </div>
    </div>
  );
}
