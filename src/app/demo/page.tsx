import { NextPage } from "next";

import { AnimationWrapper, LoadingButton } from "@/components";
import { WaitTransform } from "./transform/wait";
import imgSrc from "../wait-122-15000x15000-1000x1000.webp";
import { Config } from "@/types";

const bigConfig: Config = {
  width: 15000,
  height: 15000,
  cellWidth: 1000,
  cellHeight: 1000,
  containerWidth: 500,
  containerHeight: 500,
  count: 122,
  imgSrc: imgSrc.src,
};

const RotePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <AnimationWrapper title="Transform - webp - 122*1000*1000">
        <WaitTransform config={bigConfig} />
      </AnimationWrapper>

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
