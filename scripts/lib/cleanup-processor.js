import fs from 'fs'
import path from 'path'

/**
 * 文件清理处理器
 */
export class CleanupProcessor {
  constructor(config, fileFilter) {
    this.config = config
    this.fileFilter = fileFilter
    this.stats = {
      deletedFiles: [],
      fileCount: 0,
      errors: []
    }
  }

  /**
   * 清理不需要的文件
   * @param {string} distPath - 构建输出目录
   * @returns {Promise&lt;object&gt;} 处理统计信息
   */
  async process(distPath) {
    if (!this.config.enabled) {
      console.log('ℹ️  文件清理已跳过（已禁用）')
      return this.stats
    }

    console.log('🧹 清理临时文件...')

    try {
      for (const pattern of this.config.patterns) {
        await this.cleanByPattern(distPath, pattern)
      }

      this.logResults(distPath)
      return this.stats

    } catch (error) {
      console.error('❌ 文件清理失败:', error.message)
      this.stats.errors.push(error.message)
      return this.stats
    }
  }

  /**
   * 根据模式清理文件
   * @param {string} distPath - 基础路径
   * @param {string} pattern - 文件模式
   */
  async cleanByPattern(distPath, pattern) {
    try {
      const files = await this.fileFilter.findFilesByPattern(distPath, pattern)
      
      for (const file of files) {
        try {
          fs.unlinkSync(file)
          this.stats.deletedFiles.push(file)
          this.stats.fileCount++
          
          if (this.config.verbose) {
            console.log(`  🗑️ 已删除: ${path.relative(distPath, file)}`)
          }
        } catch (error) {
          console.warn(`  ⚠️ 无法删除 ${file}:`, error.message)
          this.stats.errors.push(`${file}: ${error.message}`)
        }
      }
    } catch (error) {
      console.warn(`  ⚠️ 清理模式 "${pattern}" 失败:`, error.message)
      this.stats.errors.push(`Pattern "${pattern}": ${error.message}`)
    }
  }

  /**
   * 记录处理结果
   * @param {string} distPath - 基础路径
   */
  logResults(distPath) {
    if (this.stats.fileCount > 0) {
      console.log(`✨ 文件清理完成! 删除了 ${this.stats.fileCount} 个文件`)
      
      if (!this.config.verbose && this.stats.deletedFiles.length > 0) {
        console.log('  删除的文件:')
        this.stats.deletedFiles.forEach(file => {
          console.log(`    🗑️ ${path.relative(distPath, file)}`)
        })
      }
      
      if (this.stats.errors.length > 0) {
        console.log(`⚠️ 遇到 ${this.stats.errors.length} 个错误`)
      }
    } else {
      console.log('ℹ️  没有找到需要清理的文件')
    }
  }
}

export default CleanupProcessor