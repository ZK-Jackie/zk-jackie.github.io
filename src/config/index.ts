import { configManager } from "./manager";

// 配置导出
export const envConfig = configManager.createConfigProxy(() => configManager.getEnvConfig());
export const siteConfig = configManager.createConfigProxy(() => configManager.getSiteConfig());

// 实例获取函数 - 用于需要直接访问配置对象的场景
export const getEnvConfigInstance = () => configManager.getEnvConfig();
export const getSiteConfigInstance = () => configManager.getSiteConfig();

// 初始化函数导出
export { initConfig } from "./manager";