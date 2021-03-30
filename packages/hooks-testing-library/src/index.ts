import {
  createApp as createWebApp,
  close,
  createHttpRequest,
} from '@midwayjs/mock'
import { IMidwayApplication } from '@midwayjs/core'
import {
  getConfig,
  getProjectRoot,
  ApiFunction,
  InternalConfig,
} from '@midwayjs/hooks-core'
import { join } from 'path'
import { SuperJSONPlugin } from './plugin'

export async function createAppImplementation(
  baseDir: string,
  isFunction: boolean
) {
  const root = getProjectRoot(baseDir || (global as any).testPath)
  const config = getConfig(root)

  const cwd = process.cwd()
  process.chdir(root)

  const app: IMidwayApplication<any> = await createWebApp(
    root,
    {
      baseDir: join(root, config.source),
    },
    isFunction && '@midwayjs/serverless-app'
  )

  process.chdir(cwd)
  return new HooksApplication(app, config)
}

export async function createApp(baseDir?: string) {
  return createAppImplementation(baseDir, false)
}

export async function createFunctionApp(baseDir?: string) {
  return createAppImplementation(baseDir, true)
}

export class HooksApplication {
  private readonly app: IMidwayApplication<any>
  private config: InternalConfig
  constructor(app: IMidwayApplication<any>, config: InternalConfig) {
    this.app = app
    this.config = config
  }

  // TODO Allow pass user define context
  async runFunction<T extends ApiFunction>(
    fn: T,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    const response = await this.request(fn, ...args)

    if (!response.ok) {
      throw response.body
    }

    return response.body
  }

  request<T extends ApiFunction>(fn: T, ...args: Parameters<T>) {
    const supertest = createHttpRequest(this.app)
    if (fn._param.method === 'GET') {
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
