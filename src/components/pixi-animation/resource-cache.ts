/**
 * 简化的动画资源缓存管理器
 * 专注于按需加载和基本缓存
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

  private constructor() {}

  static getInstance(): ResourceCacheManager {
    if (!ResourceCacheManager.instance) {
      ResourceCacheManager.instance = new ResourceCacheManager();
    }
    return ResourceCacheManager.instance;
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

    // 检查该状态是否有对应的子状态配置
    const stateConfig = animationResources[mainState];
    if (!stateConfig || !(subState in stateConfig)) {
      throw new Error(`No configuration found for ${mainState}-${subState}`);
    }

    // 加载资源
    const config = stateConfig[subState as keyof typeof stateConfig];
    const result = await this.loadResource(config);
    this.cache.set(cacheKey, result);
    
    return result;
  }

  /**
   * 加载单个资源
   */
  private async loadResource(config: AnimationConfig): Promise<CachedTexture> {
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
  getCacheStats(): { loaded: number; total: number } {
    // 计算实际可用的状态组合数量
    let total = 0;
    Object.values(InternalAnimationState).forEach(mainState => {
      const stateConfig = animationResources[mainState];
      if (stateConfig) {
        total += Object.keys(stateConfig).length;
      }
    });
    
    const loaded = this.cache.size;
    
    return { loaded, total };
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
  }
}

export const resourceCacheManager = ResourceCacheManager.getInstance();