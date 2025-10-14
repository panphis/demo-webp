/**
 * 动画资源缓存管理器
 * 负责预加载和缓存所有动画资源
 */

import * as PIXI from "pixi.js";
import { AnimationConfig, InternalAnimationState, AnimationSubState } from "../../types/animation";
import { animationResources } from "./animation-resources";

interface CachedTexture {
  texture: PIXI.Texture;
  frames: PIXI.Texture[];
  config: AnimationConfig;
}

class ResourceCacheManager {
  private static instance: ResourceCacheManager;
  private cache = new Map<string, CachedTexture>();
  private loadingPromises = new Map<string, Promise<CachedTexture>>();
  private isPreloading = false;

  private constructor() {}

  static getInstance(): ResourceCacheManager {
    if (!ResourceCacheManager.instance) {
      ResourceCacheManager.instance = new ResourceCacheManager();
    }
    return ResourceCacheManager.instance;
  }

  /**
   * 预加载所有动画资源
   */
  async preloadAllResources(): Promise<void> {
    if (this.isPreloading) {
      return;
    }

    this.isPreloading = true;
    console.log("[ResourceCache] 开始预加载所有动画资源...");

    const loadPromises: Promise<void>[] = [];

    // 遍历所有状态和子状态
    Object.values(InternalAnimationState).forEach(mainState => {
      Object.values(AnimationSubState).forEach(subState => {
        const config = animationResources[mainState][subState];
        const cacheKey = this.getCacheKey(mainState, subState);
        
        if (!this.cache.has(cacheKey)) {
          loadPromises.push(
            this.loadResource(mainState, subState, config).then(() => {
              console.log(`[ResourceCache] 已加载: ${mainState}-${subState}`);
            })
          );
        }
      });
    });

    try {
      await Promise.all(loadPromises);
      console.log("[ResourceCache] 所有资源预加载完成");
    } catch (error) {
      console.error("[ResourceCache] 预加载失败:", error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * 获取缓存的资源
   */
  async getResource(mainState: InternalAnimationState, subState: AnimationSubState): Promise<CachedTexture> {
    const cacheKey = this.getCacheKey(mainState, subState);
    
    // 如果已缓存，直接返回
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 如果正在加载，等待加载完成
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // 开始加载
    const config = animationResources[mainState][subState];
    return this.loadResource(mainState, subState, config);
  }

  /**
   * 加载单个资源
   */
  private async loadResource(
    mainState: InternalAnimationState, 
    subState: AnimationSubState, 
    config: AnimationConfig
  ): Promise<CachedTexture> {
    const cacheKey = this.getCacheKey(mainState, subState);

    const loadPromise = this._loadResourceInternal(config);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const result = await loadPromise;
      this.cache.set(cacheKey, result);
      this.loadingPromises.delete(cacheKey);
      return result;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * 内部加载实现
   */
  private async _loadResourceInternal(config: AnimationConfig): Promise<CachedTexture> {
    // 加载纹理
    const texture = await PIXI.Assets.load(config.imgSrc);
    
    if (texture.source && "scaleMode" in texture.source) {
      texture.source.scaleMode = "nearest";
    }

    // 计算帧布局
    const frameWidth = config.cellWidth;
    const frameHeight = config.cellHeight;
    const totalFrames = config.count;
    const sheetWidth = texture.source?.width ?? config.width;
    const cols = Math.max(1, Math.floor(sheetWidth / frameWidth));

    // 生成帧纹理
    const safe = 1;
    const frames = Array.from({ length: totalFrames }, (_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = col * frameWidth + safe;
      const y = row * frameHeight + safe;
      const w = frameWidth - safe * 2;
      const h = frameHeight - safe * 2;
      return new PIXI.Texture({
        source: texture.source,
        frame: new PIXI.Rectangle(x, y, w, h),
      });
    });

    return {
      texture,
      frames,
      config
    };
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(mainState: InternalAnimationState, subState: AnimationSubState): string {
    return `${mainState}-${subState}`;
  }

  /**
   * 检查资源是否已加载
   */
  isResourceLoaded(mainState: InternalAnimationState, subState: AnimationSubState): boolean {
    const cacheKey = this.getCacheKey(mainState, subState);
    return this.cache.has(cacheKey);
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { loaded: number; total: number; loading: number } {
    const total = Object.keys(InternalAnimationState).length * Object.keys(AnimationSubState).length;
    const loaded = this.cache.size;
    const loading = this.loadingPromises.size;
    
    return { loaded, total, loading };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    // 销毁所有纹理
    this.cache.forEach(cached => {
      cached.texture.destroy();
      cached.frames.forEach(frame => frame.destroy());
    });
    
    this.cache.clear();
    this.loadingPromises.clear();
    this.isPreloading = false;
  }
}

export const resourceCacheManager = ResourceCacheManager.getInstance();
