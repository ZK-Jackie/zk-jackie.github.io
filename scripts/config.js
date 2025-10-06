import { target } from "./cli.js";

export const config = {
  // Global configuration
  global: {
    basePath: process.cwd(),
    distPath: 'dist',
    verbose: true,
    // Global ignore patterns (using picomatch syntax)
    globalIgnorePatterns: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.*', // Hidden files
      '**/Thumbs.db',
      '**/.DS_Store',
    ]
  },

  // JavaScript compression configuration
  javascript: {
    enabled: true,
    path: 'dist',
    extensions: ['.js', '.mjs'],
    // File/folder patterns to ignore
    ignorePatterns: [
      '**/_astro/**',
      '**/lib/**/*.js',    // Ignore JS files in lib directory
      '**/*.min.js',       // Ignore already minified files
      '**/vendor/**',      // Ignore third-party libraries
      '**/tracker*.js',    // Ignore tracking scripts
    ],
    // Terser configuration
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

  // HTML compression configuration
  html: {
    enabled: true,
    path: 'dist',
    extensions: ['.html'],
    ignorePatterns: [
      '**/_astro/**',
      '**/temp/**',
      '**/*.template.html',
    ],
    // html-minifier-terser configuration
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

  // CSS compression configuration
  css: {
    enabled: false, // CSS is usually already optimized by Astro
    path: 'dist',
    extensions: ['.css'],
    ignorePatterns: [
      '**/_astro/**',
      '**/*.min.css',
    ],
    // CSS compression options can be added here
  },

  // File cleanup configuration
  cleanup: {
    enabled: true,
    path: 'dist',
    // Concurrency control (number of files to delete simultaneously)
    concurrency: 10,
    // Whether to remove empty directories
    removeEmptyDirs: true,
    // File patterns to delete
    patterns: [
      '**/*.map',      // source maps
      '**/.DS_Store',  // macOS files
      '**/Thumbs.db',  // Windows files
      '**/desktop.ini', // Windows files
      '**/*.tmp',      // temporary files
    ]
  },

  // Gzip compression configuration
  gzip: {
    enabled: true,
    path: 'dist',
    algorithm: 'gzip', // 'gzip' or 'brotli'
    level: 9, // Compression level 1-9
    extensions: ['.js', '.css', '.html', '.xml', '.json', '.svg'],
    ignorePatterns: [
      '**/_astro/**',
      '**/*.min.js',
      '**/*.min.css',
      '**/*.gz',
      '**/*.br',
      '**/lib/**', // Ignore lib directory
    ],
    // Minimum file size threshold (bytes) - files smaller than this won't be compressed
    minSize: 1024,
  },

  // Brotli compression configuration (optional)
  brotli: {
    enabled: false,
    path: 'dist',
    algorithm: 'brotli',
    level: 11,
    extensions: ['.js', '.css', '.html', '.xml', '.json', '.svg'],
    ignorePatterns: [
      '**/_astro/**',
      '**/*.min.js',
      '**/*.min.css',
      '**/*.gz',
      '**/*.br',
    ],
    minSize: 1024,
  },

  // Statistics and reporting configuration
  reporting: {
    enabled: true,
    showFileDetails: true,
    showCompressionStats: true,
    formatBytes: true,
  }
}

// Environment-specific configuration overrides
function applyEnvironmentOverrides(baseConfig) {
  const buildTarget = target
  let finalConfig;

  if (buildTarget === 'cleanup') {
    finalConfig = {
      global: {
        ...baseConfig.global,
        // verbose: false
      },
      cleanup: {
        enabled: true,
        path: process.cwd(),
        concurrency: 20, // Use higher concurrency in cleanup mode
        removeEmptyDirs: true,
        // File patterns to delete
        patterns: [
          '.astro/**',
          'dist/**'
        ]
      },
    }
  } else if (buildTarget === 'compression') {
    // Development environment optimization
    finalConfig = {
      ...baseConfig
    }
  }

  return {
    target: buildTarget,
    ...finalConfig
  }
}

// Export final configuration
export default applyEnvironmentOverrides(config)