/**
 * 动画资源配置
 */

import {
  AnimationResources,
  InternalAnimationState,
  AnimationConfig,
} from "../../types/animation";

// 导入动画资源图片
import waitImg from "./png/standing-repeat-55-10000x10000-1000x1000.webp";
import writingStartImg from "./png/writing-start-13-10000x10000-1000x1000.webp";
import writingRepeatImg from "./png/writing-repeat-49-10000x10000-1000x1000.webp";
import writingEndImg from "./png/writing-end-15-10000x10000-1000x1000.webp";
import talkingStartImg from "./png/talking-start-11-10000x10000-1000x1000.webp";
import talkingRepeatImg from "./png/talking-repeat-27-10000x10000-1000x1000.webp";
import talkingEndImg from "./png/talking-end-14-10000x10000-1000x1000.webp";

import waitImgMD from "./png/standing-repeat-55-4000x2400-400x400.webp";
import writingStartImgMD from "./png/writing-start-13-4000x4000-400x400.png";
import writingRepeatImgMD from "./png/writing-repeat-49-4000x4000-400x400.png";
import writingEndImgMD from "./png/writing-end-15-4000x4000-400x400.png";
import talkingStartImgMD from "./png/talking-start-11-4000x4000-400x400.png";
import talkingRepeatImgMD from "./png/talking-repeat-27-4000x4000-400x400.png";
import talkingEndImgMD from "./png/talking-end-14-4000x4000-400x400.png";

import waitImgSM from "./png/standing-repeat-55-1000x1000-100x100.png";
import writingStartImgSM from "./png/writing-start-13-1000x1000-100x100.png";
import writingRepeatImgSM from "./png/writing-repeat-49-1000x1000-100x100.png";
import writingEndImgSM from "./png/writing-end-15-1000x1000-100x100.png";
import talkingStartImgSM from "./png/talking-start-11-1000x1000-100x100.png";
import talkingRepeatImgSM from "./png/talking-repeat-27-1000x1000-100x100.png";
import talkingEndImgSM from "./png/talking-end-14-1000x1000-100x100.png";

import { Application, Renderer, Texture, Assets } from "pixi.js";

const writingStartUrls: AnimationConfig[] = [
  {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    imgSrc: writingStartImg.src,
    count: 13,
    fps: 24,
  },
  {
    width: 4000,
    height: 4000,
    cellWidth: 400,
    cellHeight: 400,
    imgSrc: writingStartImgMD.src,
    count: 13,
    fps: 24,
  },
  {
    width: 1000,
    height: 1000,
    cellWidth: 100,
    cellHeight: 100,
    imgSrc: writingStartImgSM.src,
    count: 13,
    fps: 24,
  },
];

const writingRepeatUrls: AnimationConfig[] = [
  {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    imgSrc: writingRepeatImg.src,
    count: 49,
    fps: 24,
  },
  {
    width: 4000,
    height: 4000,
    cellWidth: 400,
    cellHeight: 400,
    imgSrc: writingRepeatImgMD.src,
    count: 49,
    fps: 24,
  },
  {
    width: 1000,
    height: 1000,
    cellWidth: 100,
    cellHeight: 100,
    imgSrc: writingRepeatImgSM.src,
    count: 49,
    fps: 24,
  },
];

const writingEndUrls: AnimationConfig[] = [
  {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    imgSrc: writingEndImg.src,
    count: 15,
    fps: 24,
  },
  {
    width: 4000,
    height: 4000,
    cellWidth: 400,
    cellHeight: 400,
    imgSrc: writingEndImgMD.src,
    count: 15,
    fps: 24,
  },
  {
    width: 1000,
    height: 1000,
    cellWidth: 100,
    cellHeight: 100,
    imgSrc: writingEndImgSM.src,
    count: 15,
    fps: 24,
  },
];

const talkingStartUrls: AnimationConfig[] = [
  {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    imgSrc: talkingStartImg.src,
    count: 11,
    fps: 24,
  },
  {
    width: 4000,
    height: 4000,
    cellWidth: 400,
    cellHeight: 400,
    imgSrc: talkingStartImgMD.src,
    count: 11,
    fps: 24,
  },
  {
    width: 1000,
    height: 1000,
    cellWidth: 100,
    cellHeight: 100,
    imgSrc: talkingStartImgSM.src,
    count: 11,
    fps: 24,
  },
];

const talkingRepeatUrls: AnimationConfig[] = [
  {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    imgSrc: talkingRepeatImg.src,
    count: 27,
    fps: 24,
  },
  {
    width: 4000,
    height: 4000,
    cellWidth: 400,
    cellHeight: 400,
    imgSrc: talkingRepeatImgMD.src,
    count: 27,
    fps: 24,
  },
  {
    width: 1000,
    height: 1000,
    cellWidth: 100,
    cellHeight: 100,
    imgSrc: talkingRepeatImgSM.src,
    count: 27,
    fps: 24,
  },
];

const talkingEndUrls: AnimationConfig[] = [
  {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    imgSrc: talkingEndImg.src,
    count: 14,
    fps: 24,
  },
  {
    width: 4000,
    height: 4000,
    cellWidth: 400,
    cellHeight: 400,
    imgSrc: talkingEndImgMD.src,
    count: 14,
    fps: 24,
  },
  {
    width: 1000,
    height: 1000,
    cellWidth: 100,
    cellHeight: 100,
    imgSrc: talkingEndImgSM.src,
    count: 14,
    fps: 24,
  },
];

const WaitUrls: AnimationConfig[] = [
  {
    width: 10000,
    height: 10000,
    cellWidth: 1000,
    cellHeight: 1000,
    imgSrc: waitImg.src,
    count: 55,
    fps: 48,
  },
  {
    width: 4000,
    height: 4000,
    cellWidth: 400,
    cellHeight: 400,
    imgSrc: waitImgMD.src,
    count: 55,
    fps: 48,
  },
  {
    width: 1000,
    height: 1000,
    cellWidth: 100,
    cellHeight: 100,
    imgSrc: waitImgSM.src,
    count: 55,
    fps: 48,
  },
];

type TextureConfig = {
  width: number;
  height: number;
  imgSrc: string;
  cellWidth: number;
  cellHeight: number;
};

type TextureOption = {
  width: number;
  height: number;
  imgSrc: string;
  cellWidth: number;
  cellHeight: number;
  texture: Texture;
  fps: number;
  count: number;
};

/**
 * 多资源文件配置映射
 * 每个动画状态对应多个分辨率的配置数组
 */
export type MultiResourceConfig = Record<
  InternalAnimationState,
  AnimationConfig[]
>;

export class PreloadResourcesManager {
  private multiResourceConfig: MultiResourceConfig;
  private maxTextureSizeCache: number | null = null;
  private isMobileCache: boolean | null = null;

  constructor(multiResourceConfig: MultiResourceConfig) {
    this.multiResourceConfig = multiResourceConfig;
  }

  /**
   * 检测是否为 iOS 设备
   */
  private isIOS(): boolean {
    const ua = navigator.userAgent.toLowerCase();

    // iPhone / iPod / iPad (iOS 12及以下)
    if (/iphone|ipod|ipad/.test(ua)) return true;

    // iPadOS 13+ (Safari 伪装成 macOS)
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
      return true;
    }

    return false;
  }

  /**
   * 检测是否为移动设备（缓存结果）
   */
  private isMobileDevice(): boolean {
    if (this.isMobileCache !== null) {
      return this.isMobileCache;
    }

    if (typeof window === "undefined") {
      this.isMobileCache = false;
      return false;
    }

    const ua = navigator.userAgent;
    const isIOS = this.isIOS();
    const isAndroid = /Android/i.test(ua);
    this.isMobileCache = isIOS || isAndroid;
    return this.isMobileCache;
  }

  /**
   * 获取设备最大纹理尺寸（缓存结果，避免重复创建 Application）
   */
  private async getMaxTextureSize(): Promise<number> {
    if (this.maxTextureSizeCache !== null) {
      return this.maxTextureSizeCache;
    }

    // 非移动设备，返回默认大值
    if (!this.isMobileDevice()) {
      this.maxTextureSizeCache = 16384; // 桌面设备通常支持 16K
      return this.maxTextureSizeCache;
    }

    try {
      // Query MAX_TEXTURE_SIZE via a temporary app
      const tempApp = new Application();
      await tempApp.init({
        width: 1,
        height: 1,
        preference: "webgl", // Force WebGL renderer
      });
      const maxTextureSize = (
        tempApp.renderer as Renderer & { gl: WebGLRenderingContext }
      ).gl.getParameter(
        (tempApp.renderer as Renderer & { gl: WebGLRenderingContext }).gl
          .MAX_TEXTURE_SIZE
      );

      tempApp.destroy(true);

      console.log(`[PixiAnimation] Device MAX_TEXTURE_SIZE: ${maxTextureSize}`);
      this.maxTextureSizeCache = maxTextureSize;
      return maxTextureSize;
    } catch (error) {
      console.warn(
        "[PixiAnimation] Failed to detect texture size, using fallback:",
        error
      );
      // 保守的回退值：大多数移动设备至少支持 2048
      this.maxTextureSizeCache = 2048;
      return this.maxTextureSizeCache;
    }
  }

  /**
   * 为单个动画状态选择最优配置
   */
  private async getOptimalImageConfig(
    textureOptions: AnimationConfig[]
  ): Promise<AnimationConfig> {
    const isMobile = this.isMobileDevice();

    // 桌面设备：优先使用最大分辨率（通常是第一个）
    if (!isMobile) {
      const desktopOption = textureOptions.find(
        o => o.width >= 10000 || o.width === 15000
      );
      if (desktopOption) {
        return desktopOption;
      }
      // 如果没有超大分辨率，返回最大分辨率
      return textureOptions[0];
    }

    // 移动设备：根据 MAX_TEXTURE_SIZE 选择
    try {
      const maxTextureSize = await this.getMaxTextureSize();

      // 过滤掉桌面专用的大分辨率，按大小降序排序
      const mobileCandidates = textureOptions
        .filter(o => o.width < 10000 && o.width <= maxTextureSize)
        .sort((a, b) => b.width - a.width);

      if (mobileCandidates.length > 0) {
        // 选择最大且不超过限制的配置
        return mobileCandidates[0];
      }

      // 如果没有合适的，选择最小的作为回退
      const allMobile = textureOptions
        .filter(o => o.width < 10000)
        .sort((a, b) => a.width - b.width);
      if (allMobile.length > 0) {
        console.warn(
          `[PixiAnimation] No suitable texture found for max size ${maxTextureSize}, using smallest: ${allMobile[0].width}`
        );
        return allMobile[0];
      }
    } catch (error) {
      console.warn(
        "[PixiAnimation] Failed to select optimal config, using fallback:",
        error
      );
    }

    // 最终回退：选择中等分辨率或最小分辨率
    const fallback =
      textureOptions.find(o => o.width === 4000) ||
      textureOptions.find(o => o.width === 1000) ||
      textureOptions[textureOptions.length - 1];
    return fallback;
  }

  /**
   * 为单个动画状态获取最优纹理配置（包含已加载的 Texture）
   */
  public async getOptimalTextureConfig(
    state: InternalAnimationState
  ): Promise<TextureOption> {
    const textureOptions = this.multiResourceConfig[state];
    if (!textureOptions || textureOptions.length === 0) {
      throw new Error(
        `[PixiAnimation] No texture options found for state: ${state}`
      );
    }

    let texture: Texture | undefined = undefined;
    let config: AnimationConfig | undefined = undefined;

    try {
      // 尝试加载最优配置
      const optimalConfig = await this.getOptimalImageConfig(textureOptions);
      const t = await Assets.load(optimalConfig.imgSrc);
      if (!t || !t.source) {
        throw new Error("Primary texture has no valid source");
      }
      texture = t;
      config = { ...optimalConfig };
    } catch (loadError) {
      console.warn(
        `[PixiAnimation] Failed to load optimal texture for ${state}, trying fallbacks:`,
        loadError
      );

      // 按优先级顺序尝试回退配置
      const ordered = textureOptions
        .sort((a, b) => b.width - a.width)
        .filter(Boolean) as AnimationConfig[];

      let lastError: Error | undefined = undefined;
      for (const fallbackConfig of ordered) {
        try {
          const t = await Assets.load(fallbackConfig.imgSrc);
          if (!t || !t.source) {
            throw new Error("Fallback texture has no valid source");
          }
          texture = t;
          config = { ...fallbackConfig };
          console.log(
            `[PixiAnimation] Successfully loaded fallback texture for ${state}: ${fallbackConfig.width}x${fallbackConfig.height}`
          );
          break;
        } catch (fallbackError) {
          lastError = fallbackError as Error;
        }
      }

      if (!texture || !config) {
        throw new Error(
          `[PixiAnimation] All image fallbacks failed for ${state}. Last error: ${
            (lastError as Error)?.message || "Unknown error"
          }. Your device does not support animation.`
        );
      }
    }

    return {
      texture: texture as Texture,
      ...config,
    };
  }

  /**
   * 为所有动画状态获取最优资源配置
   * 输出兼容移动端的 AnimationResources 映射
   */
  public async getOptimalResources(): Promise<AnimationResources> {
    const states = Object.keys(
      this.multiResourceConfig
    ) as InternalAnimationState[];
    const optimalConfigs: Partial<AnimationResources> = {};

    // 并行获取所有状态的最优配置（不加载纹理，只选择配置）
    const configPromises = states.map(async state => {
      const textureOptions = this.multiResourceConfig[state];
      if (!textureOptions || textureOptions.length === 0) {
        console.warn(
          `[PixiAnimation] No texture options for state: ${state}, skipping`
        );
        return null;
      }

      const optimalConfig = await this.getOptimalImageConfig(textureOptions);
      return { state, config: optimalConfig };
    });

    const results = await Promise.all(configPromises);

    // 构建结果映射
    for (const result of results) {
      if (result && result.config) {
        optimalConfigs[result.state] = result.config;
      }
    }

    // 验证所有必需的状态都已配置
    const requiredStates = Object.values(InternalAnimationState);
    const missingStates = requiredStates.filter(
      state => !optimalConfigs[state]
    );

    if (missingStates.length > 0) {
      throw new Error(
        `[PixiAnimation] Missing optimal configs for states: ${missingStates.join(
          ", "
        )}`
      );
    }

    return optimalConfigs as AnimationResources;
  }

  /**
   * 获取单个状态的最优配置（不加载纹理，仅返回配置）
   */
  public async getOptimalConfig(
    state: InternalAnimationState
  ): Promise<AnimationConfig> {
    const textureOptions = this.multiResourceConfig[state];
    if (!textureOptions || textureOptions.length === 0) {
      throw new Error(
        `[PixiAnimation] No texture options found for state: ${state}`
      );
    }
    return this.getOptimalImageConfig(textureOptions);
  }
}

/**
 * 多分辨率资源配置映射
 * 每个动画状态对应多个分辨率的配置数组（从大到小）
 */
export const multiResourceConfig: MultiResourceConfig = {
  [InternalAnimationState.wait]: WaitUrls,
  [InternalAnimationState.writing_start]: writingStartUrls,
  [InternalAnimationState.writing_repeat]: writingRepeatUrls,
  [InternalAnimationState.writing_end]: writingEndUrls,
  [InternalAnimationState.talk_start]: talkingStartUrls,
  [InternalAnimationState.talk_repeat]: talkingRepeatUrls,
  [InternalAnimationState.talk_end]: talkingEndUrls,
};

/**
 * 创建资源管理器实例（使用多资源配置）
 */
export function createPreloadResourcesManager(): PreloadResourcesManager {
  return new PreloadResourcesManager(multiResourceConfig);
}

/**
 * 动画资源配置（默认使用最大分辨率，用于向后兼容）
 * 注意：建议使用 PreloadResourcesManager.getOptimalResources() 获取移动端兼容配置
 */

export const animationResourcesLoader = createPreloadResourcesManager();
