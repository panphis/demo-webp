/**
 * 动画状态类型定义
 */

// 主状态枚举
export enum AnimationMainState {
  INIT = 'init',
  LISTEN = 'listen', 
  TRANSLATE = 'translate',
}

// 内部状态映射（用于动画资源）
export enum InternalAnimationState {
  WAIT = 'wait',
  WRITING = 'writing',
  TALK = 'talk',
}

// 子状态枚举
export enum AnimationSubState {
  START = 'start',
  REPEAT = 'repeat',
  END = 'end',
}

// 完整动画状态
export interface AnimationState {
  main: AnimationMainState;
  sub: AnimationSubState;
}

// 动画配置
export interface AnimationConfig {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  count: number;
  imgSrc: string;
}

// 动画资源映射（使用内部状态）
export type AnimationResources = {
  [K in InternalAnimationState]: {
    [S in AnimationSubState]: AnimationConfig;
  };
};

// 状态映射函数
export const mapMainStateToInternal = (mainState: AnimationMainState): InternalAnimationState => {
  switch (mainState) {
    case AnimationMainState.INIT:
      return InternalAnimationState.WAIT;
    case AnimationMainState.LISTEN:
      return InternalAnimationState.WRITING;
    case AnimationMainState.TRANSLATE:
      return InternalAnimationState.TALK;
    default:
      return InternalAnimationState.WAIT;
  }
};

// 状态变化回调
export type StateChangeCallback = (newState: AnimationState) => void;

// 动画完成回调
export type AnimationCompleteCallback = (currentState: AnimationState) => void;
