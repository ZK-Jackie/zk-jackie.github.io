// Type definitions for the configuration
export interface SiteConfig {
  // Basic site information
  site: {
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

  // Content settings
  content: {
    // Number of posts per page on listing pages
    postsPerPage: number;
    // Length of post summaries in characters
    summaryLength: number;
    // Maximum depth for table of contents in posts
    tocMaxDepth: number;
  };

  // Features
  features: {
    // Enable RSS feed generation
    rss: boolean;
    // Enable site statistics, CounterScale script will be added
    statistics: boolean;
    // Page statistics wound be seen in the head of blog posts, if this and `statistics` are enabled
    pageStatistics: boolean;
    // Site statistics will be seen in the footer, if this and `statistics` are enabled
    siteStatistics: boolean;
    // Page share options, e.g., ["email", "qrcode"]
    pageShare: string[];
  };

  // Navigation menu
  navigation: {
    // Navigation items for the main menu and footer menu
    main: NavigationMenuItem[];
    // Navigation items for the quick access menu in the footer
    footer?: NavigationMenuItem[];
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

export interface NavigationItem {
  name: string;
  url: string;
}

// 使用联合类型来表达约束关系
export type NavigationMenuItem = NavigationItem & (
  | {
      hasChildren: true;
      children: NavigationMenuItem[]; // 当 hasChildren 为 true 时，children 必须存在且不为空
    }
  | {
      hasChildren?: false; // hasChildren 为 false 或 undefined
      children?: never;    // children 不能存在
    }
);

// Environment variables schema
export interface EnvConfig {
  // Build-time variables
  MODE: 'development' | 'github' | 'cloudflare' | 'production'; // Build mode

  public: PublicEnvConfig; // Public environment variables, exposed to the client
  private: PrivateEnvConfig; // Private environment variables, not exposed to the client
  cloudflare?: CloudflareEnvConfig; // Optional Cloudflare specific environment variables
}

export interface PublicEnvConfig {
  PUBLIC_SITE_URL: string;
  PUBLIC_ANALYTICS_ENABLED?: boolean; // Enable analytics if set to "true"
  PUBLIC_ANALYTICS_ID?: string;
  PUBLIC_ANALYTICS_COLLECT_URL?: string; // URL for analytics collection
  PUBLIC_BASE_URL: string; // Base URL for the site, used in routing
}

export interface PrivateEnvConfig {
}

export interface CloudflareEnvConfig {
  // Add Cloudflare specific environment variables here if needed
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