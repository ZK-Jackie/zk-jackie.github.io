import type { ModeConfig, RuntimeMode } from "@config/types";
import { SITE_CONFIG as devSiteConfig } from "./development";
import { SITE_CONFIG as prodSiteConfig } from "./production";
import { SITE_CONFIG as ghSiteConfig } from "./github";
import { SITE_CONFIG as cfSiteConfig } from "./cloudflare";


export const modeConfigs: Record<RuntimeMode, ModeConfig> = {
  development: {
    env: {},
    site: devSiteConfig
  },
  github: {
    env: {},
    site: ghSiteConfig
  },
  cloudflare: {
    env: {},
    site: cfSiteConfig
  },
  production: {
    env: {},
    site: prodSiteConfig
  }
}