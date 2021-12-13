import { ApiRoute, HttpTriggerType } from '@midwayjs/hooks-core'
import {
  AbstractBundlerAdapter,
  createBundlerPlugin,
} from '@midwayjs/unplugin-hooks'
import { getConfig, getProjectRoot } from './internal'
import { normalizeUrl } from './api/component'

class MidwayBundlerAdapter extends AbstractBundlerAdapter {
  override transformApiRoutes(apis: ApiRoute[]): ApiRoute[] {
    for (const api of apis) {
      if (api.trigger.type === HttpTriggerType) {
        api.trigger.path = normalizeUrl(api)
      }
    }
    return apis
  }
}

const root = getProjectRoot()
const { source, routes } = getConfig()

const midwayBundlerAdapter = new MidwayBundlerAdapter({
  name: '@midwayjs/hooks-bundler',
  root,
  source,
  routes,
})

const plugin = createBundlerPlugin(midwayBundlerAdapter)

export const webpack = plugin.webpack
export const vite = plugin.vite
