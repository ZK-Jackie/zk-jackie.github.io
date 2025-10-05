import path from 'path'
import config from './config.js'
import FileFilter from './lib/file-filter.js'
import ProcessorManager from './lib/processor-manager.js'
import ReportProcessor from './lib/report-processor.js'

/**
 * Pipeline entry point
 */
async function pipeline() {
  const cwd = config.global.basePath
  const distPath = path.resolve(cwd, config.global.distPath)

  console.log(`🚀 Start running pipeline: ${config.target || 'compression'}`)
  console.log(`📁 Current workdir: ${cwd}`)
  console.log(`📂 Default dist path: ${distPath}\n`)

  try {
    // Initialize core components
    const fileFilter = new FileFilter(config.global.globalIgnorePatterns)
    const reportProcessor = new ReportProcessor(config.reporting)
    const processorManager = new ProcessorManager(config, fileFilter, reportProcessor)

    // Display enabled processors
    const enabledProcessors = processorManager.getEnabledProcessors()
    console.log(`📋 Enabled processors: ${enabledProcessors.join(', ')}`)

    // Execute all enabled processors
    const results = await processorManager.runAll(cwd, distPath)

    // Generate final report
    console.log('\n📊 Generating processing report...')
    reportProcessor.generateReport()
    
    // Display execution summary
    console.log('\n✅ Pipeline execution completed!')
    console.log(`\n🎯 Processed ${results.size} processors`)
    
  } catch (error) {
    console.error('\n\n❌ Pipeline Error: ', error.message)
    if (config.global.verbose) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Start optimization process
pipeline().catch(error => {
  console.error('\n\n❌ Error: ', error.message)
  if (config.global.verbose) {
    console.error(error.stack)
  }
  process.exit(1)
})