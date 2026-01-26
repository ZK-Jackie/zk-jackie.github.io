/**
 * Run command processor
 */
export class RuncmdProcessor {
  constructor(config) {
    this.config = config
    this.stats = {
      errors: []
    }
    // Set concurrency limit, default 10 concurrent operations
    this.concurrencyLimit = config.concurrency || 10
    this.cmds = Array.isArray(config.cmd) ? config.cmd : [config.cmd]
  }
}

export default RuncmdProcessor