/**
 * 动画控制器
 * 管理动画状态切换和播放逻辑
 */

import { InternalAnimationState } from "../../types/animation";

export interface AnimationSequence {
  /** 动画序列名称 */
  name: string;
  /** 动画状态序列 */
  states: InternalAnimationState[];
  /** 每个状态的持续时间（毫秒） */
  durations?: number[];
  /** 是否循环整个序列 */
  loop?: boolean;
}

export class AnimationController {
  private currentState: InternalAnimationState;
  private isPlaying: boolean = false;
  private currentSequence?: AnimationSequence;
  private sequenceIndex: number = 0;
  private timeoutId?: NodeJS.Timeout;

  constructor() {
    this.currentState = InternalAnimationState.wait;
  }

  /**
   * 播放指定状态
   */
  playState(state: InternalAnimationState): void {
    this.currentState = state;
    this.isPlaying = true;
    this.clearSequence();
  }

  /**
   * 播放动画序列
   */
  playSequence(sequence: AnimationSequence): void {
    this.currentSequence = sequence;
    this.sequenceIndex = 0;
    this.isPlaying = true;
    this.playNextInSequence();
  }

  /**
   * 播放序列中的下一个状态
   */
  private playNextInSequence(): void {
    if (!this.currentSequence || !this.isPlaying) return;

    const { states, durations, loop } = this.currentSequence;
    const currentState = states[this.sequenceIndex];

    if (!currentState) {
      if (loop) {
        this.sequenceIndex = 0;
        this.playNextInSequence();
      } else {
        this.stop();
      }
      return;
    }

    this.currentState = currentState;

    // 计算下一个状态的延迟时间
    const duration = durations?.[this.sequenceIndex] || 1000;
    this.timeoutId = setTimeout(() => {
      this.sequenceIndex++;
      this.playNextInSequence();
    }, duration);
  }

  /**
   * 暂停动画
   */
  pause(): void {
    this.isPlaying = false;
    this.clearTimeouts();
  }

  /**
   * 停止动画
   */
  stop(): void {
    this.isPlaying = false;
    this.clearSequence();
    this.clearTimeouts();
  }

  /**
   * 重置到初始状态
   */
  reset(): void {
    this.stop();
    this.currentState = InternalAnimationState.wait;
    this.sequenceIndex = 0;
  }

  /**
   * 清理序列
   */
  private clearSequence(): void {
    this.currentSequence = undefined;
    this.sequenceIndex = 0;
  }

  /**
   * 清理定时器
   */
  private clearTimeouts(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): InternalAnimationState {
    return this.currentState;
  }

  /**
   * 获取播放状态
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * 获取当前序列信息
   */
  getCurrentSequence(): AnimationSequence | undefined {
    return this.currentSequence;
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.stop();
  }
}

/**
 * 预定义的动画序列
 */
export const AnimationSequences = {
  /** 写作完整流程 */
  writing: {
    name: "写作流程",
    states: [
      InternalAnimationState.writing_start,
      InternalAnimationState.writing_repeat,
      InternalAnimationState.writing_end,
    ],
    durations: [2000, 5000, 1500],
    loop: false,
  } as AnimationSequence,

  /** 对话完整流程 */
  talking: {
    name: "对话流程",
    states: [
      InternalAnimationState.talk_start,
      InternalAnimationState.talk_repeat,
      InternalAnimationState.talk_end,
    ],
    durations: [1500, 4000, 1200],
    loop: false,
  } as AnimationSequence,

  /** 等待循环 */
  waiting: {
    name: "等待循环",
    states: [InternalAnimationState.wait],
    durations: [3000],
    loop: true,
  } as AnimationSequence,

  /** 写作循环（重复写作动作） */
  writingLoop: {
    name: "写作循环",
    states: [
      InternalAnimationState.writing_start,
      InternalAnimationState.writing_repeat,
    ],
    durations: [2000, 3000],
    loop: true,
  } as AnimationSequence,
};
