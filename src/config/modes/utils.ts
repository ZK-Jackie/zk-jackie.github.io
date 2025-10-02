import type { ConfigContext, EnvConfig } from "@config/types";

/**
 * 引用环境配置的值
 * @param key 环境配置的键（来自 EnvConfig["public"]）
 * @param fallback 可选的回退值
 * @param throwError 如果未找到值且未提供回退值，是否抛出错误
 */
export function fromEnvConfig(key: keyof EnvConfig["public"], fallback?: string, throwError: boolean=false) {
  return (context: ConfigContext) => {
    const value = context.envConfig.public[key];
    return fallbackOrThrow(
      value, fallback, throwError,
      `Missing required public environment config: ${key}, please set it in your mode config or .env file.`
    );
  }
}

/**
 * 引用环境变量的值
 * @param key 环境变量的键（来自 .env.[mode] 文件）
 * @param fallback 可选的回退值
 * @param throwError 如果未找到值且未提供回退值，是否抛出错误
 */
export function fromEnv(key: string, fallback?: string, throwError: boolean=false) {
  return () => {
    const value = import.meta.env[key];
    return fallbackOrThrow(
      value, fallback, throwError,
      `Missing required environment variable: ${key}, please set it in your .env file.`
    );
  }
}

function fallbackOrThrow<T>(value: T | undefined, fallback: T | undefined, throwError: boolean, errorMsg: string): T | undefined {
  if(value !== undefined) {
    return value;
  } else if(fallback !== undefined) {
    return fallback;
  } else if(throwError) {
    throw new Error(errorMsg);
  } else {
    return undefined;
  }
}
