const NodeEnvironment = require('jest-environment-node')

class MidwayHooksEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context)
    this.global.testPath = context.testPath
  }
}

module.exports = MidwayHooksEnvironment
