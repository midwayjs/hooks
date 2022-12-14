import { Framework, IMidwayKoaApplication } from '@midwayjs/koa'
import { close, createApp as createMockApp } from '@midwayjs/mock'
import { setProjectRoot } from '@midwayjs/hooks-internal'

export async function createApp(
  fixture: string
): Promise<IMidwayKoaApplication> {
  setProjectRoot(fixture)
  return createMockApp<Framework>(fixture)
}

export async function closeApp(app: IMidwayKoaApplication) {
  return close(app)
}
