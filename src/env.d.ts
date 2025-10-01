/// <reference types="vite/client" />
/// <reference types="astro/client" />

// Parsed public environment variables, must start with `PUBLIC_`
interface ImportMetaEnv {
  // Base URL for the site, used in sitemap and SEO
  readonly PUBLIC_SITE_URL: string;
  // Base URL for the site, used in routing
  readonly PUBLIC_BASE_URL: string;
  // Traker script url, could be script from `public` folder or external url
  readonly PUBLIC_STAT_TRACKER_URL?: string;
  // JSON string of the configuration parameters for the provider
  readonly PUBLIC_STAT_PARAMS?: string;
  // ICP registration number for Chinese sites
  readonly PUBLIC_LOCALE_ICP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


declare namespace App {
  interface Locals {
    lang: string;
  }
}

type RuntimeMode = "development" | "github" | "cloudflare" | "production"