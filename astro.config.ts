import {defineConfig} from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import remarkGemoji from "remark-gemoji";
import { loadEnv } from "vite";
import type {PublicEnvConfig} from "@config/types.ts";
import astroExpressiveCode from 'astro-expressive-code';

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
    remarkPlugins: [remarkGemoji]
  },
  vite: {
    plugins: [
      tailwindcss()
    ],
    server: {
      fs: {
        allow: [
          // Allow the project root (default)
          '.',
        ],
      },
    },
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
    }), mdx(), icon(),  // expressiveCode must be before mdx
    /*sitemap(),*/
  ]
});

/**
 * 根据测试结果，当 .env 文件中的配置项留空时，import.meta.env 读取到的值情况如下：
 *
 * 1. 等号后面留空的情况（如 PUBLIC_ANALYTICS_ID=）
 * 值: "" (空字符串)
 * 类型: string
 * 真值: false
 * 长度: 0
 *
 * 2. 没有等号的情况（如 PUBLIC_UNDEFINED_TEST）
 * 值: undefined
 * 类型: undefined
 * 真值: false
 * 
 * 关键点总结：
 * 有等号但值为空：返回空字符串 ""，类型为 string
 * 没有等号：返回 undefined，类型为 undefined
 * 两种情况的真值检查都是 false
 * 可以通过检查类型来区分：
 * typeof env === 'string' 表示有等号但值为空
 * typeof env === 'undefined' 表示完全未定义
 */