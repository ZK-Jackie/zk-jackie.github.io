import type {EnvConfig, SiteConfig} from "@config/types";

const env: EnvConfig = {
  MODE: import.meta.env.MODE as "development" | "github" | "cloudflare" | "production",
  public: {
    PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL,
    PUBLIC_ANALYTICS_ENABLED: import.meta.env.PUBLIC_ANALYTICS === 'true',
    PUBLIC_ANALYTICS_ID: import.meta.env.PUBLIC_ANALYTICS_ID,
    PUBLIC_ANALYTICS_COLLECT_URL: import.meta.env.PUBLIC_ANALYTICS_COLLECT_URL,
    PUBLIC_BASE_URL: import.meta.env.BASE_URL || '/',
  },
  private: {}
};


export const config: SiteConfig = {
  // Basic site information
  site: {
    title: "全栈学徒实录",
    prologue: "一个努力成为全栈开发工程师的喃喃自语",
    description: "个人博客，记录关于全栈开发的技术学习和实践、放置个人学习笔记",
    author: "ZK-Jackie",
    logoType: "text",
    logo: "全栈学徒实录",
    logoSize: [200, 30],
    copyright: "© 2025 Jackie. All rights reserved.",
  },

  seo: {
    ogImage: "/images/og-image.png",
    noindex: ["**", "/tags/**", "/categories/**", "/authors/**", "/search/**", "/page/**"],
    robots: [
      {
        userAgent: "*",
        disallow: ["/"],
      }
    ]
  },

  // Content settings
  content: {
    postsPerPage: 11,
    summaryLength: 100,
    tocMaxDepth: 4,
  },

  // Features
  features: {
    rss: false,
    statistics: false,
    pageStatistics: true,
    siteStatistics: true,
    pageShare: ["email", "qrcode"],
  },

  // Navigation menu
  navigation: {
    main: [
      {
        name: "首页",
        url: "/",
      },
      {
        name: "合集",
        url: "/series",
      },
      {
        name: "文章",
        url: "/posts",
        hasChildren: true,
        children: [
          {
            name: "主题",
            url: "/categories",
          },
          {
            name: "标签",
            url: "/tags",
          },
          {
            name: "作者",
            url: "/authors",
          },
        ],
      },
      {
        name: "关于",
        url: "/about",
      },
      //   {
      //     name: "联系",
      //     url: "/contact",
      //   },
    ],
    footer: [
      {
        name: "首页",
        url: "/",
      },
      {
        name: "关于",
        url: "/about",
      },
    ],
  },

  // Social links
  social: {
    github: "https://github.com/ZK-Jackie",
    email: "mailto:jackiey101@foxmail.com",
  },

  // Contact information
  contact: {
    email: "jackiey101@foxmail.com",
    formAction: "#",
  },

  // Chinese specific
  locale: {
    icpNumber: ["production", "development"].includes(env.MODE) ? "粤ICP备2025457771号" : "",
    publicRegistration: "",
  },
};

// Export individual sections for easier access
export const siteConfig = config.site;
export const seoConfig = config.seo;
export const contentConfig = config.content;
export const navigationConfig = config.navigation;
export const socialConfig = config.social;
export const contactConfig = config.contact;
export const localeConfig = config.locale;
export const featuresConfig = config.features;
export const envConfig = env;

// Backward compatibility - export as siteConfig for existing code
export default config;
