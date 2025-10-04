import type { SiteConfig, ConfigValue, ConfigContext } from "@config/types";
import { fromEnvConfig } from "./utils.ts";


export const SITE_CONFIG: DeepPartial<ConfigValue<SiteConfig>> = {
  statistics: {
    provider: "umami",
    enabled: true,
    trackerUrl: "/lib/umami.tracker.min.js",
    parameters: (context: ConfigContext) => {
      return context.envConfig.public.PUBLIC_STAT_PARAMS || "";
    },
    pageViewsEnabled: false,
    siteViewsEnabled: false
  },
  features: {
    rss: true,
  },
  // 使用函数配置的示例：站点元数据根据环境动态生成
  siteMetadata: (context: ConfigContext) => {
    const isDev = context.mode === 'development';
    return {
      title: isDev ? "[开发] 全栈学徒实录" : "全栈学徒实录",
      description: isDev ? "[开发环境] 个人博客，记录关于全栈开发的技术学习和实践" : undefined,
    };
  },
  locale: {
    icpNumber: fromEnvConfig("PUBLIC_LOCALE_ICP", "")
  }
};