import type { RuntimeMode, ModeConfig } from "@config/types";
import { modeConfigs } from "./modes"


// 默认的空配置，用于不存在配置文件的模式
const EMPTY_MODE_CONFIG: ModeConfig = {
  env: {},
  site: {}
};

// 模式配置缓存
const configCache = new Map<RuntimeMode, ModeConfig>();

/**
 * 获取指定模式的配置覆盖（同步版本，使用缓存）
 * 在第一次使用前需要先调用 initModeConfigs 进行初始化
 */
export function getModeConfig(mode: RuntimeMode): ModeConfig {
  const cached = configCache.get(mode);
  if (cached) {
    return cached;
  }

  // 如果没有缓存，返回默认配置
  return EMPTY_MODE_CONFIG;
}


/**
 * 同步初始化指定模式的配置（使用静态导入）
 * 用于当需要立即使用配置时
 */
export function initModeConfig(mode: RuntimeMode): ModeConfig {
  if (configCache.has(mode)) {
    return configCache.get(mode)!;
  }

  try {
    let modeConfig = modeConfigs[mode];
    if (!modeConfig) {
      modeConfig = EMPTY_MODE_CONFIG;
    }
    configCache.set(mode, modeConfig);
    return modeConfig;
  } catch (error) {
    throw Error(`Failed to load config for mode "${mode}"`, {cause: error});
  }
}

export {deepMerge} from "../utils/objectUtils";
