// i18n configuration
export const languages = {
  zh: '中文',
  en: 'English',
};

export const defaultLang = 'zh';

export const ui = {
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.blog': '文章',
    'nav.about': '关于',
    'nav.contact': '联系',
    
    // Blog
    'blog.title': '文章',
    'blog.description': '技术文章、学习笔记',
    'blog.list': '文章列表',
    'blog.page': '第{page}页',
    'blog.pageOf': '第 {current} 页，共 {total} 页',
    'blog.readMore': '阅读更多',
    'blog.noArticles': '暂无文章',
    
    // Pagination
    'pagination.previous': '上一页',
    'pagination.next': '下一页',
    'pagination.first': '首页',
    'pagination.last': '末页',
    'pagination.pageInfo': '第 {current} 页，共 {total} 页',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.backToTop': '回到顶部',
    
    // SEO
    'seo.blog.page.title': '文章列表 - 第{page}页',
    'seo.blog.page.description': '查看更多文章和教程内容 - 第{page}页',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Blog
    'blog.title': 'Blog',
    'blog.description': 'Articles, tutorials, and insights',
    'blog.list': 'Article List',
    'blog.page': 'Page {page}',
    'blog.pageOf': 'Page {current} of {total}',
    'blog.readMore': 'Read More',
    'blog.noArticles': 'No articles found',
    
    // Pagination
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'pagination.first': 'First',
    'pagination.last': 'Last',
    'pagination.pageInfo': 'Page {current} of {total}',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error occurred',
    'common.backToTop': 'Back to Top',
    
    // SEO
    'seo.blog.page.title': 'Articles - Page {page}',
    'seo.blog.page.description': 'Explore more articles and tutorials - Page {page}',
  },
} as const;
