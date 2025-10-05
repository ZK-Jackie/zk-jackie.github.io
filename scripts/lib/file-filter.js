import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

/**
 * File filter utility class
 * Provides efficient file matching using built-in features
 */
export class FileFilter {
  constructor(globalIgnorePatterns = []) {
    this.globalIgnorePatterns = globalIgnorePatterns
  }

  /**
   * Check if file should be ignored
   * @param {string} filePath - File path
   * @param {string[]} patterns - Ignore pattern array
   * @param {string} basePath - Base path for calculating relative path
   * @returns {boolean} Whether should be ignored
   */
  shouldIgnore(filePath, patterns = [], basePath = '') {
    const allPatterns = [...this.globalIgnorePatterns, ...patterns]
    if (allPatterns.length === 0) return false

    const relativePath = basePath ? path.relative(basePath, filePath) : filePath
    const normalizedPath = relativePath.replace(/\\/g, '/') // Normalize to Unix-style paths

    return allPatterns.some(pattern => {
      // Use simple glob pattern matching
      return this.matchGlobPattern(pattern, normalizedPath) || 
             this.matchGlobPattern(pattern, path.basename(filePath))
    })
  }

  /**
   * Simple glob pattern matching
   * @param {string} pattern - Glob pattern
   * @param {string} text - Text to match
   * @returns {boolean} Whether matches
   */
  matchGlobPattern(pattern, text) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]')
    
    const regex = new RegExp(`^${regexPattern}$`, 'i')
    return regex.test(text)
  }

  /**
   * Recursively find files
   * @param {string} dir - Search directory
   * @param {string[]} extensions - File extension array
   * @param {string[]} ignorePatterns - Ignore pattern array
   * @param {string} basePath - Base path
   * @returns {Promise<string[]>} File path array
   */
  async findFiles(dir, extensions = [], ignorePatterns = [], basePath = null) {
    basePath = basePath || dir
    
    try {
      // Build glob pattern
      let globPattern = '**/*'
      if (extensions.length > 0) {
        if (extensions.length === 1) {
          globPattern = `**/*${extensions[0]}`
        } else {
          // Multiple extensions use brace syntax
          const exts = extensions.map(ext => ext.startsWith('.') ? ext : '.' + ext)
          globPattern = `**/*{${exts.join(',')}}`
        }
      }
      
      // Merge ignore patterns
      const allIgnorePatterns = [...this.globalIgnorePatterns, ...ignorePatterns]
      
      // Use glob to find files
      const files = await glob(globPattern, {
        cwd: dir,
        absolute: true,
        nodir: true,
        ignore: allIgnorePatterns
      })
      
      return files
    } catch (error) {
      console.warn(`⚠️ Unable to read directory ${dir}:`, error.message)
      return []
    }
  }

  /**
   * Check if file matches specified extensions
   * @param {string} fileName - File name
   * @param {string[]} extensions - Extension array
   * @returns {boolean} Whether matches
   */
  matchesExtensions(fileName, extensions) {
    if (!extensions || extensions.length === 0) return true
    
    return extensions.some(ext => {
      // Support wildcard patterns like "*.js"
      if (ext.includes('*')) {
        const pattern = ext.replace(/\*/g, '.*') + '$'
        const regex = new RegExp(pattern, 'i')
        return regex.test(fileName)
      }
      
      // Ensure extension starts with dot
      const normalizedExt = ext.startsWith('.') ? ext : '.' + ext
      return fileName.toLowerCase().endsWith(normalizedExt.toLowerCase())
    })
  }

  /**
   * Delete files by pattern
   * @param {string} baseDir - Base directory
   * @param {string[]} patterns - File pattern array
   * @returns {Promise<string[]>} Array of deleted file paths
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
            console.warn(`⚠️ Unable to delete file ${file}:`, error.message)
          }
        }
      } catch (error) {
        console.warn(`⚠️ Pattern search failed "${pattern}":`, error.message)
      }
    }

    return deletedFiles
  }

  /**
   * Find files using glob library
   * @param {string} baseDir - Base directory
   * @param {string} pattern - Glob pattern
   * @returns {Promise<string[]>} Array of matching file paths
   */
  async findFilesByPattern(baseDir, pattern) {
    try {
      // Ensure pattern is relative to baseDir
      const globPattern = pattern.startsWith('/') ? pattern.slice(1) : pattern
      
      // Use glob library to find files
      return await glob(globPattern, {
        cwd: baseDir,
        absolute: true,
        nodir: true, // Return only files, not directories
        ignore: this.globalIgnorePatterns
      })
    } catch (error) {
      console.warn(`⚠️ Search pattern failed "${pattern}":`, error.message)
      return []
    }
  }

  /**
   * Recursively traverse directory
   * @param {string} dir - Directory path
   * @param {Function} callback - Callback function receiving (filePath, stat) parameters
   */
  async walkDirectory(dir, callback) {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        try {
          const stat = await fs.promises.stat(fullPath)
          
          if (entry.isDirectory()) {
            await callback(fullPath, stat)
            await this.walkDirectory(fullPath, callback)
          } else {
            await callback(fullPath, stat)
          }
        } catch (error) {
          // Ignore inaccessible files
          continue
        }
      }
    } catch (error) {
      console.warn(`⚠️ Unable to read directory ${dir}:`, error.message)
    }
  }

  /**
   * Find files and potentially affected folders
   * @param {string} baseDir - Base directory  
   * @param {string} pattern - Glob pattern
   * @returns {Promise<{files: string[], folders: string[]}>} Matching files and related folders
   */
  async findFilesAndFoldersByPattern(baseDir, pattern) {
    try {
      // Ensure pattern is relative to baseDir
      const globPattern = pattern.startsWith('/') ? pattern.slice(1) : pattern
      
      // Use glob library to find files
      const files = await glob(globPattern, {
        cwd: baseDir,
        absolute: true,
        nodir: true,
        ignore: this.globalIgnorePatterns
      })
      
      // Also find potentially affected directories
      const allPaths = await glob(globPattern, {
        cwd: baseDir,
        absolute: true,
        ignore: this.globalIgnorePatterns
      })
      
      // Collect folders containing these files
      const folderSet = new Set()
      
      for (const file of files) {
        let dir = path.dirname(file)
        
        // Traverse directory structure upward, add all potentially empty directories
        while (dir !== baseDir && dir !== path.dirname(dir)) {
          folderSet.add(dir)
          dir = path.dirname(dir)
        }
      }
      
      // Add directories directly matched by glob, use Promise.all for efficiency
      await Promise.all(allPaths.map(async (p) => {
        try {
          const stat = await fs.promises.stat(p)
          if (stat.isDirectory()) {
            folderSet.add(p)
          }
        } catch (error) {
          // Ignore inaccessible paths
        }
      }))
      
      // Sort by depth, deeper directories first (should delete deeper directories first when deleting)
      const folders = Array.from(folderSet).sort((a, b) => {
        const depthA = a.split(path.sep).length
        const depthB = b.split(path.sep).length
        return depthB - depthA // Deeper depth first
      })
      
      return {
        files,
        folders
      }
    } catch (error) {
      console.warn(`⚠️ Failed to find files and folders:`, error.message)
      return { files: [], folders: [] }
    }
  }
}

export default FileFilter