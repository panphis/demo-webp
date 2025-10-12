import { NextPage } from "next";

import { LoadingButton } from "@/components";

const RotePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row gap-2 w-full py-4">
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
  );
};

export default RotePage;
