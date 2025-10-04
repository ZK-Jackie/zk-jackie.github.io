/**
 * 统计报告处理器
 */
export class ReportProcessor {
  constructor(config) {
    this.config = config
    this.allStats = {}
  }

  /**
   * 添加处理器统计信息
   * @param {string} processorName - 处理器名称
   * @param {object} stats - 统计信息
   */
  addStats(processorName, stats) {
    this.allStats[processorName] = stats
  }

  /**
   * 生成最终报告
   * @param {string} distPath - 构建输出目录
   */
  generateReport(distPath) {
    if (!this.config.enabled) {
      return
    }

    console.log('\n📊 构建后优化统计报告:')
    console.log('=' .repeat(50))

    let totalOriginalSize = 0
    let totalCompressedSize = 0
    let totalProcessedFiles = 0
    let totalErrors = 0

    // 显示各个处理器的统计信息
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

    // 显示总体统计
    console.log('\n📋 总体统计:')
    console.log(`  📁 处理的文件总数: ${totalProcessedFiles}`)
    
    if (totalOriginalSize > 0) {
      const totalSavings = totalOriginalSize - totalCompressedSize
      const totalPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(1)
      console.log(`  💾 文件大小优化: ${this.formatBytes(totalOriginalSize)} → ${this.formatBytes(totalCompressedSize)}`)
      console.log(`  📈 总节省空间: ${this.formatBytes(totalSavings)} (${totalPercent}%)`)
    }
    
    if (totalErrors > 0) {
      console.log(`  ⚠️ 总错误数: ${totalErrors}`)
    }

    // 显示性能建议
    this.displayRecommendations()

    console.log('\n✨ 构建后优化完成!')
  }

  /**
   * 显示单个处理器的统计信息
   * @param {string} name - 处理器名称
   * @param {object} stats - 统计信息
   */
  displayProcessorStats(name, stats) {
    const emoji = this.getEmojiForProcessor(name)
    console.log(`\n${emoji} ${this.getDisplayName(name)}:`)
    
    if (stats.originalSize !== undefined && stats.compressedSize !== undefined) {
      const savings = stats.originalSize - stats.compressedSize
      const percent = stats.originalSize > 0 ? ((savings / stats.originalSize) * 100).toFixed(1) : '0'
      console.log(`  📄 处理文件: ${stats.fileCount} 个`)
      console.log(`  📦 压缩前: ${this.formatBytes(stats.originalSize)}`)
      console.log(`  📦 压缩后: ${this.formatBytes(stats.compressedSize)}`)
      console.log(`  💰 节省空间: ${this.formatBytes(savings)} (${percent}%)`)
    } else if (stats.fileCount > 0) {
      console.log(`  📄 处理文件: ${stats.fileCount} 个`)
    }
    
    if (stats.errors && stats.errors.length > 0) {
      console.log(`  ⚠️ 错误: ${stats.errors.length} 个`)
      if (this.config.showFileDetails) {
        stats.errors.slice(0, 3).forEach(error => {
          console.log(`    • ${error}`)
        })
        if (stats.errors.length > 3) {
          console.log(`    • ... 还有 ${stats.errors.length - 3} 个错误`)
        }
      }
    }
  }

  /**
   * 获取处理器对应的 emoji
   * @param {string} name - 处理器名称
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
   * 获取处理器显示名称
   * @param {string} name - 处理器名称
   * @returns {string} 显示名称
   */
  getDisplayName(name) {
    const displayNames = {
      javascript: 'JavaScript 压缩',
      html: 'HTML 压缩',
      css: 'CSS 压缩',
      cleanup: '文件清理',
      gzip: 'Gzip 压缩',
      brotli: 'Brotli 压缩',
      compression: '文件压缩'
    }
    return displayNames[name] || name
  }

  /**
   * 显示性能建议
   */
  displayRecommendations() {
    console.log('\n💡 性能建议:')
    
    const jsStats = this.allStats.javascript
    const htmlStats = this.allStats.html
    const gzipStats = this.allStats.gzip || this.allStats.compression
    
    if (jsStats && jsStats.fileCount > 0) {
      const jsPercent = jsStats.originalSize > 0 ? ((jsStats.originalSize - jsStats.compressedSize) / jsStats.originalSize * 100) : 0
      if (jsPercent < 20) {
        console.log('  📝 JavaScript 压缩率较低，考虑检查是否有未压缩的第三方库')
      }
    }
    
    if (htmlStats && htmlStats.fileCount > 0) {
      console.log('  🌐 HTML 文件已压缩，考虑启用服务器端 Gzip/Brotli 压缩')
    }
    
    if (gzipStats && gzipStats.fileCount > 0) {
      console.log('  🚀 已生成预压缩文件，记得在 Web 服务器中配置静态文件压缩')
      console.log('  📖 Nginx 配置示例: gzip_static on; brotli_static on;')
    }
    
    console.log('  🔍 定期检查 bundle 大小分析，移除未使用的依赖')
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

export default ReportProcessor