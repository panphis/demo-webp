"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { simpleGlobalPixiManager } from "./global-manager";

type Props = {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  count: number;
  imgSrc: string;
  loop: boolean;
  duration?: number;
  className?: string;
};

export const PixiAnimation = forwardRef<unknown, Props>(
  (
    {
      width: _width,
      cellWidth: _cellWidth,
      cellHeight: _cellHeight,
      count: _count,
      imgSrc: _imgSrc,
      duration: _duration = 2,
      className,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasMountRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState("Loading...");

    // Expose controls via ref
    useImperativeHandle(ref, () => {
      return {
        status: status,
      };
    }, [status]);

    useEffect(() => {
      if (!canvasMountRef.current) {
        return;
      }

      const initializeAnimation = async () => {
        try {
          setStatus("Loading...");
          if (canvasMountRef.current) {
            await simpleGlobalPixiManager.getOrCreateAnimation(canvasMountRef.current);
          }
          setStatus("Ready");
        } catch (error) {
          console.error("[PixiAnimation] Initialization failed:", error);
          setStatus("Error");
        }
      };

      initializeAnimation();

      // Cleanup function
      return () => {
        if (canvasMountRef.current) {
          simpleGlobalPixiManager.unregisterContainer(canvasMountRef.current);
        }
      };
    }, []);

    return (
      <div ref={containerRef} className={cn(className, "overflow-hidden z-0")}>
        <div
          ref={canvasMountRef}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    );
  }
);

PixiAnimation.displayName = "PixiAnimation";
