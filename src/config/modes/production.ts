import type { SiteConfig, ConfigValue } from "@config/types";
import { fromEnvConfig } from "./utils.ts";


export const SITE_CONFIG: DeepPartial<ConfigValue<SiteConfig>> = {
  locale: {
    icpNumber: fromEnvConfig("PUBLIC_LOCALE_ICP", "")
  }
};