import { join } from 'path'

import { IMidwayApplication, IMidwayFramework } from '@midwayjs/core'
import {
  ApiFunction,
  getConfig,
  getProjectRoot,
  ProjectConfig,
  validateFunction,
} from '@midwayjs/hooks-core'
import {
  close,
  createApp as createWebApp,
  createFunctionApp as createFaaSApp,
  createHttpRequest,
} from '@midwayjs/mock'

export type CreateAppOption = {
  root?: string
}

async function createAppImplementation(
  options: CreateAppOption,
  isFunction: boolean
) {
  const root = getProjectRoot(options?.root ?? (global as any).testPath)
  const config = getConfig(root)

  if (options?.root) {
    delete options?.root
  }

  const cwd = process.cwd()
  process.chdir(root)

  const creator = isFunction ? createFaaSApp : createWebApp

  const app: IMidwayApplication<any> = await creator(
    root,
    Object.assign(
      {
        baseDir: join(root, config.source),
      },
      options
    )
  )

  process.chdir(cwd)
  return new HooksApplication(app, config)
}

export async function createApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'] & CreateAppOption
>(options?: U) {
  return createAppImplementation(options, false)
}

export async function createFunctionApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'] & CreateAppOption
>(options?: U) {
  return createAppImplementation(options, true)
}

export class HooksApplication {
  private readonly app: IMidwayApplication<any>
  private config: ProjectConfig
  constructor(app: IMidwayApplication<any>, config: ProjectConfig) {
    this.app = app
    this.config = config
  }

  async runFunction<T extends ApiFunction>(
    fn: T,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    validateFunction(fn, 'fn')

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
    validateFunction(fn, 'fn')

    const supertest = createHttpRequest(this.app)
    if (args.length === 0) {
      return supertest.get(fn._param.url)
    }

    return supertest
      .post(fn._param.url)
      .send({ args })
      .set('Content-Type', 'application/json')
  }

  async close() {
    await close(this.app)
  }
}
