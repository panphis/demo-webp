"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Button } from "@/components/ui";
import { Conversations } from "@/components/conversation/conversations";
import { GroupedItems } from "@/types";

import { WaitAnimation as Wait } from "@/components/animation/animation";
import imgSrc from "@/components/conversation/wait-122-15000x15000-1000x1000.webp";
import { Config } from "@/types";
import { cn } from "@/lib/utils";
import styles from "./page.module.css";

const config: Config = {
  width: 15000,
  height: 15000,
  cellWidth: 1000,
  cellHeight: 1000,
  containerWidth: 500,
  containerHeight: 500,
  count: 122,
  imgSrc: imgSrc.src,
};

export default function ScrollPage() {
  const [history, setHistory] = useState<GroupedItems[]>([]);
  const [conversations, setConversations] = useState<GroupedItems[]>([]);

  const addHistory = () => {
    setHistory([
      ...history,
      {
        id: `history-${history.length + 1}`,
        userInfo: {
          formatted: {
            text: "Hello",
          },
        },
        assistantInfo: {
          formatted: {
            text: "你好",
          },
        },
      },
    ]);
  };
  const addConversation = () => {
    setConversations([
      ...conversations,
      {
        id: `conversation-${conversations.length + 1}`,
        userInfo: {
          formatted: {
            text: "Hello",
          },
        },
        assistantInfo: {
          formatted: {
            text: "你好",
          },
        },
      },
    ]);
  };

  return (
    <section
      className={cn(
        "grid h-full pt-4 lg:pt-0 lg:h-screen grid-cols-1 grid-rows-[auto-1fr-auto] md:grid-cols-[1fr_auto] md:grid-rows-auto gap-4 px-4 md:px-20 pb-10 overflow-y-auto",
        styles.layout
      )}
    >
      <div className={cn(styles.controller, "z-10")}>
        <Button onClick={addHistory}>Add History</Button>
        <Button onClick={addConversation}>Add Conversation</Button>
        <Button onClick={() => setConversations([])}>Clear Conversation</Button>
        <Button onClick={() => setHistory([])}>Clear History</Button>
      </div>
      <Conversations
        className={styles.conversation}
        conversations={conversations}
        history={history}
      />

      {conversations.length + history.length > 0 && (
        <div
          className={cn(
            "flex flex-col gap-4 justify-end items-center min-w-64",
            styles.animation
          )}
        >
          <Wait config={config} />
        </div>
      )}
    </section>
  );
}
