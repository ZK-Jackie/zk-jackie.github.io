export const config = {
  // 全局配置
  global: {
    distPath: 'dist',
    verbose: true,
    // 全局忽略模式（使用 picomatch 语法）
    globalIgnorePatterns: [
      '**/_astro/**',
      '**/node_modules/**',
      '**/.git/**',
      '**/.*', // 隐藏文件
      '**/Thumbs.db',
      '**/.DS_Store',
    ]
  },

  // JavaScript 压缩配置
  javascript: {
    enabled: true,
    extensions: ['.js', '.mjs'],
    // 要忽略的文件/文件夹模式
    ignorePatterns: [
      '**/lib/**/*.js',    // 忽略 lib 目录下的 JS 文件
      '**/*.min.js',       // 忽略已压缩的文件
      '**/vendor/**',      // 忽略第三方库
      '**/tracker*.js',    // 忽略跟踪脚本
    ],
    // Terser 配置
    terserOptions: {
      format: {
        comments: false,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
    }
  },

  // HTML 压缩配置
  html: {
    enabled: true,
    extensions: ['.html'],
    ignorePatterns: [
      '**/temp/**',
      '**/*.template.html',
    ],
    // html-minifier-terser 配置
    minifierOptions: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      sortAttributes: true,
      sortClassName: true,
    }
  },

  // CSS 压缩配置
  css: {
    enabled: false, // Astro 通常已经优化了 CSS
    extensions: ['.css'],
    ignorePatterns: [
      '**/*.min.css',
    ],
    // 可以在这里添加 CSS 压缩选项
  },

  // 文件清理配置
  cleanup: {
    enabled: true,
    // 要删除的文件模式
    patterns: [
      '**/*.map',      // source maps
      '**/.DS_Store',  // macOS 文件
      '**/Thumbs.db',  // Windows 文件
      '**/desktop.ini', // Windows 文件
      '**/*.tmp',      // 临时文件
    ]
  },

  // Gzip 压缩配置
  gzip: {
    enabled: true,
    algorithm: 'gzip', // 'gzip' 或 'brotli'
    level: 9, // 压缩级别 1-9
    extensions: ['.js', '.css', '.html', '.xml', '.json', '.svg'],
    ignorePatterns: [
      '**/*.min.js',
      '**/*.min.css',
      '**/*.gz',
      '**/*.br',
      '**/lib/**', // 忽略 lib 目录
    ],
    // 最小文件大小阈值（字节）- 小于此大小的文件不压缩
    minSize: 1024,
  },

  // Brotli 压缩配置（可选）
  brotli: {
    enabled: false,
    algorithm: 'brotli',
    level: 11,
    extensions: ['.js', '.css', '.html', '.xml', '.json', '.svg'],
    ignorePatterns: [
      '**/*.min.js',
      '**/*.min.css',
      '**/*.gz',
      '**/*.br',
    ],
    minSize: 1024,
  },

  // 统计和报告配置
  reporting: {
    enabled: true,
    showFileDetails: true,
    showCompressionStats: true,
    formatBytes: true,
  }
}

// 环境特定的配置覆盖
function applyEnvironmentOverrides(baseConfig) {
  const env = process.env.NODE_ENV || 'development'
  const buildTarget = process.env.BUILD_TARGET || 'default'
  
  // 开发环境优化
  if (env === 'development') {
    return {
      ...baseConfig,
      global: {
        ...baseConfig.global,
        // verbose: false,
      },
      javascript: {
        ...baseConfig.javascript,
        terserOptions: {
          ...baseConfig.javascript.terserOptions,
          compress: {
            ...baseConfig.javascript.terserOptions.compress,
            // drop_console: false,
          },
          // mangle: false,
        }
      },
      html: {
        ...baseConfig.html,
        // enabled: false,
      },
      gzip: {
        ...baseConfig.gzip,
        // enabled: false,
      }
    }
  }
  
  // CDN 构建目标特殊处理
  if (buildTarget === 'cdn') {
    return {
      ...baseConfig,
      gzip: {
        ...baseConfig.gzip,
        level: 6, // CDN 环境使用中等压缩级别
        minSize: 2048, // 更大的阈值
      },
      brotli: {
        ...baseConfig.brotli,
        // enabled: true,
      }
    }
  }
  
  return baseConfig
}

// 导出最终配置
export default applyEnvironmentOverrides(config)