import { defineCollection, z } from "astro:content";
import { enhancedGlob } from "@plugins/enhanced-glob-loader";
import { postsProcessors, defaultProcessors } from "@plugins/glob-processors";


/**
 * 1. 若需要自定义 slug，只需在 frontmatter 中添加 slug 字段即可，`id` 字段会随之改变
 * https://docs.astro.build/zh-cn/guides/content-collections/#%E5%AE%9A%E4%B9%89%E8%87%AA%E5%AE%9A%E4%B9%89-id
 */
// Post collection schema
const postsCollection = defineCollection({
  loader: enhancedGlob({
    pattern: '**\/[^_]*.(mdx|md)',
    base: './content/blog/posts',
    processors: postsProcessors,
    enableFileStats: true
  }),
  schema: ({image}) =>
    z.object({
      // 确定的页面 slug，若 frontmatter 中有 slug，则基于用户提供的 slug 生成，否则基于文件路径生成，不能被修改
      id: z.string().optional(),
      // 用户提供的 slug，不能以“/”开头，允许自定义
      slug: z.string().optional(),
      // 文章标题
      title: z.string(),
      // SEO 标题，允许自定义
      subtitle: z.string().optional(),
      // 摘要，用于 SEO 和文章列表，允许自定义
      description: z.string().optional(),
      // 文章创建时间，允许自定义
      createTime: z.date().optional(),
      // 文章封面图，允许自定义
      image: image().optional(),
      // 文章封面图的替代文本，允许自定义
      authors: z.array(z.string()).optional().default(["admin"]),
      // 文章分类，允许自定义，至少一个
      categories: z.array(z.string()).optional().default(["其他"]),
      // 文章标签，允许自定义，至少一个
      tags: z.array(z.string()).optional().default(["其他"]),
      // 文章系列，第一个元素为系列名称，第二个元素为序号，允许自定义
      series: z.tuple([z.string(), z.string()]).optional(),
      // 文章原始链接，允许自定义
      canonical: z.string().url().optional(),
      // 是否为草稿，默认 false，草稿将不会出现在文章列表中且不会被生成页面
      draft: z.boolean().optional().default(false),

      /** 增强字段 **/
      // 文章的发布时间，自动获取，允许自定义
      publishTime: z.date().optional(),
      // 文章的最后修改时间，自动获取，允许自定义
      updateTime: z.date().optional(),
      // 阅读耗时，单位分钟
      readingCost: z.number().optional(),
      // 文章字数
      wordCount: z.number().optional(),
      // 文章内容摘要，允许自定义
      excerpt: z.string().optional(),
      // 绝对路径，若windows，类似于 /D:/xxx/xxx/xx.md；若macOS/Linux，类似于 /Users/xxx/xxx/xx.md，请勿修改
      filePath: z.string().optional(),
      // 完整文件名称，类似于 xx.mdx，请勿修改
      fullFileName: z.string().optional(),
      // 文件名称，类似于 xx，请勿修改
      fileName: z.string().optional(),
      // 文件大小，单位字节，请勿修改
      fileSize: z.number().optional(),
    }),
});

// Author collection schema
const authorsCollection = defineCollection({
  loader: enhancedGlob({
    pattern: '**\/[^_]*.(mdx|md)',
    base: './content/blog/authors',
    processors: defaultProcessors
  }),
  schema: z.object({
    // 确定的页面 slug
    id: z.string().optional(),
    // 用户提供的 slug，不能以“/”开头
    slug: z.string().optional(),
    // 作者名称
    title: z.string(),
    // SEO 标题
    subtitle: z.string().optional(),
    // 头像
    image: z.string().optional(),
    // 摘要
    description: z.string().optional(),
    // 社交链接
    social: z
      .object({
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        instagram: z.string().optional(),
      })
      .optional(),
    // 创建时间
    createTime: z.date().optional(),
    // 是否为草稿
    draft: z.boolean().optional().default(false),
    /** 增强字段**/
    // 文章的发布时间，自动获取，允许自定义
    publishTime: z.date().optional(),
    // 文章的最后修改时间，自动获取，允许自定义
    updateTime: z.date().optional(),
    // 阅读耗时，单位分钟
    readingCost: z.number().optional(),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  loader: enhancedGlob({
    pattern: '**\/[^_]*.(mdx|md)',
    base: './content/blog/pages',
    processors: defaultProcessors
  }),
  schema: z.object({
    // 确定的页面 slug
    id: z.string().optional(),
    // 文章标题
    title: z.string(),
    // SEO 标题
    subtitle: z.string().optional(),
    // 摘要
    description: z.string().optional(),
    // 文章封面图
    image: z.string().optional(),
    // 创建时间
    createTime: z.date().optional(),
    // 是否为草稿
    draft: z.boolean().optional().default(false),
    /** 增强字段**/
    // 文章的发布时间，自动获取
    publishTime: z.date().optional(),
    // 文章的最后修改时间，自动获取
    updateTime: z.date().optional(),
    // 阅读耗时，单位分钟
    readingCost: z.number().optional(),
  }),
});

// About collection schema
const aboutCollection = defineCollection({
  loader: enhancedGlob({
    pattern: '**\/[^_]*.(mdx|md)',
    base: './content/blog/about',
    processors: defaultProcessors
  }),
  schema: ({image}) =>
    z.object({
      // 页面标题
      title: z.string(),
      // 摘要
      description: z.string().optional(),
      // 头像
      image: image().optional(),
      // 创建时间
      createTime: z.date().optional(),
      // 个人介绍
      what_i_do: z.object({
        title: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional()
          })
        )
      }),
      /** 增强字段**/
      // 文章的发布时间，自动获取，允许自定义
      publishTime: z.date().optional(),
      // 文章的最后修改时间，自动获取，允许自定义
      updateTime: z.date().optional(),
      // 阅读耗时，单位分钟
      readingCost: z.number().optional(),
    }),
});

// Taxonomy collection schema
const taxonomyCollection = defineCollection({
  loader: enhancedGlob({
    pattern: '*.json',
    base: './content/blog/taxonomy',
    processors: []
  }),
  schema: z.object({
    // 配置标题
    title: z.string(),
    // 配置描述
    description: z.string().optional(),
    // 分类法类型
    type: z.enum(['tags', 'categories', 'authors']),
    // 映射项目
    items: z.array(
      z.object({
        // 原始键值（frontmatter中使用的）
        key: z.string(),
        // URL slug（英文路径段）
        slug: z.string(),
        // 多语言标签
        labels: z.object({
          zh: z.string(),
          en: z.string()
        }),
        // 可选描述
        description: z.object({
          zh: z.string().optional(),
          en: z.string().optional()
        }).optional()
      })
    )
  })
});


// Export collections
export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
  authors: authorsCollection,
  about: aboutCollection,
  taxonomy: taxonomyCollection
};
