import type { ConfigValue, DeepPartial, SiteConfig } from "@config/types";
import { fromEnvConfig } from "./utils.ts";


export const SITE_CONFIG: DeepPartial<ConfigValue<SiteConfig>> = {
  statistics: {
    provider: "umami",
    enabled: true,
    trackerUrl: "/lib/umami.tracker.min.js",
    parameters: fromEnvConfig("PUBLIC_STAT_PARAMS"),
    pageViewsEnabled: false,
    siteViewsEnabled: false
  }
};