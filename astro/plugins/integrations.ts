import type {EnvConfig, SiteConfig} from '@config/types';
import type {AstroIntegration} from "astro";
import mdx from "@astrojs/mdx";
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import astroExpressiveCode from "astro-expressive-code";
import {pluginLineNumbers} from "@expressive-code/plugin-line-numbers";

export interface Integrations {
  integrations: AstroIntegration[]
}


export default function createIntegrations(envConfig: EnvConfig, siteConfig: SiteConfig): AstroIntegration[] {
  const integrations = []
  integrations.push(...createMarkdownIntegrations(envConfig, siteConfig))
  integrations.push(icon())
  integrations.push(...createSitemapIntegrations(envConfig, siteConfig))

  return integrations
}

export function createMarkdownIntegrations(_envConfig: EnvConfig, _siteConfig: SiteConfig): AstroIntegration[] {
  return [
    astroExpressiveCode({
      frames: {
        showCopyToClipboardButton: true,
      },
      // 默认值为 true，但由于代码优化，true 或 false 都可以实现相同的效果
      useDarkModeMediaQuery: false,
      // 默认值为 ['github-light', 'github-dark']
      // themes: ['github-light', 'github-dark'],
      // 默认会从页面的 <html> 元素中读取 data-theme 属性来确定主题，https://expressive-code.com/reference/configuration/#themecssselector
      // themeCssSelector: (theme) => `[data-theme="${theme.name}"]`
      plugins: [pluginLineNumbers()]
    }),
    // expressiveCode must go before mdx
    mdx(),
  ]
}

export function createSitemapIntegrations(envConfig: EnvConfig, _siteConfig: SiteConfig): AstroIntegration[] {
  if (envConfig.public.PUBLIC_SITEMAP_ENABLED) {
    return [sitemap()]
  }
  return []
}
