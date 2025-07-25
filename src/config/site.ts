// Site configuration
export const siteConfig = {
  // Site details from config.json:site
  title: "全栈学徒实录", // from config.json:site.title
  prologue: "一个想要成为全栈开发工程师的喃喃自语", // from config.json:site.prologue
  // description is used from existing site.ts, will be updated by config.json:metadata.meta_description
  // url is removed, Astro.site will be used

  // from config.json:site (logo related)
  logo: "/logo.svg",
  logoWidth: "200",
  logoHeight: "30",
  logoText: "Bit Doze Astro Blog Theme",

  // SEO metadata from config.json:metadata
  author: "ZK-Jackie", // from config.json:metadata.meta_author
  description: "个人博客，记录关于全栈开发的技术学习和实践、放置个人学习笔记",
  ogImage: "/images/og-image.png", // from config.json:metadata.meta_image (replaces defaultImage)

  // Pagination settings for utilities (existing in site.ts)
  postsPerPage: 11,
  summaryLength: 100,
  
  // SEO settings (existing in site.ts)
  noindex: {
    tags: false, // Set to true to add noindex meta tag to tag pages
    categories: false, // Set to true to add noindex meta tag to category pages
    authors: false, // Set to true to add noindex meta tag to author pages
  },
  
  // Params from config.json:params
  icpNumber: "",
  publicRegistration: "",
  copyright: "© 2025 ZK-Jackie. All rights reserved."
};
