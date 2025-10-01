import type {EnvConfig, SiteConfig} from "@config/types";
import createIntegrations, {type Integrations} from "./integrations.ts";
import createMarkdownPlugins, {type MarkdownPlugins} from "./markdown.ts";

export interface Plugins {
  integrations: Integrations
  markdown: MarkdownPlugins
}


export default function createPlugins(envConfig: EnvConfig, siteConfig: SiteConfig) {
  return {
    integrations: createIntegrations(envConfig, siteConfig),
    markdown: createMarkdownPlugins(envConfig, siteConfig),
  }
}
