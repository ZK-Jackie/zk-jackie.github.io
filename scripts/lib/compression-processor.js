import fs from 'fs'
import path from 'path'

/**
 * Compression processor (supports Gzip and Brotli)
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
   * Compress files
   * @param {string} distPath - Build output directory
   * @returns {Promise<object>} Processing statistics
   */
  async process(distPath) {
    if (!this.config.enabled) {
      console.log(`ℹ️  ${this.config.algorithm} compression skipped (disabled)`)
      return this.stats
    }

    console.log(`🗜️ Generating ${this.config.algorithm.toUpperCase()} compressed files...`)

    try {
      const zlib = await import('zlib')
      const compressFunction = this.getCompressFunction(zlib)

      const files = await this.fileFilter.findFiles(
        distPath, 
        this.config.extensions, 
        this.config.ignorePatterns
      )

      // Filter out files smaller than minimum size threshold
      const eligibleFiles = files.filter(file => {
        try {
          const stat = fs.statSync(file)
          return stat.size >= this.config.minSize
        } catch {
          return false
        }
      })

      console.log(`📄 Found ${eligibleFiles.length} files to compress`)
      this.stats.fileCount = eligibleFiles.length

      for (const file of eligibleFiles) {
        await this.processFile(file, distPath, compressFunction)
      }

      this.logResults()
      return this.stats

    } catch (error) {
      console.error(`❌ ${this.config.algorithm} compression failed:`, error.message)
      this.stats.errors.push(error.message)
      return this.stats
    }
  }

  /**
   * Get compression function
   * @param {object} zlib - zlib module
   * @returns {Function} Compression function
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
        throw new Error(`Unsupported compression algorithm: ${this.config.algorithm}`)
    }
  }

  /**
   * Process single file
   * @param {string} filePath - File path
   * @param {string} distPath - Base path
   * @param {Function} compressFunction - Compression function
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
      console.warn(`  ⚠️ Compression failed: ${path.relative(distPath, filePath)} - ${error.message}`)
      this.stats.errors.push(`${filePath}: ${error.message}`)
    }
  }

  /**
   * Log processing results
   */
  logResults() {
    if (this.stats.fileCount > 0) {
      const savings = this.stats.originalSize - this.stats.compressedSize
      const percent = this.stats.originalSize > 0 ? ((savings / this.stats.originalSize) * 100).toFixed(1) : '0'
      
      console.log(`✨ ${this.config.algorithm.toUpperCase()} compression completed! Processed ${this.stats.fileCount} files`)
      console.log(`📊 Compression statistics: ${this.formatBytes(this.stats.originalSize)} → ${this.formatBytes(this.stats.compressedSize)} (saved ${this.formatBytes(savings)}, ${percent}%)`)
      
      if (this.stats.errors.length > 0) {
        console.log(`⚠️ Encountered ${this.stats.errors.length} errors`)
      }
    } else {
      console.log(`ℹ️  No files found that need ${this.config.algorithm} compression`)
    }
  }

  /**
   * Format bytes
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
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