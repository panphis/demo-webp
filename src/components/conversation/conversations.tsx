import {
  type FC,
  ForwardedRef,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { ConversationItem } from "./conversation-item";

import { GroupedItems } from "@/types";
import { cn } from "../../lib/utils";
import { WaitAnimation as Wait } from "../animation/animation";

import imgSrc from "./wait-122-15000x15000-1000x1000.webp";
import { Config } from "@/types";

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

const EmptyConversation = () => {
  return (
    <div className="flex flex-col gap-4 items-center relative bottom-[-100px]">
      <p className="text-4xl font-bold">Empty</p>
      <p className="text-[18px] font-normal text-foreground">Description</p>
      <Wait config={config} />
    </div>
  );
};

type ConversationsProps = {
  className?: string;
  conversations?: GroupedItems[];
  history?: GroupedItems[];
  isEditable?: boolean;
  onPlayUserAudio?: (itemId: string) => void;
  onPlayAIAudio?: (itemId: string) => void;
  onEditUserText?: (itemId: string, newText: string) => void;
  onEditAIText?: (itemId: string, newText: string) => void;
  onHeightChange?: (height: number) => void;
  ref?: ForwardedRef<HTMLDivElement>;
};

export const ConversationsComp: FC<ConversationsProps> = ({
  className,
  conversations = [],
  history = [],
  isEditable = true,
  ref,
}) => {
  const speaker = (index: number) => {
    const i = (index % 2) + 1;
    return `Person ${i}`;
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const endRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    return [...history, ...conversations];
  }, [history, conversations]);

  useEffect(() => {
    // scroll to bottom in larger screen
    // scroll to right in smaller screen
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [list]);

  return (
    <div className={cn(className)} ref={ref}>
      <div
        className="flex flex-row w-full overflow-x-auto gap-6 flex-1 justify-end min-h-full md:flex-col"
        ref={scrollContainerRef}
      >
        {list.length + history.length === 0 ? (
          <EmptyConversation />
        ) : (
          <>
            {list.map((item, index) => (
              <ConversationItem
                key={item.userInfo.id}
                {...item}
                speaker={speaker(index)}
                isCurrentConversation={index === list.length - 1}
                isEditable={isEditable}
              />
            ))}
          </>
        )}
        <div className="h-0 w-0" id="anchor"></div>
      </div>
    </div>
  );
};

export const Conversations = forwardRef<HTMLDivElement, ConversationsProps>(
  (props, ref) => {
    return <ConversationsComp {...props} ref={ref} />;
  }
);
Conversations.displayName = "Conversations";
