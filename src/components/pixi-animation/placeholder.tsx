"use client";

import placeholder from "./placeholder.webp";

import Image from "next/image";
import type { FC } from "react";
import { useEffect } from "react";

export const Placeholder: FC = () => {
  useEffect(() => {
    console.log("load placeholder");
    return () => {
      console.log("unload placeholder");
    };
  }, []);

  return (
    <Image
      src={placeholder}
      alt="placeholder"
      className="w-full h-full object-contain bg-transparent"
    />
  );
};
