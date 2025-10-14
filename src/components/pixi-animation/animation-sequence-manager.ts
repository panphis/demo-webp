/**
 * 动画序列管理器
 * 负责管理多个动画的连续播放和状态切换
 */

import * as PIXI from "pixi.js";
import { 
  AnimationMainState, 
  AnimationSubState, 
  AnimationState, 
  AnimationConfig,
  StateChangeCallback,
  AnimationCompleteCallback,
  InternalAnimationState,
  mapMainStateToInternal
} from '../../types/animation';
import { animationResources } from './animation-resources';
import { resourceCacheManager } from './resource-cache';

class AnimationSequenceManager {
  private static instance: AnimationSequenceManager;
  private app: PIXI.Application | null = null;
  private animatedSprite: PIXI.AnimatedSprite | null = null;
  private currentContainer: HTMLDivElement | null = null;
  private isInitializing = false;
  private activeContainers = new Set<HTMLDivElement>();
  private initializationPromise: Promise<boolean> | null = null;
  private initializationResolvers: Array<(value: boolean) => void> = [];

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

  // 动画控制
  private frameCount = 0;
  private currentFrame = 0;
  private isLooping = false;
  private animationDriver: (() => void) | null = null;

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
    this.targetMainState = mainState;
    
    // 只有在应用已初始化时才进行状态转换
    if (this.app && this.app.renderer) {
      this.checkAndTransition();
    }
  }

  /**
   * 预加载所有资源
   */
  async preloadResources(): Promise<void> {
    return resourceCacheManager.preloadAllResources();
  }

  /**
   * 获取资源加载状态
   */
  getResourceStats() {
    return resourceCacheManager.getCacheStats();
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
    if (this.activeContainers.has(container)) {
      return true;
    }

    if (this.isInitializing && this.initializationPromise) {
      await this.initializationPromise;
      this.activeContainers.add(container);
      this.moveToContainer(container);
      return true;
    }

    if (this.app && this.animatedSprite) {
      this.activeContainers.add(container);
      this.moveToContainer(container);
      return true;
    }

    this.isInitializing = true;
    this.activeContainers.add(container);
    
    this.initializationPromise = new Promise<boolean>((resolve) => {
      this.initializationResolvers.push(resolve);
    });

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

      // 初始化第一个动画
      await this.loadAnimation(this.currentState);

      this.moveToContainer(container);

      this.isInitializing = false;
      this.initializationResolvers.forEach(resolve => resolve(true));
      this.initializationResolvers = [];
      this.initializationPromise = null;
      
      // 初始化完成后，检查是否需要状态转换
      this.checkAndTransition();
      
      return true;
    } catch (error) {
      console.error("[AnimationSequenceManager] Initialization failed:", error);
      this.isInitializing = false;
      this.activeContainers.delete(container);
      
      this.initializationResolvers.forEach(resolve => resolve(false));
      this.initializationResolvers = [];
      this.initializationPromise = null;
      
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

    // 将主状态映射到内部状态
    const internalState = mapMainStateToInternal(state.main);
    
    // 从缓存获取资源
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
    newAnimatedSprite.loop = false; // 不自动循环，由我们控制

    // 先添加新的动画精灵
    this.app.stage.addChild(newAnimatedSprite);

    // 然后移除旧的动画精灵
    if (this.animatedSprite) {
      this.app.stage.removeChild(this.animatedSprite);
      this.animatedSprite.destroy();
    }

    // 更新引用
    this.animatedSprite = newAnimatedSprite;

    // 设置帧数
    this.frameCount = frames.length;
    this.currentFrame = 0;

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
    this.currentFrame = 0;
    this.animatedSprite.gotoAndStop(0);

    // 设置循环模式
    this.isLooping = this.shouldLoop();

    // 启动动画驱动
    this.startAnimationDriver();
  }

  /**
   * 判断是否应该循环播放
   */
  private shouldLoop(): boolean {
    // repeat 状态需要循环，其他状态播放一次
    return this.currentState.sub === AnimationSubState.REPEAT;
  }

  /**
   * 启动动画驱动
   */
  private startAnimationDriver(): void {
    if (!this.app || !this.animatedSprite) {
      return;
    }

    // 移除旧的驱动
    this.stopAnimationDriver();

    let lastFrameTime = 0;
    this.animationDriver = () => {
      if (!this.animatedSprite || !this.app || !this.isPlaying) {
        return;
      }

      try {
        const deltaMS = this.app.ticker.deltaMS || 16.67;
        lastFrameTime += deltaMS;
        const frameTime = 1000 / 48; // 48fps

        if (lastFrameTime >= frameTime) {
          const steps = Math.floor(lastFrameTime / frameTime);
          lastFrameTime = lastFrameTime % frameTime;
          
          this.currentFrame = (this.currentFrame + steps) % this.frameCount;
          this.animatedSprite.gotoAndStop(this.currentFrame);

          // 检查是否播放完成
          if (this.currentFrame === this.frameCount - 1) {
            this.onAnimationFinished();
          }
        }
      } catch (error) {
        console.warn("[AnimationSequenceManager] Animation driver error:", error);
      }
    };

    if (this.app.ticker) {
      this.app.ticker.add(this.animationDriver);
    }
  }

  /**
   * 停止动画驱动
   */
  private stopAnimationDriver(): void {
    if (this.app && this.app.ticker && this.animationDriver) {
      this.app.ticker.remove(this.animationDriver);
      this.animationDriver = null;
    }
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
   * 检查并执行状态转换
   */
  private checkAndTransition(): void {
    const shouldTransition = this.shouldTransitionToNextState();
    
    if (shouldTransition) {
      this.transitionToNextState();
    } else if (this.isLooping) {
      // 循环播放当前动画
      this.currentFrame = 0;
      if (this.animatedSprite) {
        this.animatedSprite.gotoAndStop(0);
      }
    } else {
      // 停止播放
      this.isPlaying = false;
    }
  }

  /**
   * 判断是否应该转换到下一个状态
   */
  private shouldTransitionToNextState(): boolean {
    // 如果目标状态与当前主状态不同，需要转换到 end 状态
    if (this.targetMainState !== this.currentState.main) {
      return true;
    }

    // 如果当前是 start 状态，应该转换到 repeat
    if (this.currentState.sub === AnimationSubState.START) {
      return true;
    }

    // 如果当前是 repeat 状态，只有在目标状态改变时才转换到 end
    if (this.currentState.sub === AnimationSubState.REPEAT) {
      return false; // repeat 状态持续播放，直到目标状态改变
    }

    return false;
  }

  /**
   * 转换到下一个状态
   */
  private async transitionToNextState(): Promise<void> {
    const nextState = this.getNextState();
    
    if (nextState) {
      this.currentState = nextState;
      
      // 触发状态变化回调
      this.stateChangeCallbacks.forEach(callback => {
        callback(this.currentState);
      });

      // 确保 PIXI 应用已初始化
      if (!this.app || !this.app.renderer) {
        console.warn("[AnimationSequenceManager] PIXI Application not ready, skipping animation load");
        return;
      }

      // 加载新动画
      try {
        await this.loadAnimation(this.currentState);
      } catch (error) {
        console.error("[AnimationSequenceManager] Failed to load animation:", error);
      }
    }
  }

  /**
   * 获取下一个状态
   */
  private getNextState(): AnimationState | null {
    const { main, sub } = this.currentState;

    // 如果目标主状态与当前不同，先播放当前状态的 end 动画
    if (this.targetMainState !== main) {
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
        // repeat 状态持续播放，不自动转换
        return null;
      case AnimationSubState.END:
        // end 状态后，切换到目标状态
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
      console.warn("[AnimationSequenceManager] Cannot move container: PixiJS objects not initialized");
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
    this.activeContainers.delete(container);

    if (this.activeContainers.size === 0) {
      setTimeout(() => {
        if (this.activeContainers.size === 0) {
          this.cleanup();
        }
      }, 100);
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    // 停止动画驱动
    this.stopAnimationDriver();

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
    this.activeContainers.clear();
    this.isPlaying = false;
  }
}

export const animationSequenceManager = AnimationSequenceManager.getInstance();
