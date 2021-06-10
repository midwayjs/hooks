import { VitePlugin } from './plugin'

function createPlugin() {
  return new VitePlugin()
}

exports = module.exports = createPlugin
export default createPlugin
export { VitePlugin }
