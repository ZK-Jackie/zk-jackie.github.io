# 博客文章目录

## 如何部署？

1. 使用 git submodule 挂载文章仓库到此处，命名为 `blog` 目录

在本目录下，执行以下命令：

```bash
git submodule add <文章仓库地址> blog
```


2. 检查 `blog` 目录下的文件结构

确保 `blog` 目录下包含文章的 Markdown 文件和相关资源。应当包含以下内容：

```
blog/
├── about/                  # 关于页面
│   └── index.md
├── authors/                # 作者信息
│   ├── author1.md
│   └── ...
├── pages/                  # 静态页面
│   ├── license.md
│   ├── privacy.md
│   ├── terms.md
│   └── ...
├── posts/                  # 博客文章
│   ├── first-post.md
│   └── ...      
└── taxnonmy/               # 页面分类、标签的 slug、i18n 等信息
    ├── authors.json
    ├── categories.json
    └── tags.json
```


3. 随后，项目和文章内容可以分别独立管理和更新。


## 注意事项

- 确保在更新子模块时，使用 `git submodule update --remote --merge` 命令以获取最新的文章内容。
- GitHub Actions 中自动化部署时，需要编辑好 actions/checkout 的参数，添加上下面两项：
```yaml
  with:
    ...
    submodules: recursive
    token: ${{ secrets.BLOG_PULL_PAT }}
```
