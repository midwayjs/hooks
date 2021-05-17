import { join } from 'path'

import { IMidwayApplication, IMidwayFramework } from '@midwayjs/core'
import {
  getConfig,
  getProjectRoot,
  ApiFunction,
  InternalConfig,
} from '@midwayjs/hooks-core'
import {
  createApp as createWebApp,
  close,
  createHttpRequest,
} from '@midwayjs/mock'

import { SuperJSONPlugin } from './plugin'

async function createAppImplementation<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(options: U, isFunction: boolean) {
  const root = getProjectRoot((global as any).testPath)
  const config = getConfig(root)

  const cwd = process.cwd()
  process.chdir(root)

  const app: IMidwayApplication<any> = await createWebApp(
    root,
    Object.assign(
      {
        baseDir: join(root, config.source),
      },
      options
    ),
    isFunction && '@midwayjs/serverless-app'
  )

  process.chdir(cwd)
  return new HooksApplication(app, config)
}

export async function createApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(options?: U) {
  return createAppImplementation<T, U>(options, false)
}

export async function createFunctionApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(options?: U) {
  return createAppImplementation(options, true)
}

export class HooksApplication {
  private readonly app: IMidwayApplication<any>
  private config: InternalConfig
  constructor(app: IMidwayApplication<any>, config: InternalConfig) {
    this.app = app
    this.config = config
  }

  async runFunction<T extends ApiFunction>(
    fn: T,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    const response = await this.request(fn, ...args)

    if (!response.ok) {
      throw response.body
    }

    if (response.type === 'application/json') {
      return response.body
    }

    return response.text
  }

  request<T extends ApiFunction>(fn: T, ...args: Parameters<T>) {
    const supertest = createHttpRequest(this.app)
    if (args.length === 0) {
      return supertest
        .get(fn._param.url)
        .use(SuperJSONPlugin(this.config.superjson))
    }

    return supertest
      .post(fn._param.url)
      .use(SuperJSONPlugin(this.config.superjson))
      .send({ args })
      .set('Content-Type', 'application/json')
  }

  async close() {
    await close(this.app)
  }
}
