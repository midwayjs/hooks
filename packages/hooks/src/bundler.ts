import { ApiRoute, HttpTriggerType } from '@midwayjs/hooks-core'
import {
  AbstractBundlerAdapter,
  createBundlerPlugin,
} from '@midwayjs/unplugin-hooks'
import { normalizeUrl } from './api/component'
import { getRouter } from './internal/router'

class MidwayBundlerAdapter extends AbstractBundlerAdapter {
  override transformApiRoutes(apis: ApiRoute[]): ApiRoute[] {
    for (const api of apis) {
      if (api.trigger.type === HttpTriggerType) {
        api.trigger.path = normalizeUrl(this.getRouter(), api)
      }
    }
    return apis
  }
}

const router = getRouter()

const midwayBundlerAdapter = new MidwayBundlerAdapter({
  name: '@midwayjs/hooks-bundler',
  router,
})

const plugin = createBundlerPlugin(midwayBundlerAdapter)

export const webpack = plugin.webpack
export const vite = plugin.vite
