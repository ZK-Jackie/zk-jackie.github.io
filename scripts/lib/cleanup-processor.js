import fs from 'fs'
import path from 'path'

/**
 * File cleanup processor
 */
export class CleanupProcessor {
  constructor(config, fileFilter) {
    this.config = config
    this.fileFilter = fileFilter
    this.stats = {
      deletedFiles: [],
      deletedDirs: [],
      fileCount: 0,
      dirCount: 0,
      errors: []
    }
    // Set concurrency limit, default 10 concurrent operations
    this.concurrencyLimit = config.concurrency || 10
  }

  /**
   * Clean up unnecessary files
   * @param {string} distPath - Build output directory
   * @returns {Promise<object>} Processing statistics
   */
  async process(distPath) {
    if (!this.config.enabled) {
      console.log('ℹ️  File cleanup skipped (disabled)')
      return this.stats
    }

    console.log('🧹 Cleaning up temporary files...')

    try {
      // Collect all files and related folders to delete
      const allFilesToDelete = []
      const allFoldersToCheck = new Set()

      for (const pattern of this.config.patterns) {
        const { files, folders } = await this.fileFilter.findFilesAndFoldersByPattern(distPath, pattern)
        allFilesToDelete.push(...files)
        folders.forEach(folder => allFoldersToCheck.add(folder))
      }

      console.log(`📄 Found ${allFilesToDelete.length} files to delete`)
      console.log(`📁 Found ${allFoldersToCheck.size} folders to check`)

      // Delete files
      if (allFilesToDelete.length > 0) {
        await this.deleteFilesWithConcurrency(allFilesToDelete, distPath)
      }

      // Delete potentially empty directories
      if (this.config.removeEmptyDirs !== false && allFoldersToCheck.size > 0) {
        await this.removeEmptyDirectoriesFromList(Array.from(allFoldersToCheck), distPath)
      }

      this.logResults(distPath)
      return this.stats

    } catch (error) {
      console.error('❌ File cleanup failed:', error.message)
      this.stats.errors.push(error.message)
      return this.stats
    }
  }

  /**
   * Delete files with concurrency control
   * @param {string[]} files - Array of files to delete
   * @param {string} distPath - Base path
   */
  async deleteFilesWithConcurrency(files, distPath) {
    const promises = []
    const semaphore = new Array(this.concurrencyLimit).fill(Promise.resolve())
    
    for (const file of files) {
      const promise = semaphore.shift().then(async () => {
        try {
          await fs.promises.unlink(file)
          this.stats.deletedFiles.push(file)
          this.stats.fileCount++
          
          if (this.config.verbose) {
            console.log(`  🗑️ Deleted: ${path.relative(distPath, file)}`)
          }
        } catch (error) {
          if (error.code !== 'ENOENT') { // Ignore file not found errors
            console.warn(`  ⚠️ Unable to delete ${file}:`, error.message)
            this.stats.errors.push(`${file}: ${error.message}`)
          }
        }
      })
      
      promises.push(promise)
      semaphore.push(promise)
    }
    
    await Promise.all(promises)
  }

  /**
   * Remove empty directories from pre-collected list
   * @param {string[]} directories - List of directories to check (already sorted by depth)
   * @param {string} basePath - Base path
   */
  async removeEmptyDirectoriesFromList(directories, basePath) {
    console.log(`📁 Checking ${directories.length} potentially empty directories...`)
    
    for (const dir of directories) {
      try {
        // Check if directory exists and is empty
        if (fs.existsSync(dir)) {
          const entries = await fs.promises.readdir(dir)
          
          if (entries.length === 0) {
            // Ensure not to delete root directory
            if (dir !== basePath && dir !== path.dirname(dir)) {
              await fs.promises.rmdir(dir)
              this.stats.deletedDirs.push(dir)
              this.stats.dirCount++
              
              if (this.config.verbose) {
                console.log(`  📁 Deleted empty directory: ${path.relative(basePath, dir)}`)
              }
            }
          }
        }
      } catch (error) {
        // Ignore common irrelevant errors
        if (error.code !== 'ENOENT' && error.code !== 'EACCES' && error.code !== 'ENOTEMPTY') {
          console.warn(`  ⚠️ Unable to delete directory ${dir}:`, error.message)
          this.stats.errors.push(`Directory ${dir}: ${error.message}`)
        }
      }
    }
  }

  /**
   * Recursively remove empty directories (fallback method, kept for compatibility)
   * @param {string} dir - Directory to check
   */
  async removeEmptyDirectories(dir) {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })
      
      // Recursively process subdirectories
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subDir = path.join(dir, entry.name)
          await this.removeEmptyDirectories(subDir)
        }
      }
      
      // Check if directory is empty, delete if so
      const updatedEntries = await fs.promises.readdir(dir)
      if (updatedEntries.length === 0) {
        // Ensure not to delete root directory
        const distName = path.basename(this.config.basePath || 'dist')
        if (path.basename(dir) !== distName) {
          await fs.promises.rmdir(dir)
          this.stats.deletedDirs.push(dir)
          this.stats.dirCount++
          
          if (this.config.verbose) {
            console.log(`  📁 Deleted empty directory: ${path.relative(this.config.basePath || '', dir)}`)
          }
        }
      }
    } catch (error) {
      // Ignore non-existent directories or permission errors
      if (error.code !== 'ENOENT' && error.code !== 'EACCES') {
        console.warn(`  ⚠️ Unable to process directory ${dir}:`, error.message)
      }
    }
  }

  /**
   * Log processing results
   * @param {string} distPath - Base path
   */
  logResults(distPath) {
    if (this.stats.fileCount > 0 || this.stats.dirCount > 0) {
      let message = '✨ File cleanup completed!'
      if (this.stats.fileCount > 0) {
        message += ` Deleted ${this.stats.fileCount} files`
      }
      if (this.stats.dirCount > 0) {
        message += ` and ${this.stats.dirCount} empty directories`
      }
      console.log(message)
      
      if (!this.config.verbose && this.stats.deletedFiles.length > 0) {
        console.log('  Deleted files:')
        this.stats.deletedFiles.slice(0, 10).forEach(file => {
          console.log(`    🗑️ ${path.relative(distPath, file)}`)
        })
        if (this.stats.deletedFiles.length > 10) {
          console.log(`    ... and ${this.stats.deletedFiles.length - 10} more files`)
        }
      }
      
      if (!this.config.verbose && this.stats.deletedDirs.length > 0) {
        console.log('  Deleted directories:')
        this.stats.deletedDirs.slice(0, 5).forEach(dir => {
          console.log(`    📁 ${path.relative(distPath, dir)}`)
        })
        if (this.stats.deletedDirs.length > 5) {
          console.log(`    ... and ${this.stats.deletedDirs.length - 5} more directories`)
        }
      }
      
      if (this.stats.errors.length > 0) {
        console.log(`⚠️ Encountered ${this.stats.errors.length} errors`)
      }
    } else {
      console.log('ℹ️  No files to clean up were found')
    }
  }
}

export default CleanupProcessor