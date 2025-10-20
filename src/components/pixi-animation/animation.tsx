"use client";

import { useState, useRef } from "react";
import type { FC } from "react"

import {   useAnimationResources } from "./resource-cache";
import { Placeholder } from "./placeholder";
import AnimationContent from "./animation-content";


export const Animation: FC = () => {
  const {loading, resources} = useAnimationResources();

  console.log(loading, resources);

  return <div className="w-full h-full">
    {
        loading ? <Placeholder /> : <AnimationContent />
    }
  </div>;
};
export default Animation;