"use client";

import { Fragment, type FC, useEffect } from "react";
import { Animation } from "./animation";
import { Config } from "@/types";

type Props = { config: Config };

export const WaitTransform: FC<Props> = ({ config }) => {
  useEffect(() => {
    console.log("WaitTransform");
  }, []);
  return (
    <Fragment>
      <Animation {...config} loop={true} performanceMode={true} fps={36} />
    </Fragment>
  );
};
