<h1>
    <div align="center">Stack Explorer</div>
</h1>

<div align="center">

![Astro](https://img.shields.io/badge/Astro-5.13.10-FF5D01?style=flat-square&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.7-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**基于 Astro 的个人博客前端项目**

[🌟 特性](#-核心特性) • [🚀 快速开始](#-快速开始) • [📁 项目结构](#-项目结构)

</div>

---

## 📖 项目简介

Stack Explorer 是一个基于 [Astro](https://astro.build/) 框架精心构建的现代化博客前端解决方案。项目采用 **零 JavaScript 优先
** 的设计理念，结合 TypeScript、TailwindCSS 等现代技术栈，为个人开发者和技术团队提供高性能、易维护、功能丰富的博客建站方案。

### 🎯 设计理念

- **性能优先**：基于 Astro 的静态生成，实现极致的加载速度
- **开发友好**：完整的 TypeScript 支持，清晰的项目结构
- **内容驱动**：支持 Markdown/MDX，专注于内容创作体验
- **可扩展性**：模块化设计，支持自定义插件和主题

## ✨ 核心特性

### 📝 内容管理

- **Markdown/MDX 支持**：原生支持 Markdown 和 MDX 格式
- **代码高亮**：基于 Expressive Code 的强大代码展示
- **数学公式**：支持 LaTeX 数学公式渲染
- **Mermaid 图表**：内置图表和流程图支持
- **阅读时间计算**：自动计算文章预估阅读时间

### 🎨 主题与样式

- **TailwindCSS 4.x**：最新版本的原子化 CSS 框架
- **响应式设计**：完美适配桌面端和移动端
- **暗色模式**：优雅的明暗主题切换
- **自定义配置**：通过配置文件轻松定制站点风格

### 🔍 SEO 与优化

- **SEO 友好**：自动生成元数据、Open Graph 标签
- **RSS 订阅**：自动生成 RSS 源
- **Sitemap**：自动生成站点地图
- **图像优化**：智能图像压缩和格式转换

### 🔧 集中配置

- **环境变量支持**：多环境配置，轻松切换开发、生产环境
- **单一配置文件**：所有站点设置集中管理
- **内容集合**：通过 Astro 内容集合 API 管理不同类型的内容

## 🛠️ 技术栈

### 核心框架

| 技术                                            | 说明                      |
|-----------------------------------------------|-------------------------|
| [Astro](https://astro.build/)                 | 现代化的 Web 框架，支持多框架集成     |
| [TypeScript](https://www.typescriptlang.org/) | JavaScript 的超集，提供类型安全保障 |
| [TailwindCSS](https://tailwindcss.com/)       | 功能优先的 CSS 框架            |

### 内容处理

| 库                                                                          | 说明                         |
|----------------------------------------------------------------------------|----------------------------|
| [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) | MDX 支持，Markdown + React 组件 |
| [astro-expressive-code](https://expressive-code.com/)                      | 高级代码语法高亮和展示                |
| [rehype-mermaid](https://github.com/remcohaszing/rehype-mermaid)           | Mermaid 图表渲染支持             |
| [remark-gemoji](https://github.com/remarkjs/remark-gemoji)                 | GitHub 风格 emoji 支持         |

### SEO 和分析

| 库                                                                                  | 说明        |
|------------------------------------------------------------------------------------|-----------|
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/)                            | RSS 订阅源生成 |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | 站点地图自动生成  |

### 工具库

| 库                                                       | 说明     |
|---------------------------------------------------------|--------|
| [fuse.js](https://fusejs.io/)                           | 模糊搜索引擎 |
| [reading-time](https://github.com/ngryman/reading-time) | 阅读时间计算 |
| [astro-icon](https://github.com/natemoo-re/astro-icon)  | 图标组件库  |

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 20 LST
- **包管理器**: npm、yarn 或 pnpm
- **操作系统**: Windows、macOS、Linux

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd code-explorer
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run dev
```

开发服务器将在 `http://localhost:4321` 启动

4. **构建项目**

```bash
# 构建用于 GitHub Pages
npm run build

# 构建用于 Cloudflare Pages
npm run build:cf

# 开发环境构建
npm run build:dev
```

5. **预览构建结果**

```bash
npm run preview
```

### 可用脚本

| 命令                     | 说明                       |
|------------------------|--------------------------|
| `npm run dev`          | 启动开发服务器（开发模式）            |
| `npm run build:gh`     | 构建生产版本（GitHub Pages）     |
| `npm run build:cf`     | 构建生产版本（Cloudflare Pages） |
| `npm run build:prod`   | 构建生产版本（私有云服务器）           |
| `npm run build:dev`    | 构建开发版本                   |
| `npm run preview`      | 预览构建结果                   |
| `npm run check`        | 检查 Astro 项目              |
| `npm run sync`         | 同步内容集合类型                 |
| `npm run update-astro` | 更新 Astro 及其依赖            |

## 📁 项目结构

```text
code-explorer/
├── 📄 astro.config.mts          # Astro 框架配置文件
├── ...
├── 📂 public/                   # 静态资源目录
├── 📂 src/                      # 源代码目录
│   ├── 📄 content.config.ts     # 内容集合配置
│   ├── 📄 site.config.ts        # 站点全局配置
│   ├── 📂 layouts/              # 页面布局组件
│   ├── 📂 pages/                # 页面路由文件
│   ├── 📂 plugins/              # 自定义插件
│   ├── 📂 styles/               # 样式文件
│   └── 📂 utils/                # 工具函数库
├── 📂 content/                  # 博客内容目录
│   └── 📂 blog/                 # 博客文章和页面
│       ├── 📂 posts/            # 文章内容 (.md/.mdx)
│       ├── 📂 authors/          # 作者信息
│       ├── 📂 pages/            # 独立页面
│       └── 📂 covers/           # 文章封面配置
├── 📂 docs/                     # 项目文档
└── 📂 scripts/                  # 构建和部署脚本
    ├── 📄 postbuild.js          # 构建后处理脚本
    └── ...
```

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

感谢以下项目：

- [Astro](https://astro.build/) - 现代化的 Web 框架
- [bitdoze-astro-theme](https://github.com/bitdoze/bitdoze-astro-theme) - Astro 主题模板


