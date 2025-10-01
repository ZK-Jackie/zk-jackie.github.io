import type {EnvConfig, SiteConfig} from "@config/types";
import {DEFAULT_ENV_CONFIG, DEFAULT_SITE_CONFIG} from "./defaults";

/**
 * 配置管理器类 - 负责配置的初始化、状态管理和访问
 */
class ConfigManager {
  private _envConfig: EnvConfig | null = null;
  private _siteConfig: SiteConfig | null = null;
  private _isInitialized = false;
  private _runtimeMode: RuntimeMode = 'development';

  /**
   * 初始化配置
   */
  init(mode: RuntimeMode = 'development', importMetaEnv?: ImportMetaEnv): { env: EnvConfig; site: SiteConfig } {
    this._runtimeMode = mode;

    // 初始化环境配置
    this._envConfig = {
      MODE: mode,
      public: {
        PUBLIC_SITE_URL: importMetaEnv?.PUBLIC_SITE_URL || DEFAULT_ENV_CONFIG.public.PUBLIC_SITE_URL,
        PUBLIC_BASE_URL: importMetaEnv?.PUBLIC_BASE_URL || DEFAULT_ENV_CONFIG.public.PUBLIC_BASE_URL,
        PUBLIC_STAT_TRACKER_URL: importMetaEnv?.PUBLIC_STAT_TRACKER_URL || DEFAULT_ENV_CONFIG.public.PUBLIC_STAT_TRACKER_URL,
        PUBLIC_STAT_PARAMS: importMetaEnv?.PUBLIC_STAT_PARAMS || DEFAULT_ENV_CONFIG.public.PUBLIC_STAT_PARAMS,
        PUBLIC_LOCALE_ICP: importMetaEnv?.PUBLIC_LOCALE_ICP || DEFAULT_ENV_CONFIG.public.PUBLIC_LOCALE_ICP
      },
      private: {}
    };

    // 初始化站点配置
    this._siteConfig = {
      ...DEFAULT_SITE_CONFIG,
      locale: {
        ...DEFAULT_SITE_CONFIG.locale,
        icpNumber: ["production", "development"].includes(mode) ? "粤ICP备2025457771号" : "",
      },
    };

    this._isInitialized = true;
    return {env: this._envConfig, site: this._siteConfig};
  }

  /**
   * 确保配置已初始化
   */
  private ensureInitialized(): void {
    if (!this._isInitialized) {
      this.init();
    }
  }

  /**
   * 获取环境配置
   */
  getEnvConfig(): EnvConfig {
    this.ensureInitialized();
    return this._envConfig!;
  }

  /**
   * 获取站点配置
   */
  getSiteConfig(): SiteConfig {
    this.ensureInitialized();
    return this._siteConfig!;
  }

  /**
   * 创建配置代理对象
   */
  createConfigProxy<T extends Record<string, any>>(getter: () => T): T {
    return new Proxy({} as T, {
      get(_, prop) {
        return getter()[prop as keyof T];
      },
      ownKeys(_) {
        return Object.keys(getter());
      },
      getOwnPropertyDescriptor(_, prop) {
        const target = getter();
        return Object.getOwnPropertyDescriptor(target, prop);
      },
      has(_, prop) {
        return prop in getter();
      }
    });
  }

  /**
   * 创建配置子部分代理对象
   */
  createSectionProxy<T extends Record<string, any>>(getter: () => T): T {
    return new Proxy({} as T, {
      get(_, prop) {
        return getter()[prop as keyof T];
      },
      ownKeys(_) {
        return Object.keys(getter());
      },
      getOwnPropertyDescriptor(_, prop) {
        const target = getter();
        return Object.getOwnPropertyDescriptor(target, prop);
      },
      has(_, prop) {
        return prop in getter();
      }
    });
  }
}

// 单例配置管理器
export const configManager = new ConfigManager();

// 导出初始化函数
export const initConfig = configManager.init.bind(configManager);