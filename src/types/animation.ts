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
  wait = 'wait',
  writing_start = 'writing_start',
  writing_repeat = 'writing_repeat',
  writing_end = 'writing_end',
  talk_start = 'talk_start',
  talk_repeat = 'talk_repeat',
  talk_end = 'talk_end',
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
    [S in InternalAnimationState]: AnimationConfig   
};


export type AnimationSubState = {
  start: AnimationConfig;
  repeat: AnimationConfig;
  end: AnimationConfig;
}
