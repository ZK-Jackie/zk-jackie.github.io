import path from 'path'
import config from './postbuild.config.js'
import FileFilter from './lib/file-filter.js'
import JavaScriptProcessor from './lib/javascript-processor.js'
import HTMLProcessor from './lib/html-processor.js'
import CleanupProcessor from './lib/cleanup-processor.js'
import CompressionProcessor from './lib/compression-processor.js'
import ReportProcessor from './lib/report-processor.js'

/**
 * 主要的构建后优化函数
 */
async function optimizeDist() {
  const cwd = process.cwd()
  const distPath = path.resolve(cwd, config.global.distPath)

  console.log('🚀 开始构建后优化...')
  console.log(`📁 目标目录: ${distPath}`)

  try {
    // 初始化文件过滤器和报告处理器
    const fileFilter = new FileFilter(config.global.globalIgnorePatterns)
    const reportProcessor = new ReportProcessor(config.reporting)

    // 1. JavaScript 压缩
    if (config.javascript.enabled) {
      const jsProcessor = new JavaScriptProcessor(
        { ...config.javascript, verbose: config.global.verbose }, 
        fileFilter
      )
      const jsStats = await jsProcessor.process(distPath)
      reportProcessor.addStats('javascript', jsStats)
    }

    // 2. HTML 压缩
    if (config.html.enabled) {
      const htmlProcessor = new HTMLProcessor(
        { ...config.html, verbose: config.global.verbose }, 
        fileFilter
      )
      const htmlStats = await htmlProcessor.process(distPath)
      reportProcessor.addStats('html', htmlStats)
    }

    // 3. CSS 检查（通常跳过，因为 Astro 已优化）
    if (config.css.enabled) {
      console.log('🎨 正在检查 CSS 文件...')
      const cssFiles = await fileFilter.findFiles(
        distPath, 
        config.css.extensions, 
        config.css.ignorePatterns
      )
      console.log(`📄 找到 ${cssFiles.length} 个 CSS 文件`)
      if (cssFiles.length > 0) {
        console.log('ℹ️  CSS 文件通常已被 Astro 优化，跳过额外处理')
      }
    }

    // 4. 文件清理
    if (config.cleanup.enabled) {
      const cleanupProcessor = new CleanupProcessor(
        { ...config.cleanup, verbose: config.global.verbose }, 
        fileFilter
      )
      const cleanupStats = await cleanupProcessor.process(distPath)
      reportProcessor.addStats('cleanup', cleanupStats)
    }

    // 5. Gzip 压缩
    if (config.gzip.enabled) {
      const gzipProcessor = new CompressionProcessor(
        { ...config.gzip, verbose: config.global.verbose }, 
        fileFilter
      )
      const gzipStats = await gzipProcessor.process(distPath)
      reportProcessor.addStats('gzip', gzipStats)
    }

    // 6. Brotli 压缩（可选）
    if (config.brotli?.enabled) {
      const brotliProcessor = new CompressionProcessor(
        { ...config.brotli, verbose: config.global.verbose }, 
        fileFilter
      )
      const brotliStats = await brotliProcessor.process(distPath)
      reportProcessor.addStats('brotli', brotliStats)
    }

    // 7. 生成最终报告
    reportProcessor.generateReport(distPath)
    
  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error.message)
    if (config.global.verbose) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// 启动优化流程
optimizeDist().catch(error => {
  console.error('❌ 构建后优化失败:', error.message)
  if (config.global.verbose) {
    console.error(error.stack)
  }
  process.exit(1)
})