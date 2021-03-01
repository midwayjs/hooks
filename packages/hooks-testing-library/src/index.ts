import { createApp as createWebApp, close } from '@midwayjs/mock'
import { IMidwayApplication } from '@midwayjs/core'
import {
  getConfig,
  getProjectRoot,
  als,
  HooksContext,
} from '@midwayjs/hooks-core'
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
  // TODO Should invoke function call
  async runFunction<T extends (...args: any) => any>(func: T) {
    return await als.run(this.mockContext(), () => func())
  }

  async runHooks<T extends (...args: any) => any>(hooks: T) {
    return await als.run(this.mockContext(), () => hooks())
  }

  request() {}

  mockContext(): HooksContext {
    return {
      ctx: {},
    }
  }

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
