/**
 * 简化的动画序列管理器
 * 专注于动画的流畅播放和状态切换
 */

import * as PIXI from "pixi.js";
import { 
  AnimationMainState, 
  AnimationSubState, 
  AnimationState, 
  AnimationConfig,
  StateChangeCallback,
  AnimationCompleteCallback,
  mapMainStateToInternal,
  InternalAnimationState
} from '../../types/animation';
import { resourceCacheManager } from './resource-cache';

class AnimationSequenceManager {
  private static instance: AnimationSequenceManager;
  private app: PIXI.Application | null = null;
  private animatedSprite: PIXI.AnimatedSprite | null = null;
  private currentContainer: HTMLDivElement | null = null;
  private isInitialized = false;

  // 状态管理
  private currentState: AnimationState = {
    main: AnimationMainState.INIT,
    sub: AnimationSubState.START
  };
  private targetMainState: AnimationMainState = AnimationMainState.INIT;
  private isPlaying = false;
  private currentConfig: AnimationConfig | null = null;

  // 回调函数
  private stateChangeCallbacks: StateChangeCallback[] = [];
  private animationCompleteCallbacks: AnimationCompleteCallback[] = [];

  private constructor() {}

  static getInstance(): AnimationSequenceManager {
    if (!AnimationSequenceManager.instance) {
      AnimationSequenceManager.instance = new AnimationSequenceManager();
    }
    return AnimationSequenceManager.instance;
  }

  /**
   * 设置目标主状态
   */
  setTargetState(mainState: AnimationMainState): void {
    if (mainState === this.currentState.main) {
      return;
    }

    this.targetMainState = mainState;
    
    if (this.isInitialized) {
      this.handleStateChange();
    }
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): AnimationState {
    return { ...this.currentState };
  }

  /**
   * 添加状态变化回调
   */
  onStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * 添加动画完成回调
   */
  onAnimationComplete(callback: AnimationCompleteCallback): void {
    this.animationCompleteCallbacks.push(callback);
  }

  /**
   * 移除回调
   */
  removeCallbacks(): void {
    this.stateChangeCallbacks = [];
    this.animationCompleteCallbacks = [];
  }

  /**
   * 初始化动画系统
   */
  async initialize(container: HTMLDivElement): Promise<boolean> {
    if (this.isInitialized && this.app) {
      this.moveToContainer(container);
      return true;
    }

    try {
      // 创建 PIXI 应用
      this.app = new PIXI.Application();
      await this.app.init({
        width: 1000,
        height: 1000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // 加载初始动画
      await this.loadAnimation(this.currentState);
      this.moveToContainer(container);
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error("[AnimationSequenceManager] Initialization failed:", error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * 加载指定状态的动画
   */
  private async loadAnimation(state: AnimationState): Promise<void> {
    if (!this.app || !this.app.renderer) {
      throw new Error("PIXI Application not initialized");
    }

    const internalState = mapMainStateToInternal(state.main);
    const cachedResource = await resourceCacheManager.getResource(internalState, state.sub);
    const { texture, frames, config } = cachedResource;
    this.currentConfig = config;

    // 创建新的动画精灵
    const newAnimatedSprite = new PIXI.AnimatedSprite({
      textures: frames,
      autoUpdate: false,
    });

    newAnimatedSprite.anchor.set(0.5);
    newAnimatedSprite.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);

    // 设置缩放
    const scale = Math.min(this.app.renderer.width / config.cellWidth, this.app.renderer.height / config.cellHeight);
    newAnimatedSprite.scale.set(scale);

    // 配置动画
    newAnimatedSprite.animationSpeed = 1;
    newAnimatedSprite.loop = false;

    // 移除旧的动画精灵
    if (this.animatedSprite) {
      this.app.stage.removeChild(this.animatedSprite);
      this.animatedSprite.destroy();
    }

    // 添加新的动画精灵
    this.app.stage.addChild(newAnimatedSprite);
    this.animatedSprite = newAnimatedSprite;

    // 开始播放
    this.startAnimation();
  }

  /**
   * 开始播放动画
   */
  private startAnimation(): void {
    if (!this.animatedSprite || !this.app) {
      return;
    }

    this.isPlaying = true;
    this.animatedSprite.gotoAndStop(0);

    // 设置循环模式
    const shouldLoop = this.currentState.sub === AnimationSubState.REPEAT;
    this.animatedSprite.loop = shouldLoop;

    // 确保 ticker 正在运行
    if (!this.app.ticker.started) {
      this.app.ticker.start();
    }

    // 启动动画
    this.animatedSprite.play();

    // 监听动画完成事件
    this.animatedSprite.onComplete = () => {
      this.onAnimationFinished();
    };

    console.log(`[AnimationSequenceManager] Started animation: ${this.currentState.main}-${this.currentState.sub}, loop: ${shouldLoop}`);
  }

  /**
   * 动画播放完成处理
   */
  private onAnimationFinished(): void {
    if (!this.isPlaying) {
      return;
    }

    // 触发动画完成回调
    this.animationCompleteCallbacks.forEach(callback => {
      callback(this.currentState);
    });

    // 检查状态转换
    this.checkAndTransition();
  }

  /**
   * 处理状态变更
   */
  private handleStateChange(): void {
    if (this.targetMainState === this.currentState.main) {
      return;
    }

    // 如果当前是 repeat 状态，直接切换到目标状态
    if (this.currentState.sub === AnimationSubState.REPEAT) {
      this.transitionToNextState();
    } else {
      this.checkAndTransition();
    }
  }

  /**
   * 检查并执行状态转换
   */
  private checkAndTransition(): void {
    const shouldTransition = this.shouldTransitionToNextState();
    
    if (shouldTransition) {
      this.transitionToNextState();
    }
    // 移除 repeat 状态下的自动重新播放，避免干扰状态切换
  }

  /**
   * 判断是否应该转换到下一个状态
   */
  private shouldTransitionToNextState(): boolean {
    // 如果目标状态与当前主状态不同，需要转换
    if (this.targetMainState !== this.currentState.main) {
      return true;
    }

    // 如果当前是 start 状态，应该转换到 repeat
    if (this.currentState.sub === AnimationSubState.START) {
      return true;
    }

    return false;
  }

  /**
   * 转换到下一个状态
   */
  private async transitionToNextState(): Promise<void> {
    const nextState = this.getNextState();
    
    if (nextState) {
      console.log(`[AnimationSequenceManager] Transitioning from ${this.currentState.main}-${this.currentState.sub} to ${nextState.main}-${nextState.sub}`);
      
      // 停止当前动画
      if (this.animatedSprite) {
        this.animatedSprite.stop();
        this.animatedSprite.onComplete = undefined; // 清除事件监听
      }
      this.isPlaying = false;

      // 更新状态
      this.currentState = nextState;
      
      // 触发状态变化回调
      this.stateChangeCallbacks.forEach(callback => {
        try {
          callback(this.currentState);
        } catch (error) {
          console.error("[AnimationSequenceManager] Error in state change callback:", error);
        }
      });

      // 加载新动画
      try {
        await this.loadAnimation(this.currentState);
      } catch (error) {
        console.error("[AnimationSequenceManager] Failed to load animation:", error);
        // 如果加载失败，尝试恢复到上一个状态
        this.isPlaying = false;
      }
    }
  }

  /**
   * 获取下一个状态
   */
  private getNextState(): AnimationState | null {
    const { main, sub } = this.currentState;

    // 如果目标主状态与当前不同，需要切换
    if (this.targetMainState !== main) {
      // 如果是 WAIT 状态，直接切换到目标状态
      if (mapMainStateToInternal(main) === InternalAnimationState.WAIT) {
        return {
          main: this.targetMainState,
          sub: AnimationSubState.START
        };
      }
      
      // 其他状态先播放 end 动画
      if (sub !== AnimationSubState.END) {
        return {
          main,
          sub: AnimationSubState.END
        };
      } else {
        // end 动画播放完成后，切换到目标状态
        return {
          main: this.targetMainState,
          sub: AnimationSubState.START
        };
      }
    }

    // 同主状态内的子状态转换
    switch (sub) {
      case AnimationSubState.START:
        return {
          main,
          sub: AnimationSubState.REPEAT
        };
      case AnimationSubState.REPEAT:
        return null; // repeat 状态持续播放
      case AnimationSubState.END:
        return {
          main: this.targetMainState,
          sub: AnimationSubState.START
        };
      default:
        return null;
    }
  }

  /**
   * 移动到指定容器
   */
  private moveToContainer(container: HTMLDivElement): void {
    if (!this.app || !this.app.renderer || !this.app.renderer.canvas) {
      return;
    }

    if (this.currentContainer === container) {
      return;
    }

    try {
      container.innerHTML = "";
      container.appendChild(this.app.renderer.canvas);

      // 设置画布样式
      this.app.renderer.canvas.style.position = "relative";
      this.app.renderer.canvas.style.zIndex = "1";
      this.app.renderer.canvas.style.display = "block";
      this.app.renderer.canvas.style.width = "100%";
      this.app.renderer.canvas.style.height = "100%";

      // 响应式调整
      const resizeObserver = new ResizeObserver(() => {
        if (this.app && this.app.renderer && container) {
          const rect = container.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            this.app.renderer.resize(rect.width, rect.height);
            if (this.animatedSprite) {
              this.animatedSprite.position.set(rect.width / 2, rect.height / 2);
              const scale = Math.min(rect.width / 1000, rect.height / 1000);
              this.animatedSprite.scale.set(scale);
            }
          }
        }
      });

      resizeObserver.observe(container);
      (this.app as PIXI.Application & { _resizeObserver?: ResizeObserver })._resizeObserver = resizeObserver;

      this.currentContainer = container;
    } catch (e) {
      console.error("[AnimationSequenceManager] Failed to move container:", e);
    }
  }

  /**
   * 注销容器
   */
  unregisterContainer(container: HTMLDivElement): void {
    if (this.currentContainer === container) {
      this.cleanup();
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.app) {
      // 清理 ResizeObserver
      const appWithObserver = this.app as PIXI.Application & { _resizeObserver?: ResizeObserver };
      if (appWithObserver._resizeObserver) {
        appWithObserver._resizeObserver.disconnect();
        appWithObserver._resizeObserver = undefined;
      }

      // 停止 ticker
      if (this.app.ticker) {
        this.app.ticker.stop();
      }

      // 销毁应用
      try {
        this.app.destroy(true);
      } catch (error) {
        console.warn("[AnimationSequenceManager] Error destroying PIXI app:", error);
      }
      this.app = null;
    }

    this.animatedSprite = null;
    this.currentContainer = null;
    this.isInitialized = false;
    this.isPlaying = false;
  }
}

export const animationSequenceManager = AnimationSequenceManager.getInstance();