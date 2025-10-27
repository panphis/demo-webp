"use client";

import { type FC } from "react";
import AnimationContent, { AnimationStatus } from "./animation-content";

type AnimationProps = {
  status: AnimationStatus;
  className?: string;
};

export const Animation: FC<AnimationProps> = ({ status, className  }) => {
  return <AnimationContent status={status} className={className} />;
};
export default Animation;
