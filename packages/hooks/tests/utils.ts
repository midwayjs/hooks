import { join } from 'path'
import * as koaModule from '@midwayjs/koa'
import {
  Framework,
  IMidwayKoaApplication,
  IMidwayKoaConfigurationOptions,
} from '@midwayjs/koa'
import { close, createApp as createMockApp } from '@midwayjs/mock'
import { setProjectRoot } from '../src'

export async function createApp(
  name: string,
  options: IMidwayKoaConfigurationOptions = {}
): Promise<IMidwayKoaApplication> {
  const fixture = join(__dirname, 'fixtures', name)
  setProjectRoot(fixture)
  return createMockApp<Framework>(fixture, options, koaModule)
}

export async function closeApp(app) {
  return close(app)
}

export { createHttpRequest } from '@midwayjs/mock'
