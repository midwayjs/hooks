import { HooksDevComponent } from './dev'
import staticCache from 'koa-static-cache'
import { join } from 'upath'
import { consola } from '../lib'

export class HooksProductionComponent extends HooksDevComponent {
  useGlobalMiddleware(app: any) {
    super.useGlobalMiddleware(app)

    if (!this.isFullStackProject()) {
      return
    }

    if (this.existRootPath) {
      return
    }

    const baseDir = app.getBaseDir()
    const dist = join(baseDir, '..', this.internal.build.viteOutDir)
    const mw = staticCache({
      dir: dist,
      dynamic: true,
      alias: {
        '/': 'index.html',
      },
      buffer: true,
      gzip: true,
    })
    app.use(mw)
  }

  afterCreate() {
    if (!this.isFullStackProject()) {
      return
    }

    if (this.existRootPath) {
      consola.debug(
        'The route `/` or `/*` is registered, you need to host the front-end page manually'
      )
      return
    }

    this.registerApiFunction({
      containerId: 'hooks:host',
      httpMethod: 'GET',
      httpPath: '/*',
      fn: async () => {},
    })
  }

  get existRootPath() {
    const { routes } = this.router
    return routes.has('/') || routes.has('/*')
  }
}
