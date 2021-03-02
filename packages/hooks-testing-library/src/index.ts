import {
  createApp as createWebApp,
  close,
  createHttpRequest,
} from '@midwayjs/mock'
import { IMidwayApplication } from '@midwayjs/core'
import { getConfig, getProjectRoot, EnhancedFunc } from '@midwayjs/hooks-core'
import { join } from 'path'
import { remove } from 'fs-extra'

export async function createApp(baseDir?: string) {
  const root = getProjectRoot(baseDir)
  const config = getConfig(baseDir)

  const app: IMidwayApplication<any> = await createWebApp(root, {
    baseDir: join(root, config.source),
  })

  return new HooksApplication(app)
}

export class HooksApplication {
  private readonly app: IMidwayApplication<any>
  constructor(app: IMidwayApplication<any>) {
    this.app = app
  }

  // TODO Allow pass user define context
  async runFunction<T extends EnhancedFunc>(fn: T, ...args: Parameters<T>) {
    const response = await this.request(fn, ...args)
    if (response.type === 'application/json') {
      return response.body
    }
    return response.text
  }

  request<T extends EnhancedFunc>(fn: T, ...args: Parameters<T>) {
    const supertest = createHttpRequest(this.app)
    if (fn._param.method === 'GET') {
      return supertest.get(fn._param.url)
    }

    return supertest
      .post(fn._param.url)
      .send({ args })
      .set('Content-Type', 'application/json')
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
