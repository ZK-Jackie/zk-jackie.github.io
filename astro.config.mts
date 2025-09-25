import {defineConfig} from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import remarkGemoji from "remark-gemoji";
import { loadEnv } from "vite";
import type {PublicEnvConfig} from "@config/types";
import astroExpressiveCode from 'astro-expressive-code';
import rehypeMermaid from "rehype-mermaid";

/**
 * 配置项：https://docs.astro.build/zh-cn/reference/configuration-reference/
 * 环境变量：https://docs.astro.build/zh-cn/guides/environment-variables/
 */
const publicConfig = loadEnv(import.meta.env.MODE as string, process.cwd(), "PUBLIC_") as unknown as PublicEnvConfig;

export default defineConfig({
  site: publicConfig.PUBLIC_SITE_URL,
  base: publicConfig.PUBLIC_BASE_URL,
  trailingSlash: 'never',
  markdown: {
    gfm: true,
    remarkPlugins: [
      remarkGemoji
    ],
    rehypePlugins: [
      [rehypeMermaid, {dark: true, strategy: 'img-svg'}]
    ]
  },
  // Configure Astro integrations
  integrations: [
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
    }),
    mdx(),  // expressiveCode must go before mdx
    icon(),
    /*sitemap(),*/
  ],
  vite: {
    plugins: [
      tailwindcss()
    ],
    server: {
      fs: {
        allow: [
          '.',
          '../content'
        ],
      },
    },
  }
});