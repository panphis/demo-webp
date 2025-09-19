import {
  LoadingButton,
  WaitAnimation,
  WaitTransform,
  AnimationWrapper,
  LottieAnimation,
} from "@/components";

import lgewebp from "./wait-122-15000x15000-1000x1000.webp";
import { Config } from "@/types";
import mdAvif from "./writing-65-10000*7000-1000x1000.avif";
import mdWebp from "./writing-65-10000*7000-1000x1000.webp";
import mdPng from "./writing-65-10000*7000-1000x1000.png";
const bigConfig: Config = {
  width: 15000,
  height: 15000,
  cellWidth: 1000,
  cellHeight: 1000,
  containerWidth: 500,
  containerHeight: 500,
  count: 122,
  imgSrc: lgewebp.src,
};

const mdWebpConfig: Config = {
  width: 10000,
  height: 7000,
  cellWidth: 1000,
  cellHeight: 1000,
  count: 65,
  containerWidth: 500,
  containerHeight: 500,
  imgSrc: mdWebp.src,
};

const mdAvifConfig: Config = {
  width: 10000,
  height: 7000,
  cellWidth: 1000,
  cellHeight: 1000,
  containerWidth: 500,
  containerHeight: 500,
  count: 65,
  imgSrc: mdAvif.src,
};

const mdPngConfig: Config = {
  width: 10000,
  height: 7000,
  cellWidth: 1000,
  cellHeight: 1000,
  containerWidth: 500,
  containerHeight: 500,
  count: 65,
  imgSrc: mdPng.src,
};

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-2 w-full">
        <div className="grid grid-cols-2 gap-2 w-full">
          <AnimationWrapper title="Transform - webp - 122*1000*1000">
            <WaitTransform config={bigConfig} />
          </AnimationWrapper>
          <AnimationWrapper title="Animation - webp - 122*1000*1000">
            <WaitAnimation config={bigConfig} />
          </AnimationWrapper>

          <AnimationWrapper title="Transform - md avif - 65*1000*1000">
            <WaitTransform config={mdAvifConfig} />
          </AnimationWrapper>
          <AnimationWrapper title="Animation - md avif - 65*1000*1000">
            <WaitAnimation config={mdAvifConfig} />
          </AnimationWrapper>

          <AnimationWrapper title="Transform - md png - 65*1000*1000">
            <WaitTransform config={mdPngConfig} />
          </AnimationWrapper>
          <AnimationWrapper title="Animation - md png - 65*1000*1000">
            <WaitAnimation config={mdPngConfig} />
          </AnimationWrapper>

          <AnimationWrapper title="Lottie">
            <LottieAnimation />
          </AnimationWrapper>
        </div>
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
    </main>
  );
}
