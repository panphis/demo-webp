import { PixiWait, LoadingButton } from "@/components";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-2 w-full">
        <div className="relative bottom-[-100px]">
          <PixiWait className="w-100 h-100" />
        </div>
        <div className="flex flex-row gap-2 w-full py-4 z-10">
          <LoadingButton
            variant="default"
            size="icon"
            className="w-2xs h-5 p-1 rounded-full text-white"
          >
            按钮
          </LoadingButton>
          <LoadingButton
            variant="default"
            size="icon"
            className="w-2xs h-5 p-1 rounded-full text-white"
            loading
          >
            按钮
          </LoadingButton>
        </div>
      </div>
    </main>
  );
}
