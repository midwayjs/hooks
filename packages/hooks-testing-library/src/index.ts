import { createApp as createWebApp, close } from '@midwayjs/mock'
import { IMidwayApplication } from '@midwayjs/core'
import { getConfig, getProjectRoot } from '@midwayjs/hooks-core'
import { join } from 'path'
import { remove } from 'fs-extra'

export async function createApp(baseDir?: string) {
  const root = getProjectRoot(baseDir)
  const config = getConfig(baseDir)
  // TODO createFunctionApp
  const app: IMidwayApplication<any> = await createWebApp(
    root,
    {},
    config.framework
  )
  return new HooksApplication(app)
}

class HooksApplication {
  private app: IMidwayApplication<any>
  constructor(app: IMidwayApplication<any>) {
    this.app = app
  }

  // TODO Allow pass user define context
  runFunction<T extends (...args: any) => any>() {}

  async close() {
    await close(this.app)
    if (process.env.EGG_HOME) {
      await remove(join(process.env.EGG_HOME, 'logs'))
    }
    const appDir = this.app?.getAppDir()
    if (appDir) {
      await remove(join(appDir, 'logs'))
      await remove(join(appDir, 'run'))
    }
  }
}
