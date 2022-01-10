import { join } from 'path'
import * as koaModule from '@midwayjs/koa'
import {
  Framework,
  IMidwayKoaApplication,
  IMidwayKoaConfigurationOptions,
} from '@midwayjs/koa'
import { close, createApp as createMockApp } from '@midwayjs/mock'

export async function createApp(
  name: string,
  options: IMidwayKoaConfigurationOptions = {}
): Promise<IMidwayKoaApplication> {
  const fixture = join(__dirname, 'fixtures', name)
  process.chdir(fixture)
  return createMockApp<Framework>(fixture, options, koaModule)
}

export async function closeApp(app) {
  return close(app)
}

export { createHttpRequest } from '@midwayjs/mock'
