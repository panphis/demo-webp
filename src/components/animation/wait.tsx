import type { FC } from "react";
import { Fragment } from "react";
import { Animation } from "./animation";
import imgSrc from "./wait-122-15000x15000-1000x1000.webp";

export const Wait: FC = () => {
  return (
    <Fragment>
      
      <Animation
        width={15000}
        height={15000}
        cellWidth={1000}
        cellHeight={1000}
        containerWidth={500}
        containerHeight={500}
        count={122}
        imgSrc={imgSrc.src}
        duration={2}
      />
    </Fragment>
  );
};
