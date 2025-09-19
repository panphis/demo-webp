"use client";

import { Config } from "@/types";
import type { FC } from "react";
import { useState } from "react";

export const AnimationWrapper: FC<{
  children: React.ReactNode;
  title: string;
}> = ({ children, title }) => {
  const [isMounted, setIsMounted] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {isMounted ? (
        children
      ) : (
        <div className="h-[500px] w-[500px] flex items-center border border-red-500 border-dashed rounded-md justify-center">
          placeholder
        </div>
      )}
      <button onClick={() => setIsMounted(!isMounted)}>
        {isMounted ? "Unmount" : "Mount"} {title}
      </button>
    </div>
  );
};
