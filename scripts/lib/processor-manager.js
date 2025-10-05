import path from 'path'
import JavaScriptProcessor from './javascript-processor.js'
import HTMLProcessor from './html-processor.js'
import CleanupProcessor from './cleanup-processor.js'
import CompressionProcessor from './compression-processor.js'

/**
 * Processor Manager
 * Unified management of all processors' creation, execution, and result collection
 */
export class ProcessorManager {
  constructor(config, fileFilter, reportProcessor) {
    this.config = config
    this.fileFilter = fileFilter
    this.reportProcessor = reportProcessor
    this.processors = new Map()
    this.initializeProcessors()
  }

  /**
   * Initialize all processors
   */
  initializeProcessors() {
    const processorConfigs = [
      {
        name: 'javascript',
        processor: JavaScriptProcessor,
        enabled: this.config.javascript?.enabled,
        config: this.config.javascript
      },
      {
        name: 'html',
        processor: HTMLProcessor,
        enabled: this.config.html?.enabled,
        config: this.config.html
      },
      {
        name: 'cleanup',
        processor: CleanupProcessor,
        enabled: this.config.cleanup?.enabled,
        config: this.config.cleanup
      },
      {
        name: 'gzip',
        processor: CompressionProcessor,
        enabled: this.config.gzip?.enabled,
        config: this.config.gzip
      },
      {
        name: 'brotli',
        processor: CompressionProcessor,
        enabled: this.config.brotli?.enabled,
        config: this.config.brotli
      }
    ]

    for (const { name, processor: ProcessorClass, enabled, config } of processorConfigs) {
      if (enabled) {
        this.processors.set(name, {
          class: ProcessorClass,
          config: {
            ...config,
            verbose: this.config.global.verbose,
            basePath: this.config.global.basePath
          }
        })
      }
    }
  }

  /**
   * Execute all enabled processors
   * @param {string} cwd - Current working directory
   * @param {string} distPath - Build output directory
   */
  async runAll(cwd, distPath) {
    const results = new Map()

    for (const [name, { class: ProcessorClass, config }] of this.processors) {
      try {
        console.log(`\n🔄 Executing ${name} processor...`)
        
        const processor = new ProcessorClass(config, this.fileFilter)
        const targetPath = path.resolve(cwd, config.path || distPath)
        
        // Special handling for CSS check (usually skipped)
        if (name === 'css') {
          await this.handleCssCheck(targetPath, config)
          continue
        }
        
        const stats = await processor.process(targetPath)
        results.set(name, stats)
        
        // Add statistics to report
        this.reportProcessor.addStats(name, stats)
        
      } catch (error) {
        console.error(`❌ ${name} processor execution failed:`, error.message)
        if (this.config.global.verbose) {
          console.error(error.stack)
        }
        
        results.set(name, {
          errors: [error.message],
          fileCount: 0
        })
      }
    }

    return results
  }

  /**
   * Handle CSS check logic
   * @param {string} targetPath - Target path
   * @param {object} config - CSS configuration
   */
  async handleCssCheck(targetPath, config) {
    console.log('🎨 Checking CSS files...')
    const cssFiles = await this.fileFilter.findFiles(
      targetPath,
      config.extensions,
      config.ignorePatterns
    )
    console.log(`📄 Found ${cssFiles.length} CSS files`)
    if (cssFiles.length > 0) {
      console.log('ℹ️  CSS files are usually already optimized by Astro, skipping additional processing')
    }
  }

  /**
   * Get list of enabled processors
   * @returns {string[]} Array of processor names
   */
  getEnabledProcessors() {
    return Array.from(this.processors.keys())
  }

  /**
   * Check if specified processor is enabled
   * @param {string} name - Processor name
   * @returns {boolean} Whether it is enabled
   */
  isProcessorEnabled(name) {
    return this.processors.has(name)
  }

  /**
   * Run specified processor
   * @param {string} name - Processor name
   * @param {string} cwd - Current working directory
   * @param {string} distPath - Build output directory
   * @returns {Promise<object>} Processing result
   */
  async runProcessor(name, cwd, distPath) {
    if (!this.processors.has(name)) {
      throw new Error(`Processor '${name}' is not enabled or does not exist`)
    }

    const { class: ProcessorClass, config } = this.processors.get(name)
    const processor = new ProcessorClass(config, this.fileFilter)
    const targetPath = path.resolve(cwd, config.path || distPath)
    
    return await processor.process(targetPath)
  }
}

export default ProcessorManager