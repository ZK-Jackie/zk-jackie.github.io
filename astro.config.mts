import { loadEnv } from "vite";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import createPlugins from "./astro/plugins";
import { initConfig } from "./src/config";
import { runtimeMode } from "./src/utils/cliUtils";


/**
 * 配置项：https://docs.astro.build/zh-cn/reference/configuration-reference/
 * 环境变量：https://docs.astro.build/zh-cn/guides/environment-variables/
 * Vite env 配置：https://cn.vite.dev/guide/env-and-mode.html
 */
const metaEnv = loadEnv(runtimeMode, process.cwd(), "PUBLIC_") as ImportMetaEnv
const {env: envConfig, site: siteConfig} = initConfig(runtimeMode, metaEnv)
const plugins = createPlugins(envConfig, siteConfig)

export default defineConfig({
  site: envConfig.public.PUBLIC_SITE_URL,
  base: envConfig.public.PUBLIC_BASE_URL,
  trailingSlash: 'never',
  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: "manual"
  },
  markdown: {
    gfm: true,
    remarkPlugins: plugins.markdown.remarkPlugins,
    rehypePlugins: plugins.markdown.rehypePlugins,
  },
  integrations: [plugins.integrations],
  vite: {
    plugins: [
      tailwindcss()
    ],
    server: {
      fs: {
        allow: ['.']
      },
    },
  }
});