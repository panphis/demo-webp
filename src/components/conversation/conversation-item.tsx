import { Edit, Play } from "@/components/icons";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { type FC } from "react";
import { GroupedItems } from "@/types";

type ConversationItemProps = GroupedItems & {
  isCurrentConversation: boolean;
  isEditable?: boolean;
  speaker: string;
};

export const ConversationItem: FC<ConversationItemProps> = ({
  assistantInfo,
  userInfo,
  speaker,
  isCurrentConversation,
  isEditable = true,
  // onPlayUserAudio,
  // onPlayAIAudio,
  // onEditUserText,
  // onEditAIText,
  // isComplete,
}) => {
  // // 处理音频播放
  // const handlePlayUserAudio = useCallback((itemId: string) => {
  //   console.log("播放用户音频:", itemId);
  //   // 这里可以添加音频播放逻辑
  //   // 例如：从 rawItems 中找到对应的音频数据并播放
  // }, []);

  // const handlePlayAIAudio = useCallback((itemId: string) => {
  //   console.log("播放AI音频:", itemId);
  //   // 这里可以添加音频播放逻辑
  // }, []);

  // // 处理文本编辑
  // const handleEditUserText = useCallback((itemId: string, newText: string) => {
  //   console.log("编辑用户文本:", itemId, newText);
  //   // 这里可以添加文本编辑逻辑
  // }, []);

  // const handleEditAIText = useCallback((itemId: string, newText: string) => {
  //   console.log("编辑AI文本:", itemId, newText);
  //   // 这里可以添加文本编辑逻辑
  // }, []);
  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[auto_auto] md:grid-cols-[1fr_auto] md:grid-rows-1 gap-0 shrink-0 w-4/5"
      )}
    >
      <section
        className={cn(
          "rounded-2xl p-6 w-full",
          isCurrentConversation
            ? "bg-[var(--color-conversation-background-current)]"
            : "bg-[var(--color-conversation-background-previous)]"
        )}
      >
        <p className="text-original-text font-normal">
          {userInfo?.formatted?.text}
        </p>
        <p className="text-translated-text font-semibold text-xl mt-2">
          {assistantInfo?.formatted?.transcript}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-user font-medium text-sm">{speaker}</span>
          <div className="ml-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={!isEditable}
              className={cn(
                "w-5 h-5 p-1 text-icon-primary hover:text-icon-primary-hover rounded-full bg-transparent hover:bg-transparent"
              )}
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!isEditable}
              className={cn(
                "w-5 h-5 p-1 text-icon-primary hover:text-icon-primary-hover rounded-full bg-transparent hover:bg-transparent",
                !isEditable && "text-icon-primary-disabled cursor-not-allowed"
              )}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
      {/* 响应式三角形箭头 */}
      <div className={cn("flex items-center justify-center")}>
        <div
          className={cn(
            "w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent rotate-0 md:rotate-270",
            "md:ml-[-4px] md:mr-[-4px]", // 大屏幕时减少左右边距，消除间隙
            isCurrentConversation
              ? "border-t-[var(--color-conversation-background-current)]"
              : "border-t-[transparent]"
          )}
        />
      </div>
    </div>
  );
};
