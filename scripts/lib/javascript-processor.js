import fs from 'fs'
import path from 'path'
import { minify } from 'terser'

/**
 * JavaScript compression processor
 */
export class JavaScriptProcessor {
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
   * Process JavaScript file compression
   * @param {string} distPath - Build output directory
   * @returns {Promise<object>} Processing statistics
   */
  async process(distPath) {
    if (!this.config.enabled) {
      console.log('ℹ️  JavaScript compression skipped (disabled)')
      return this.stats
    }

    console.log('⚡️ Compressing JavaScript files...')

    try {
      const files = await this.fileFilter.findFiles(
        distPath, 
        this.config.extensions, 
        this.config.ignorePatterns
      )

      console.log(`📄 Found ${files.length} JS files`)
      this.stats.fileCount = files.length

      for (const file of files) {
        await this.processFile(file, distPath)
      }

      this.logResults()
      return this.stats

    } catch (error) {
      console.error('❌ JavaScript compression failed:', error.message)
      this.stats.errors.push(error.message)
      return this.stats
    }
  }

  /**
   * Process individual JavaScript file
   * @param {string} filePath - File path
   * @param {string} distPath - Base path
   */
  async processFile(filePath, distPath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8')
      const originalSize = code.length
      this.stats.originalSize += originalSize

      const result = await minify(code, this.config.terserOptions)

      if (result.code) {
        fs.writeFileSync(filePath, result.code)
        this.stats.compressedSize += result.code.length

        if (this.config.verbose) {
          const savings = originalSize - result.code.length
          const percent = ((savings / originalSize) * 100).toFixed(1)
          console.log(`  ✅ ${path.relative(distPath, filePath)} - ${this.formatBytes(originalSize)} → ${this.formatBytes(result.code.length)} (-${percent}%)`)
        }
      } else {
        console.warn(`  ⚠️ Compression failed: ${path.relative(distPath, filePath)} - No output code`)
        this.stats.errors.push(`No output code for ${filePath}`)
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
      
      console.log(`✨ JavaScript compression completed! Processed ${this.stats.fileCount} files`)
      console.log(`📊 Compression stats: ${this.formatBytes(this.stats.originalSize)} → ${this.formatBytes(this.stats.compressedSize)} (saved ${this.formatBytes(savings)}, ${percent}%)`)
      
      if (this.stats.errors.length > 0) {
        console.log(`⚠️ Encountered ${this.stats.errors.length} errors`)
      }
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

export default JavaScriptProcessor