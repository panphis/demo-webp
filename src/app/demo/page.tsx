"use client";

import Link from "next/link";
import { Status } from "@/lib/constants";
import { Animation } from "@/components/pixi-animation/animation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [status, setStatus] = useState(Status.thinking);
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* 动画容器 */}
        <div className="shadow-lg p-6 mb-8">
          <Animation
            className="w-32 h-32 md:w-64 md:h-64 lg:w-96 lg:h-96"
            status={status}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={status === Status.thinking ? "default" : "outline"}
            onClick={() => setStatus(Status.thinking)}
          >
            Thinking
          </Button>
          <Button
            variant={status === Status.listening ? "default" : "outline"}
            onClick={() => setStatus(Status.listening)}
          >
            Listening
          </Button>
          <Button
            variant={status === Status.speaking ? "default" : "outline"}
            onClick={() => setStatus(Status.speaking)}
          >
            Speaking
          </Button>
          <Button
            variant={status === Status.init ? "default" : "outline"}
            onClick={() => setStatus(Status.init)}
          >
            Init
          </Button>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
