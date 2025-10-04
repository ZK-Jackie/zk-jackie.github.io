import type { EnvConfig, RuntimeMode, SiteConfig, ConfigContext, ConfigFunction } from "@config/types";
import { ENV_CONFIG, SITE_CONFIG } from "./defaults";
import { initModeConfig, deepMerge } from "./utils";


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
   *
   * 对于 env 变量，优先级为默认 < 模式覆盖 < .env 文件环境变量；
   * 对于 site 配置，优先级为默认 < 模式覆盖，并支持配置函数的执行
   */
  init(mode: RuntimeMode, importMetaEnv?: ImportMetaEnv): { env: EnvConfig; site: SiteConfig } {
    this._runtimeMode = mode || 'development';

    // 1. 获取模式配置（如果还未缓存）
    const modeConfig = initModeConfig(mode);

    // 2. 初始化环境配置，默认环境配置与重写的默认环境配置合并
    let envConfig = deepMerge(ENV_CONFIG, modeConfig.env);
    // 3. 获取重写的环境配置，vite 未初始化前外部传入数据或初始化后通过 import.meta.env 传入的数据
    if (importMetaEnv || import.meta.env) {
      importMetaEnv = importMetaEnv || import.meta.env;
      const envOverrides = {
        public: {
          PUBLIC_SITE_URL: importMetaEnv.PUBLIC_SITE_URL,
          PUBLIC_BASE_URL: importMetaEnv.PUBLIC_BASE_URL,
          PUBLIC_STAT_TRACKER_URL: importMetaEnv.PUBLIC_STAT_TRACKER_URL,
          PUBLIC_STAT_PARAMS: importMetaEnv.PUBLIC_STAT_PARAMS,
          PUBLIC_LOCALE_ICP: importMetaEnv.PUBLIC_LOCALE_ICP
        }
      };
      // 只覆盖非空的环境变量
      Object.keys(envOverrides.public).forEach(key => {
        const value = (envOverrides.public as any)[key];
        if (value !== undefined && value !== '') {
          (envConfig.public as any)[key] = value;
        }
      });
    }
    this._envConfig = envConfig;

    // 3.0 创建配置上下文，用于传递给配置函数
    const configContext: ConfigContext = {
      envConfig: this._envConfig,
      mode: this._runtimeMode
    };

    // 3.1 执行默认站点配置中的函数，将函数替换为执行结果
    let defaultSiteConfigExecuted = this.executeConfigFunctions(SITE_CONFIG, configContext) as SiteConfig;
    // 3.2 执行站点配置中的函数，将函数替换为执行结果
    let modeSiteConfigExecuted = this.executeConfigFunctions(modeConfig.site, configContext) as SiteConfig;
    // 3.3 合并默认站点配置与模式覆盖的站点配置
    this._siteConfig = deepMerge(defaultSiteConfigExecuted, modeSiteConfigExecuted);

    // 4. 标记为已初始化
    this._isInitialized = true;

    // 5. 返回最终配置
    return {env: this._envConfig, site: this._siteConfig};
  }

  /**
   * 执行配置中的函数，递归处理整个配置对象
   */
  private executeConfigFunctions<T>(config: T, context: ConfigContext): T {
    if (typeof config === 'function') {
      // 如果是函数，执行它并传入配置上下文
      return (config as unknown as ConfigFunction<T>)(context);
    } else if (typeof config === 'object' && config !== null) {
      if (Array.isArray(config)) {
        // 数组类型：递归处理每个元素
        return config.map(item => this.executeConfigFunctions(item, context)) as unknown as T;
      } else {
        // 对象类型：递归处理每个属性
        const result: any = {};
        for (const key in config) {
          if (Object.prototype.hasOwnProperty.call(config, key)) {
            result[key] = this.executeConfigFunctions((config as any)[key], context);
          }
        }
        return result;
      }
    } else {
      // 基本类型：直接返回
      return config;
    }
  }

  /**
   * 确保配置已初始化
   */
  private ensureInitialized(): void {
    if (!this._isInitialized) {
      this.init(import.meta.env.MODE as RuntimeMode);
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
}

// 单例配置管理器
export const configManager = new ConfigManager();

// 导出初始化函数
export const initConfig = configManager.init.bind(configManager);