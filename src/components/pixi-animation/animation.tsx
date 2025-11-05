"use client";

import { type FC } from "react";
import AnimationContent from "./animation-content";
import { Status } from "@/lib/constants";
type AnimationProps = {
  status: Status;
  className?: string;
};

export const Animation: FC<AnimationProps> = ({ status, className }) => {
  return <AnimationContent status={status} className={className} />;
};
export default Animation;
