/**
 * Simplified global PixiJS animation manager
 * Solves React StrictMode duplicate initialization issues
 */

import * as PIXI from "pixi.js";

type Config = {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  count: number;
  imgSrc: string;
};
class SimpleGlobalWaitPixiManager {
  private static instance: SimpleGlobalWaitPixiManager;
  private app: PIXI.Application | null = null;
  private animatedSprite: PIXI.AnimatedSprite | null = null;
  private currentContainer: HTMLDivElement | null = null;
  private isInitializing = false;
  private activeContainers = new Set<HTMLDivElement>();

  private constructor() {}

  static getInstance(): SimpleGlobalWaitPixiManager {
    if (!SimpleGlobalWaitPixiManager.instance) {
      SimpleGlobalWaitPixiManager.instance = new SimpleGlobalWaitPixiManager();
    }
    return SimpleGlobalWaitPixiManager.instance;
  }

  async getOrCreateAnimation(container: HTMLDivElement, config: Config): Promise<boolean> {
    // If container is already registered, return success directly
    if (this.activeContainers.has(container)) {
      return true;
    }
    

    // If currently initializing, wait for completion
    if (this.isInitializing) {
      return new Promise(resolve => {
        const checkInit = () => {
          if (!this.isInitializing) {
            this.activeContainers.add(container);
            this.moveToContainer(container);
            resolve(true);
          } else {
            setTimeout(checkInit, 50);
          }
        };
        checkInit();
      });
    }

    // If already initialized, move to new container directly
    if (this.app && this.animatedSprite) {
      this.activeContainers.add(container);
      this.moveToContainer(container);
      return true;
    }

    // Start initialization
    this.isInitializing = true;
    this.activeContainers.add(container);

    const { width, height, cellWidth, cellHeight, count, imgSrc } = config;

    try {
      // Create PixiJS application
      this.app = new PIXI.Application();
      await this.app.init({
        width: cellWidth,
        height: cellHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Load animation resources
      const texture = await PIXI.Assets.load(imgSrc);

      if (texture.source && "scaleMode" in texture.source) {
        texture.source.scaleMode = "nearest";
      }

      // Calculate grid layout
      const frameWidth = cellWidth;
      const frameHeight = cellHeight;
      const totalFrames = count;
      const sheetWidth = texture.source?.width ?? width;
      const cols = Math.max(1, Math.floor(sheetWidth / frameWidth));

      // Generate frame textures
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

      // Create animated sprite
      this.animatedSprite = new PIXI.AnimatedSprite({
        textures: frames,
        autoUpdate: false,
      });

      // todo
      // 监听动画完成 根据外部状态判断是否切换 下一组动画
      this.animatedSprite.onFrameChange = (currentFrame: number) => {
        if (currentFrame === totalFrames - 1) {
          // console.log("onFrameChange complete");
        }
      };

      if (!this.app || !this.app.renderer || !this.animatedSprite) {
        throw new Error("PixiJS objects not properly initialized");
      }

      this.animatedSprite.anchor.set(0.5);
      this.animatedSprite.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);

      // Scale to fit container
      const scale = Math.min(this.app.renderer.width / frameWidth, this.app.renderer.height / frameHeight);
      this.animatedSprite.scale.set(scale);

      // Configure animation
      this.animatedSprite.animationSpeed = 1;
      this.animatedSprite.loop = true;
      // this.animatedSprite.gotoAndStop(0);

      this.app.stage.addChild(this.animatedSprite);

      // Frame watcher
      const frameWatcher = () => {
        if (!this.animatedSprite) {
          return;
        }
        try {
          const _cf = this.animatedSprite.currentFrame ?? 0;
          // Can add frame update logic here
        } catch (error) {
          console.warn("[SimpleGlobalPixiManager] Frame watcher error:", error);
        }
      };

      if (this.app && this.app.ticker) {
        this.app.ticker.add(frameWatcher);
      }

      // Custom animation driver - fixed 48fps
      let lastFrameTime = 0;
      const driverTick = () => {
        if (!this.animatedSprite || !this.app) {
          return;
        }
        try {
          const deltaMS = this.app.ticker.deltaMS || 16.67;
          lastFrameTime += deltaMS;
          const frameTime = 1000 / 48; // Fixed 48fps
          if (lastFrameTime >= frameTime) {
            const steps = Math.floor(lastFrameTime / frameTime);
            lastFrameTime = lastFrameTime % frameTime;
            const next = (this.animatedSprite.currentFrame + steps) % totalFrames;
            this.animatedSprite.gotoAndStop(next);
          }
        } catch (error) {
          console.warn("[SimpleGlobalPixiManager] Animation driver error:", error);
        }
      };

      if (this.app && this.app.ticker) {
        this.app.ticker.add(driverTick);
      }

      // Move to container
      this.moveToContainer(container);

      this.isInitializing = false;
      return true;
    } catch (error) {
      console.error("[SimpleGlobalPixiManager] Initialization failed:", error);
      this.isInitializing = false;
      this.activeContainers.delete(container);
      this.cleanup();
      throw error;
    }
  }

  moveToContainer(container: HTMLDivElement): void {
    if (!this.app || !this.app.renderer || !this.app.renderer.canvas) {
      console.warn("[SimpleGlobalPixiManager] Cannot move container: PixiJS objects not initialized");
      return;
    }

    if (this.currentContainer === container) {
      return;
    }

    try {
      container.innerHTML = "";
      container.appendChild(this.app.renderer.canvas);

      // Set canvas styles
      this.app.renderer.canvas.style.position = "relative";
      this.app.renderer.canvas.style.zIndex = "1";
      this.app.renderer.canvas.style.display = "block";
      this.app.renderer.canvas.style.width = "100%";
      this.app.renderer.canvas.style.height = "100%";

      // Manually adjust renderer size to match container
      const resizeObserver = new ResizeObserver(() => {
        if (this.app && this.app.renderer && container) {
          const rect = container.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            this.app.renderer.resize(rect.width, rect.height);
            // Update animated sprite position
            if (this.animatedSprite) {
              this.animatedSprite.position.set(rect.width / 2, rect.height / 2);
              const scale = Math.min(rect.width / 1000, rect.height / 1000);
              this.animatedSprite.scale.set(scale);
            }
          }
        }
      });

      resizeObserver.observe(container);

      // Store resize observer for later cleanup
      (this.app as PIXI.Application & { _resizeObserver?: ResizeObserver })._resizeObserver = resizeObserver;

      this.currentContainer = container;
    } catch (e) {
      console.error("[SimpleGlobalPixiManager] Failed to move container:", e);
    }
  }

  unregisterContainer(container: HTMLDivElement): void {
    this.activeContainers.delete(container);

    // If no active containers, cleanup resources
    if (this.activeContainers.size === 0) {
      setTimeout(() => {
        if (this.activeContainers.size === 0) {
          this.cleanup();
        }
      }, 100);
    }
  }

  private cleanup(): void {
    if (this.app) {
      // Cleanup ResizeObserver
      const appWithObserver = this.app as PIXI.Application & { _resizeObserver?: ResizeObserver };
      if (appWithObserver._resizeObserver) {
        appWithObserver._resizeObserver.disconnect();
        appWithObserver._resizeObserver = undefined;
      }

      // Stop ticker
      if (this.app.ticker) {
        this.app.ticker.stop();
      }

      // Destroy application
      try {
        this.app.destroy(true);
      } catch (error) {
        console.warn("[SimpleGlobalPixiManager] Error destroying PIXI app:", error);
      }
      this.app = null;
    }

    this.animatedSprite = null;
    this.currentContainer = null;
    this.activeContainers.clear();
  }
}

export const simpleGlobalPixiManager = SimpleGlobalWaitPixiManager.getInstance();
