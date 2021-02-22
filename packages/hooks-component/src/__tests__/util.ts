import { createApp as createMockApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/koa'
import { join } from 'path'
import { remove } from 'fs-extra'

export async function createApp(name: string, options = {}) {
  const baseDir = join(__dirname, 'fixtures', name)
  return await createMockApp<Framework>(baseDir, options, Framework)
}

export async function closeApp(app) {
  await close(app)
  if (process.env.EGG_HOME) {
    await remove(join(process.env.EGG_HOME, 'logs'))
  }
  if (app?.getAppDir()) {
    await remove(join(app?.getAppDir(), 'logs'))
    await remove(join(app?.getAppDir(), 'run'))
  }
}

export { createHttpRequest as supertest } from '@midwayjs/mock'
