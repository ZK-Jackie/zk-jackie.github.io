import fs from 'fs'
import path from 'path'
import picomatch from 'picomatch'

/**
 * 文件过滤器工具类
 * 使用 picomatch 提供灵活的文件匹配功能
 */
export class FileFilter {
  constructor(globalIgnorePatterns = []) {
    this.globalIgnorePatterns = globalIgnorePatterns
  }

  /**
   * 检查文件是否应该被忽略
   * @param {string} filePath - 文件路径
   * @param {string[]} patterns - 忽略模式数组
   * @param {string} basePath - 基础路径，用于计算相对路径
   * @returns {boolean} 是否应该忽略
   */
  shouldIgnore(filePath, patterns = [], basePath = '') {
    const allPatterns = [...this.globalIgnorePatterns, ...patterns]
    if (allPatterns.length === 0) return false

    const relativePath = basePath ? path.relative(basePath, filePath) : filePath
    const normalizedPath = relativePath.replace(/\\/g, '/') // 统一使用 Unix 风格路径

    return allPatterns.some(pattern => {
      const matcher = picomatch(pattern)
      return matcher(normalizedPath) || matcher(path.basename(filePath))
    })
  }

  /**
   * 递归查找文件
   * @param {string} dir - 搜索目录
   * @param {string[]} extensions - 文件扩展名数组
   * @param {string[]} ignorePatterns - 忽略模式数组
   * @param {string} basePath - 基础路径
   * @returns {Promise&lt;string[]&gt;} 文件路径数组
   */
  async findFiles(dir, extensions = [], ignorePatterns = [], basePath = null) {
    basePath = basePath || dir
    let results = []

    try {
      if (!fs.existsSync(dir)) {
        return results
      }

      const list = fs.readdirSync(dir)

      for (const file of list) {
        const fullPath = path.join(dir, file)
        
        // 检查是否应该忽略这个文件/目录
        if (this.shouldIgnore(fullPath, ignorePatterns, basePath)) {
          continue
        }

        const stat = fs.statSync(fullPath)

        if (stat && stat.isDirectory()) {
          // 递归搜索子目录
          const subResults = await this.findFiles(fullPath, extensions, ignorePatterns, basePath)
          results = results.concat(subResults)
        } else {
          // 检查文件扩展名
          if (this.matchesExtensions(file, extensions)) {
            results.push(fullPath)
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无法读取目录 ${dir}:`, error.message)
    }

    return results
  }

  /**
   * 检查文件是否匹配指定的扩展名
   * @param {string} fileName - 文件名
   * @param {string[]} extensions - 扩展名数组
   * @returns {boolean} 是否匹配
   */
  matchesExtensions(fileName, extensions) {
    if (!extensions || extensions.length === 0) return true
    
    return extensions.some(ext => {
      // 支持通配符模式，如 "*.js"
      if (ext.includes('*')) {
        const pattern = ext.replace(/\*/g, '.*') + '$'
        const regex = new RegExp(pattern, 'i')
        return regex.test(fileName)
      }
      
      // 确保扩展名以点开头
      const normalizedExt = ext.startsWith('.') ? ext : '.' + ext
      return fileName.toLowerCase().endsWith(normalizedExt.toLowerCase())
    })
  }

  /**
   * 根据模式删除文件
   * @param {string} baseDir - 基础目录
   * @param {string[]} patterns - 文件模式数组
   * @returns {Promise&lt;string[]&gt;} 被删除的文件路径数组
   */
  async removeFilesByPattern(baseDir, patterns) {
    const deletedFiles = []

    for (const pattern of patterns) {
      try {
        const files = await this.findFilesByPattern(baseDir, pattern)
        
        for (const file of files) {
          try {
            fs.unlinkSync(file)
            deletedFiles.push(file)
          } catch (error) {
            console.warn(`⚠️ 无法删除文件 ${file}:`, error.message)
          }
        }
      } catch (error) {
        console.warn(`⚠️ 查找模式 "${pattern}" 失败:`, error.message)
      }
    }

    return deletedFiles
  }

  /**
   * 使用模式查找文件
   * @param {string} baseDir - 基础目录
   * @param {string} pattern - 文件模式
   * @returns {Promise&lt;string[]&gt;} 匹配的文件路径数组
   */
  async findFilesByPattern(baseDir, pattern) {
    const matcher = picomatch(pattern)
    const results = []

    const searchDir = async (dir) => {
      try {
        const list = fs.readdirSync(dir)

        for (const file of list) {
          const fullPath = path.join(dir, file)
          const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
          const stat = fs.statSync(fullPath)

          if (stat && stat.isDirectory()) {
            await searchDir(fullPath)
          } else if (matcher(relativePath) || matcher(file)) {
            results.push(fullPath)
          }
        }
      } catch (error) {
        console.warn(`⚠️ 搜索目录 ${dir} 失败:`, error.message)
      }
    }

    await searchDir(baseDir)
    return results
  }
}

export default FileFilter