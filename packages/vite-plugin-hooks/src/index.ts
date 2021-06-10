import { VitePlugin } from './plugin'

function createPlugin() {
  return new VitePlugin()
}

module.exports = createPlugin
export default createPlugin
export { VitePlugin }
