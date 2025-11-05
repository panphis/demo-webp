/**
 * 动画资源配置
 */

import {
  AnimationResources,
  InternalAnimationState,
} from "../../types/animation";

// 导入动画资源图片
import waitImg from "./wait-122-15000x15000-1000x1000.webp";
import writingStartImg from "./writing-start-13-10000x10000-1000x1000.webp";
import writingRepeatImg from "./writing-repeat-49-10000x10000-1000x1000.webp";
import writingEndImg from "./writing-end-15-10000x10000-1000x1000.webp";
import talkingStartImg from "./talking-start-11-10000x10000-1000x1000.webp";
import talkingRepeatImg from "./talking-repeat-27-10000x10000-1000x1000.webp";
import talkingEndImg from "./talking-end-14-10000x10000-1000x1000.webp";

/**
 * 动画资源配置
 * 包含所有动画状态对应的图片资源信息
 */

export const animationResources: AnimationResources = {
  [InternalAnimationState.wait]: {
    width: 15000,
    height: 15000,
    cellWidth: 1000,
    cellHeight: 1000,
    count: 122,
    imgSrc: waitImg.src,
    fps: 48,
  },
  [InternalAnimationState.writing_start]: {
    width: 10000,
    height: 1000,
    cellWidth: 1000,
    cellHeight: 1000,
    count: 13,
    imgSrc: writingStartImg.src,
    fps: 24,
  },
  [InternalAnimationState.writing_repeat]: {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    count: 49,
    imgSrc: writingRepeatImg.src,
    fps: 24,
  },
  [InternalAnimationState.writing_end]: {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    count: 15,
    imgSrc: writingEndImg.src,
    fps: 24,
  },
  [InternalAnimationState.talk_start]: {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    count: 11,
    imgSrc: talkingStartImg.src,
    fps: 24,
  },
  [InternalAnimationState.talk_repeat]: {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    count: 27,
    imgSrc: talkingRepeatImg.src,
    fps: 24,
  },
  [InternalAnimationState.talk_end]: {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    count: 14,
    imgSrc: talkingEndImg.src,
    fps: 24,
  },
};
