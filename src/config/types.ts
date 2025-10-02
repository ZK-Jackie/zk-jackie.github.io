// 运行时模式类型定义
export type RuntimeMode = "development" | "github" | "cloudflare" | "production";

// 配置上下文接口，用于传递给配置函数
export interface ConfigContext {
  envConfig: EnvConfig;
  mode: RuntimeMode;
}

// 配置函数类型，接收配置上下文并返回配置值
export type ConfigFunction<T> = (context: ConfigContext) => T;

// 递归配置类型，允许配置项是值或函数
export type ConfigValue<T> = T extends object
  ? T extends any[]
    ? T | ConfigFunction<T>  // 数组类型
    : { [K in keyof T]: ConfigValue<T[K]> } | ConfigFunction<T>  // 对象类型
  : T | ConfigFunction<T>;  // 基本类型

// 模式配置接口
export interface ModeConfig {
  env: DeepPartial<EnvConfig>;
  site: DeepPartial<ConfigValue<SiteConfig>>;
}

export interface SiteConfig {
  // Basic site information
  siteMetadata: {
    // site name, used in seo
    title: string;
    // site prologue or tagline
    prologue: string;
    // site description, used in meta description
    description: string;
    // site author
    author: string;
    // logo type
    logoType?: 'text' | 'image';
    // artistic logo image's URL or text
    logo: string;
    // logo size [width, height], used for `image` logos, unit is "px"
    logoSize?: [number, number];
    // copyright information, e.g., "© 2025 Your Name. All rights reserved."
    copyright: string;
  };

  // SEO settings
  seo: {
    // Pages or patterns to exclude from indexing, ["**"] for not indexing all pages
    noindex: Array<string>;
    // Open Graph image URL for social sharing
    ogImage: string;
    // Robots.txt configuration, array of rules for different user agents
    robots: RobotsRules[];
  };

  // i18n settings
  i18n: {
    // Default locale, e.g., `"en"`
    defaultLocale: string;
    // Supported locales, e.g., `["en", "zh"]`
    locales: string[];
    // Show default locale in URL, e.g., default locale is `en`, `true` for `example.com/en/`, `false` for `example.com/`
    showDefaultLang: boolean;
  }

  // Content settings
  content: {
    // Number of posts per page on listing pages
    postsPerPage: number;
    // Length of post summaries in characters
    summaryLength: number;
    // Maximum depth for table of contents in posts
    tocMaxDepth: number;
  };

  // Website Statistics settings
  statistics: {
    // Provider name, e.g., "CounterScale"
    provider?: 'umami' | 'counterscale' | 'none';
    // Is the statistics enabled
    enabled: boolean;
    // Traker script url, could be script from `public` folder or external url
    trackerUrl?: string;
    // JSON string of the configuration parameters for the provider
    parameters?: string;

    // Enable page views tracking and display
    pageViewsEnabled?: boolean;
    // Enable site visitors tracking and display
    siteViewsEnabled?: boolean;
  };

  // Features
  features: {
    // Enable RSS feed generation
    rss: boolean;
    // Page share options, e.g., ["email", "qrcode"]
    pageShare: string[];
    // Enable sitemap generation
    sitemap: boolean;
  };

  // Navigation menu
  navigation: {
    // Navigation items for the main menu and footer menu
    main: NavigationItem[];
    // Navigation items for the quick access menu in the footer
    footer?: NavigationItem[];
  };

  // Social links
  social: SocialLinks

  // Contact information
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    formAction?: string;
  };

  // Locale settings
  locale: {
    icpNumber?: string;
    publicRegistration?: string;
  };
}

// Navigation menu item, supports nested children for one level of submenu only
export interface NavigationItem {
  name: string;
  url?: string;
  children?: NavigationItem[];
}

// Environment variables schema
export interface EnvConfig {
  // Build-time variables
  MODE: 'development' | 'github' | 'cloudflare' | 'production'; // Build mode

  public: PublicEnvConfig; // Public environment variables, exposed to the client
  private: PrivateEnvConfig; // Private environment variables, not exposed to the client
  cloudflare?: CloudflareEnvConfig; // Optional Cloudflare specific environment variables
}

// Parsed public environment variables, must start with `PUBLIC_`
export type PublicEnvConfig = {
  [K in keyof ImportMetaEnv as K extends `PUBLIC_${string}` ? K : never]: ImportMetaEnv[K];
}


export interface PrivateEnvConfig {
}

export interface CloudflareEnvConfig {
}


export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  github?: string;
  gitlab?: string;
  medium?: string;
  codepen?: string;
  bitbucket?: string;
  dribbble?: string;
  behance?: string;
  pinterest?: string;
  soundcloud?: string;
  tumblr?: string;
  reddit?: string;
  vk?: string;
  whatsapp?: string;
  snapchat?: string;
  vimeo?: string;
  tiktok?: string;
  foursquare?: string;
  rss?: string;
  email?: string;
  phone?: string;
  address?: string;
  skype?: string;
  website?: string;
  wechatOfficial?: string; // WeChat Official Account
}

export interface RobotsRules {
  // e.g., "Googlebot", "*"
  userAgent: string;
  // e.g., ["/"]
  allow?: string[];
  // e.g., ["/admin", "/private"]
  disallow?: string[];
  // e.g., 10 (in seconds)
  crawlDelay?: number;
  // e.g., "https://example.com/sitemap.xml"
  sitemap?: string;
}

// 工具类型：递归的可选类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};