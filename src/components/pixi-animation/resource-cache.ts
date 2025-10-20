"use client";

/**
 * 简化的动画资源缓存管理器
 * 专注于按需加载和基本缓存
 */

import * as PIXI from "pixi.js";
import { AnimationConfig, InternalAnimationState } from "../../types/animation";
import { animationResources } from "./animation-resources";
import { useEffect, useMemo, useRef, useState } from "react";


interface CachedTexture {
  texture: PIXI.Texture;
  frames: PIXI.Texture[];
  config: AnimationConfig;
}

export class ResourceCacheManager {
  private static instance: ResourceCacheManager;
  public loading: boolean = false;
  private cache = new Map<string, CachedTexture>();
  private listeners = new Set<() => void>();
  private initialized: boolean = false;

  private constructor() {
    // 延迟加载，由调用方或首次订阅触发；也可在构造阶段触发但需幂等
    this.loadResources();
  }

  private async loadResources(): Promise<void> {
    // 如果已经完成过一次初始化加载，且没有缺失，则直接返回
    const entries = Object.entries(animationResources) as Array<[
      InternalAnimationState,
      AnimationConfig
    ]>;
    const missing = entries.filter(([state]) => !this.isResourceLoaded(state));
    if (missing.length === 0) {
      this.initialized = true;
      this.loading = false;
      this.notify();
      return;
    }

    this.loading = true;
    const allPromises = missing.map(async ([state, cfg]) => {
      const result = await this.loadResource(cfg);
      const cacheKey = this.getCacheKey(state);
      this.cache.set(cacheKey, result);
    });
    await Promise.all(allPromises);
    this.loading = false;
    this.initialized = true;
    this.notify();
  }

  static getInstance(): ResourceCacheManager {
    // 将单例提升到 globalThis，避免 HMR/路由切换重新实例化
    const g = globalThis as unknown as { __pixiResourceManager?: ResourceCacheManager };
    if (!g.__pixiResourceManager) {
      g.__pixiResourceManager = new ResourceCacheManager();
    }
    ResourceCacheManager.instance = g.__pixiResourceManager;
    return g.__pixiResourceManager;
  }

  /**
   * 获取缓存的资源
   */
  async getResource(state: InternalAnimationState): Promise<CachedTexture> {
    const cacheKey = this.getCacheKey(state);

    // 如果已缓存，直接返回
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 检查该状态是否有对应的子状态配置
    const stateConfig = animationResources[state];
    const result = await this.loadResource(stateConfig);
    this.cache.set(cacheKey, result);
    this.notify();

    return result;
  }

  /**
   * 加载单个资源
   */
  private async loadResource(config: AnimationConfig): Promise<CachedTexture> {
    // 先尝试复用 PIXI.Assets 的缓存，避免重复网络请求
    let texture = PIXI.Assets.get(config.imgSrc) as PIXI.Texture | undefined;
    if (!texture) {
      // 确保已注册资源键，使用稳定 key（imgSrc 本身）
      try {
        // add 如果重复会抛错，包在 try 捕获即可
        PIXI.Assets.add({ alias: config.imgSrc, src: config.imgSrc });
      } catch {}
      texture = (await PIXI.Assets.load(config.imgSrc)) as PIXI.Texture;
    }

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
      config,
    };
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(mainState: InternalAnimationState): string {
    return `${mainState}`;
  }

  /**
   * 订阅内部状态变化（loading、cache 变更）
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    // 首次订阅时触发一次幂等加载，避免路由切换后不必要重复加载
    void this.loadResources();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try { l(); } catch {}
    });
  }

  /**
   * 检查资源是否已加载
   */
  isResourceLoaded(mainState: InternalAnimationState): boolean {
    const cacheKey = this.getCacheKey(mainState);
    return this.cache.has(cacheKey);
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { loaded: number; total: number } {
    // 计算实际可用的状态组合数量
    let total = 0;
    Object.values(InternalAnimationState).forEach((mainState) => {
      const stateConfig = animationResources[mainState];
      if (stateConfig) {
        // 每个内部状态对应一个资源配置
        total += 1;
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
    this.cache.forEach((cached) => {
      cached.texture.destroy();
      cached.frames.forEach((frame) => frame.destroy());
    });

    this.cache.clear();
    this.notify();
  }

  /**
   * 获取指定状态已缓存的资源（未加载返回 undefined）
   */
  getCached(mainState: InternalAnimationState): CachedTexture | undefined {
    return this.cache.get(this.getCacheKey(mainState));
  }

  /**
   * 获取所有内部状态的缓存映射（Partial Record）
   */
  getAllCached(): Partial<Record<InternalAnimationState, CachedTexture>> {
    const result: Partial<Record<InternalAnimationState, CachedTexture>> = {};
    Object.values(InternalAnimationState).forEach((state) => {
      const cached = this.getCached(state);
      if (cached) {
        result[state] = cached;
      }
    });
    return result;
  }
}

export const resourceCacheManager = ResourceCacheManager.getInstance();

/**
 * React Hook：返回加载状态与转换后的资源映射
 * - loading: 是否仍在预加载资源
 * - resources: Partial<Record<InternalAnimationState, CachedTexture>>
 */
export function useAnimationResources() {
  const managerRef = useRef(resourceCacheManager);

  const [loading, setLoading] = useState<boolean>(managerRef.current.loading);
  const [resources, setResources] = useState<Partial<Record<InternalAnimationState, CachedTexture>>>(
    () => managerRef.current.getAllCached()
  );

  useEffect(() => {
    const unsubscribe = managerRef.current.subscribe(() => {
      setLoading(managerRef.current.loading);
      setResources(managerRef.current.getAllCached());
    });
    // 初始化同步一次，避免错过首次变化
    setLoading(managerRef.current.loading);
    const resources = managerRef.current.getAllCached();
    console.log(resources);
    setResources(resources);
    return unsubscribe;
  }, []);

  return { loading, resources };
}

