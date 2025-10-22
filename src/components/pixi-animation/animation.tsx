"use client";

import type { FC } from "react";
import { useRouter } from "next/navigation";
import { useAnimationResources } from "./resource-cache";
import { Placeholder } from "./placeholder";
import AnimationContent from "./animation-content";

export const Animation: FC = () => {
  const { loading, resources } = useAnimationResources();
  const router = useRouter();
  console.log(loading, resources);
  return (
    <div className="w-full h-full">
      <AnimationContent />
      <div>
        <button onClick={() => router.push("/")}>home</button>
      </div>
    </div>
  );
};
export default Animation;
