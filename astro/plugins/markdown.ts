import type {EnvConfig, SiteConfig} from "@config/types";
import remarkGemoji from "remark-gemoji";
import rehypeMermaid from "rehype-mermaid";
import type {RehypePlugins, RemarkPlugins} from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export interface MarkdownPlugins {
  remarkPlugins: RemarkPlugins
  rehypePlugins: RehypePlugins
}

export default function createMarkdownPlugins(envConfig: EnvConfig, siteConfig: SiteConfig): MarkdownPlugins {

  return {
    remarkPlugins: createRemarkPlugins(envConfig, siteConfig),
    rehypePlugins: createRehypePlugins(envConfig, siteConfig)
  }
}

export function createRemarkPlugins(_envConfig: EnvConfig, _siteConfig: SiteConfig): RemarkPlugins {
  return [remarkGemoji, remarkMath]
}

export function createRehypePlugins(_envConfig: EnvConfig, _siteConfig: SiteConfig): RehypePlugins {
  return [
    [rehypeMermaid, {dark: true, strategy: 'img-svg'}],
    [rehypeKatex, {output: 'mathml'}]
  ]
}
