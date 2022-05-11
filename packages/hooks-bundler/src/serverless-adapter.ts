import { createExpressDevPack } from '@midwayjs/dev-pack'
import { MidwayBundlerAdapter } from './adapter'
import { join } from 'path'
import { createBundlerPlugin } from '@midwayjs/bundler'

export class MidwayServerlessBundlerAdapter extends MidwayBundlerAdapter {
  override getUnplugin() {
    const unplugin = super.getUnplugin()
    unplugin.vite.configureServer = async (server: any) => {
      const { middleware } = await createExpressDevPack({
        cwd: this.root,
        sourceDir: join(this.root, this.projectConfig.source),
        watch: true,
      })

      server.middlewares.use(middleware)
    }
    return unplugin
  }
}

export const plugin = createBundlerPlugin(new MidwayServerlessBundlerAdapter())
