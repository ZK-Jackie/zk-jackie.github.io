import fs from 'fs'
import path from 'path'
import htmlMinifier from 'html-minifier-terser'

/**
 * HTML 压缩处理器
 */
export class HTMLProcessor {
  constructor(config, fileFilter) {
    this.config = config
    this.fileFilter = fileFilter
    this.stats = {
      originalSize: 0,
      compressedSize: 0,
      fileCount: 0,
      errors: []
    }
  }

  /**
   * 处理 HTML 文件压缩
   * @param {string} distPath - 构建输出目录
   * @returns {Promise&lt;object&gt;} 处理统计信息
   */
  async process(distPath) {
    if (!this.config.enabled) {
      console.log('ℹ️  HTML 压缩已跳过（已禁用）')
      return this.stats
    }

    console.log('📄 正在压缩 HTML 文件...')

    try {
      const files = await this.fileFilter.findFiles(
        distPath, 
        this.config.extensions, 
        this.config.ignorePatterns
      )

      console.log(`📄 找到 ${files.length} 个 HTML 文件`)
      this.stats.fileCount = files.length

      for (const file of files) {
        await this.processFile(file, distPath)
      }

      this.logResults()
      return this.stats

    } catch (error) {
      console.error('❌ HTML 压缩失败:', error.message)
      this.stats.errors.push(error.message)
      return this.stats
    }
  }

  /**
   * 处理单个 HTML 文件
   * @param {string} filePath - 文件路径
   * @param {string} distPath - 基础路径
   */
  async processFile(filePath, distPath) {
    try {
      const html = fs.readFileSync(filePath, 'utf8')
      const originalSize = html.length
      this.stats.originalSize += originalSize

      const result = await htmlMinifier.minify(html, this.config.minifierOptions)
      
      fs.writeFileSync(filePath, result)
      this.stats.compressedSize += result.length

      if (this.config.verbose) {
        const savings = originalSize - result.length
        const percent = ((savings / originalSize) * 100).toFixed(1)
        console.log(`  ✅ ${path.relative(distPath, filePath)} - ${this.formatBytes(originalSize)} → ${this.formatBytes(result.length)} (-${percent}%)`)
      }

    } catch (error) {
      console.warn(`  ⚠️ 压缩失败: ${path.relative(distPath, filePath)} - ${error.message}`)
      this.stats.errors.push(`${filePath}: ${error.message}`)
    }
  }

  /**
   * 记录处理结果
   */
  logResults() {
    if (this.stats.fileCount > 0) {
      const savings = this.stats.originalSize - this.stats.compressedSize
      const percent = this.stats.originalSize > 0 ? ((savings / this.stats.originalSize) * 100).toFixed(1) : '0'
      
      console.log(`✨ HTML 压缩完成! 处理了 ${this.stats.fileCount} 个文件`)
      console.log(`📊 压缩统计: ${this.formatBytes(this.stats.originalSize)} → ${this.formatBytes(this.stats.compressedSize)} (节省 ${this.formatBytes(savings)}, ${percent}%)`)
      
      if (this.stats.errors.length > 0) {
        console.log(`⚠️ 遇到 ${this.stats.errors.length} 个错误`)
      }
    }
  }

  /**
   * 格式化字节数
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的字符串
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export default HTMLProcessor