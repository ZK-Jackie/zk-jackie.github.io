/**
 * Statistics report processor
 */
export class ReportProcessor {
  constructor(config) {
    this.config = config
    this.allStats = {}
  }

  /**
   * Add processor statistics
   * @param {string} processorName - Processor name
   * @param {object} stats - Statistics information
   */
  addStats(processorName, stats) {
    this.allStats[processorName] = stats
  }

  /**
   * Generate final report
   */
  generateReport() {
    if (!this?.config || !this.config?.enabled) {
      return
    }

    console.log('\n📊 Post-build optimization statistics report:')
    console.log('=' .repeat(50))

    let totalOriginalSize = 0
    let totalCompressedSize = 0
    let totalProcessedFiles = 0
    let totalErrors = 0

    // Display statistics for each processor
    Object.entries(this.allStats).forEach(([name, stats]) => {
      if (stats.fileCount > 0) {
        this.displayProcessorStats(name, stats)
        
        if (stats.originalSize !== undefined) {
          totalOriginalSize += stats.originalSize
          totalCompressedSize += stats.compressedSize
        }
        
        totalProcessedFiles += stats.fileCount
        totalErrors += (stats.errors?.length || 0)
      }
    })

    // Display overall statistics
    console.log('\n📋 Overall statistics:')
    console.log(`  📁 Total files processed: ${totalProcessedFiles}`)
    
    if (totalOriginalSize > 0) {
      const totalSavings = totalOriginalSize - totalCompressedSize
      const totalPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(1)
      console.log(`  💾 File size optimization: ${this.formatBytes(totalOriginalSize)} → ${this.formatBytes(totalCompressedSize)}`)
      console.log(`  📈 Total space saved: ${this.formatBytes(totalSavings)} (${totalPercent}%)`)
    }
    
    if (totalErrors > 0) {
      console.log(`  ⚠️ Total errors: ${totalErrors}`)
    }

    // Display performance recommendations
    this.displayRecommendations()

    console.log('\n✨ Post-build optimization completed!')
  }

  /**
   * Display statistics for individual processor
   * @param {string} name - Processor name
   * @param {object} stats - Statistics information
   */
  displayProcessorStats(name, stats) {
    const emoji = this.getEmojiForProcessor(name)
    console.log(`\n${emoji} ${this.getDisplayName(name)}:`)
    
    if (stats.originalSize !== undefined && stats.compressedSize !== undefined) {
      const savings = stats.originalSize - stats.compressedSize
      const percent = stats.originalSize > 0 ? ((savings / stats.originalSize) * 100).toFixed(1) : '0'
      console.log(`  📄 Files processed: ${stats.fileCount}`)
      console.log(`  📦 Before compression: ${this.formatBytes(stats.originalSize)}`)
      console.log(`  📦 After compression: ${this.formatBytes(stats.compressedSize)}`)
      console.log(`  💰 Space saved: ${this.formatBytes(savings)} (${percent}%)`)
    } else if (stats.fileCount > 0) {
      console.log(`  📄 Files processed: ${stats.fileCount}`)
    }
    
    if (stats.errors && stats.errors.length > 0) {
      console.log(`  ⚠️ Errors: ${stats.errors.length}`)
      if (this.config.showFileDetails) {
        stats.errors.slice(0, 3).forEach(error => {
          console.log(`    • ${error}`)
        })
        if (stats.errors.length > 3) {
          console.log(`    • ... and ${stats.errors.length - 3} more errors`)
        }
      }
    }
  }

  /**
   * Get emoji for processor
   * @param {string} name - Processor name
   * @returns {string} emoji
   */
  getEmojiForProcessor(name) {
    const emojis = {
      javascript: '⚡️',
      html: '📄',
      css: '🎨',
      cleanup: '🧹',
      gzip: '🗜️',
      brotli: '🗜️',
      compression: '🗜️'
    }
    return emojis[name] || '📦'
  }

  /**
   * Get display name for processor
   * @param {string} name - Processor name
   * @returns {string} Display name
   */
  getDisplayName(name) {
    const displayNames = {
      javascript: 'JavaScript compression',
      html: 'HTML compression',
      css: 'CSS compression',
      cleanup: 'File cleanup',
      gzip: 'Gzip compression',
      brotli: 'Brotli compression',
      compression: 'File compression'
    }
    return displayNames[name] || name
  }

  /**
   * Display performance recommendations
   */
  displayRecommendations() {
    console.log('\n💡 Performance recommendations:')
    
    const jsStats = this.allStats.javascript
    const htmlStats = this.allStats.html
    const gzipStats = this.allStats.gzip || this.allStats.compression
    
    if (jsStats && jsStats.fileCount > 0) {
      const jsPercent = jsStats.originalSize > 0 ? ((jsStats.originalSize - jsStats.compressedSize) / jsStats.originalSize * 100) : 0
      if (jsPercent < 20) {
        console.log('  📝 JavaScript compression rate is low, consider checking for uncompressed third-party libraries')
      }
    }
    
    if (htmlStats && htmlStats.fileCount > 0) {
      console.log('  🌐 HTML files are compressed, consider enabling server-side Gzip/Brotli compression')
    }
    
    if (gzipStats && gzipStats.fileCount > 0) {
      console.log('  🚀 Pre-compressed files generated, remember to configure static file compression in your web server')
      console.log('  📖 Nginx config example: gzip_static on; brotli_static on;')
    }
    
    console.log('  🔍 Regularly check bundle size analysis, remove unused dependencies')
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

export default ReportProcessor