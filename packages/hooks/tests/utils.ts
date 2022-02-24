import { join } from 'path'
import { Framework, IMidwayKoaApplication } from '@midwayjs/koa'
import { close, createApp as createMockApp } from '@midwayjs/mock'
import { setProjectRoot } from '../src/internal'

export async function createApp(name: string): Promise<IMidwayKoaApplication> {
  const fixture = join(__dirname, 'fixtures', name)
  setProjectRoot(fixture)
  return createMockApp<Framework>(fixture)
}

export async function closeApp(app: IMidwayKoaApplication) {
  return close(app)
}

export { createHttpRequest } from '@midwayjs/mock'
