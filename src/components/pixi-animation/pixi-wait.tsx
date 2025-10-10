import type { FC } from "react";
import imgSrc from "./wait-122-15000x15000-1000x1000.webp";
import { PixiAnimation } from "./";

type Props = {
  className?: string;
};

export const PixiWait: FC<Props> = ({ className }) => {
  return (
    <PixiAnimation
      width={15000}
      height={15000}
      cellWidth={1000}
      cellHeight={1000}
      count={122}
      imgSrc={imgSrc.src}
      loop={true}
      duration={5.08} // 122 frames at 48fps = ~2.54 seconds
      className={className}
    />
  );
};
