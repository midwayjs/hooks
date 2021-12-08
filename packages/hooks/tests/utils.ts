import { join } from 'path'
import {
  IMidwayKoaConfigurationOptions,
  Framework,
  IMidwayKoaApplication,
} from '@midwayjs/koa'
import * as koaModule from '@midwayjs/koa'
import { createApp, close } from '@midwayjs/mock'

export async function creatApp(
  name: string,
  options: IMidwayKoaConfigurationOptions = {}
): Promise<IMidwayKoaApplication> {
  const app = join(__dirname, 'fixtures', name)
  process.chdir(app)
  return createApp<Framework>(app, options, koaModule)
}

export async function closeApp(app) {
  return close(app)
}

export { createHttpRequest } from '@midwayjs/mock'
