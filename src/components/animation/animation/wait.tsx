"use client";
import { Fragment, type FC } from "react";
import { Animation } from "./animation";
import { Config } from "@/types";

type Props = { config: Config };

export const WaitAnimation: FC<Props> = ({ config }) => {
  return (
    <Fragment>
      <Animation {...config} duration={2} />
    </Fragment>
  );
};
