import type { EnvConfig, SiteConfig } from "@config/types";


/**
 * 站点元数据默认配置
 */
const DEFAULT_SITE_METADATA: SiteConfig["siteMetadata"] = {
  title: "全栈学徒实录",
  prologue: "一个努力成为全栈开发工程师的喃喃自语",
  description: "个人博客，记录关于全栈开发的技术学习和实践、放置个人学习笔记",
  author: "ZK-Jackie",
  logoType: "text" as const,
  logo: "全栈学徒实录",
  logoSize: [200, 30] as [number, number],
  copyright: "© 2025 Jackie. All rights reserved.",
};

/**
 * SEO 默认配置
 */
const DEFAULT_SEO_CONFIG: SiteConfig["seo"] = {
  ogImage: "/images/og-image.png",
  noindex: ["**", "/tags/**", "/categories/**", "/authors/**", "/search/**", "/page/**"],
  robots: [
    {
      userAgent: "*",
      disallow: ["/"],
    }
  ]
};

/**
 * 导航默认配置
 */
const DEFAULT_NAVIGATION_CONFIG: SiteConfig["navigation"] = {
  main: [
    {name: "首页", url: "/"},
    {name: "合集", url: "/series"},
    {
      name: "文章",
      url: "/posts",
      children: [
        {name: "主题", url: "/categories"},
        {name: "标签", url: "/tags"},
        {name: "作者", url: "/authors"},
      ],
    },
    {name: "关于", url: "/about"},
  ],
  footer: [
    {name: "首页", url: "/"},
    {name: "关于", url: "/about"},
  ],
};

/**
 * 其他配置默认值
 */
const DEFAULT_I18N_CONFIG: SiteConfig["i18n"] = {
  defaultLocale: "zh",
  locales: ["zh", "en"],
  showDefaultLang: false
};

/** 内容默认配置 **/
const DEFAULT_CONTENT_CONFIG: SiteConfig["content"] = {
  postsPerPage: 6,
  summaryLength: 100,
  tocMaxDepth: 4,
};

/** 站点统计配置 **/
const DEFAULT_STATISTICS_CONFIG: SiteConfig["statistics"] = {
  provider: "umami",
  enabled: false,
  trackerUrl: "",
  parameters: "",
  pageViewsEnabled: false,
  siteViewsEnabled: false,
};

/** 特殊功能配置，若某一功能不断完善，将独立成单独配置项 **/
const DEFAULT_FEATURES_CONFIG: SiteConfig["features"] = {
  rss: false,
  pageShare: ["email", "qrcode"],
  sitemap: false
};

/** 联系方式配置 **/
const DEFAULT_SOCIAL_CONFIG: SiteConfig["social"] = {
  github: "https://github.com/ZK-Jackie",
  email: "mailto:jackiey101@foxmail.com",
};

const DEFAULT_CONTACT_CONFIG: SiteConfig["contact"] = {
  email: "jackiey101@foxmail.com",
  formAction: "#",
};

const DEFAULT_LOCALE_CONFIG: SiteConfig["locale"] = {
  icpNumber: "",
  publicRegistration: "",
};

/**
 * 导出完整的默认站点配置
 */
export const SITE_CONFIG: SiteConfig = {
  siteMetadata: DEFAULT_SITE_METADATA,
  seo: DEFAULT_SEO_CONFIG,
  i18n: DEFAULT_I18N_CONFIG,
  content: DEFAULT_CONTENT_CONFIG,
  statistics: DEFAULT_STATISTICS_CONFIG,
  features: DEFAULT_FEATURES_CONFIG,
  navigation: DEFAULT_NAVIGATION_CONFIG,
  social: DEFAULT_SOCIAL_CONFIG,
  contact: DEFAULT_CONTACT_CONFIG,
  locale: DEFAULT_LOCALE_CONFIG,
};

/**
 * 导出默认环境配置
 */
export const ENV_CONFIG: EnvConfig = {
  MODE: 'development',
  public: {
    PUBLIC_SITE_URL: "http://localhost:4321",
    PUBLIC_BASE_URL: '/',
    PUBLIC_STAT_TRACKER_URL: '',
    PUBLIC_STAT_PARAMS: '',
    PUBLIC_LOCALE_ICP: ''
  },
  private: {}
};