import fs from 'fs'
import path from 'path'

/**
 * 压缩处理器（支持 Gzip 和 Brotli）
 */
export class CompressionProcessor {
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
   * 压缩文件
   * @param {string} distPath - 构建输出目录
   * @returns {Promise&lt;object&gt;} 处理统计信息
   */
  async process(distPath) {
    if (!this.config.enabled) {
      console.log(`ℹ️  ${this.config.algorithm} 压缩已跳过（已禁用）`)
      return this.stats
    }

    console.log(`🗜️ 正在生成 ${this.config.algorithm.toUpperCase()} 压缩文件...`)

    try {
      const zlib = await import('zlib')
      const compressFunction = this.getCompressFunction(zlib)

      const files = await this.fileFilter.findFiles(
        distPath, 
        this.config.extensions, 
        this.config.ignorePatterns
      )

      // 过滤掉小于最小大小阈值的文件
      const eligibleFiles = files.filter(file => {
        try {
          const stat = fs.statSync(file)
          return stat.size >= this.config.minSize
        } catch {
          return false
        }
      })

      console.log(`📄 找到 ${eligibleFiles.length} 个文件需要压缩`)
      this.stats.fileCount = eligibleFiles.length

      for (const file of eligibleFiles) {
        await this.processFile(file, distPath, compressFunction)
      }

      this.logResults()
      return this.stats

    } catch (error) {
      console.error(`❌ ${this.config.algorithm} 压缩失败:`, error.message)
      this.stats.errors.push(error.message)
      return this.stats
    }
  }

  /**
   * 获取压缩函数
   * @param {object} zlib - zlib 模块
   * @returns {Function} 压缩函数
   */
  getCompressFunction(zlib) {
    switch (this.config.algorithm) {
      case 'gzip':
        return (content) => zlib.gzipSync(content, { level: this.config.level })
      case 'brotli':
        return (content) => zlib.brotliCompressSync(content, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: this.config.level
          }
        })
      default:
        throw new Error(`不支持的压缩算法: ${this.config.algorithm}`)
    }
  }

  /**
   * 处理单个文件
   * @param {string} filePath - 文件路径
   * @param {string} distPath - 基础路径
   * @param {Function} compressFunction - 压缩函数
   */
  async processFile(filePath, distPath, compressFunction) {
    try {
      const content = fs.readFileSync(filePath)
      const originalSize = content.length
      this.stats.originalSize += originalSize

      const compressed = compressFunction(content)
      const compressedSize = compressed.length
      this.stats.compressedSize += compressedSize

      const outputExtension = this.config.algorithm === 'gzip' ? 'gz' : this.config.algorithm
      const outputFile = `${filePath}.${outputExtension}`
      
      fs.writeFileSync(outputFile, compressed)

      if (this.config.verbose) {
        const savings = originalSize - compressedSize
        const percent = ((savings / originalSize) * 100).toFixed(1)
        console.log(`  ✅ ${path.relative(distPath, filePath)} → ${path.basename(outputFile)} (${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)}, -${percent}%)`)
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
      
      console.log(`✨ ${this.config.algorithm.toUpperCase()} 压缩完成! 处理了 ${this.stats.fileCount} 个文件`)
      console.log(`📊 压缩统计: ${this.formatBytes(this.stats.originalSize)} → ${this.formatBytes(this.stats.compressedSize)} (节省 ${this.formatBytes(savings)}, ${percent}%)`)
      
      if (this.stats.errors.length > 0) {
        console.log(`⚠️ 遇到 ${this.stats.errors.length} 个错误`)
      }
    } else {
      console.log(`ℹ️  没有找到需要 ${this.config.algorithm} 压缩的文件`)
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

export default CompressionProcessor