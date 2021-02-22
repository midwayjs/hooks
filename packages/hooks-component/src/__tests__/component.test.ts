import { createHooks, fnMap } from '..'
import {
  createApp as createMockApp,
  close,
  createHttpRequest,
} from '@midwayjs/mock'
import { Framework, IMidwayKoaApplication } from '@midwayjs/koa'
import { join } from 'path'
import { remove } from 'fs-extra'

async function createApp(name: string, options = {}) {
  const baseDir = join(__dirname, 'fixtures', name)
  return createMockApp<Framework>(baseDir, options, Framework)
}

async function closeApp(app) {
  await close(app)
  if (process.env.EGG_HOME) {
    await remove(join(process.env.EGG_HOME, 'logs'))
  }
  if (app?.getAppDir()) {
    await remove(join(app?.getAppDir(), 'logs'))
    await remove(join(app?.getAppDir(), 'run'))
  }
}

describe('hooks component', () => {
  it('should exist', () => {
    expect(createHooks).toBeInstanceOf(Function)
  })
})

describe('test new features', () => {
  let app: IMidwayKoaApplication
  beforeAll(async () => {
    app = await createApp('web/base-app')
  })

  afterAll(async () => {
    await closeApp(app)
  })

  it('test setHeader decorator', async () => {
    const result = await createHttpRequest(app)
      .get('/set_header')
      .query({ name: 'harry' })
    expect(result.status).toEqual(200)
    expect(result.text).toEqual('bbb')
    expect(result.headers['bbb']).toEqual('aaa')
    expect(result.headers['ccc']).toEqual('ddd')
  })

  it('test hooks func', async () => {
    await createHttpRequest(app).get('/api').expect(200, 'Hello World')
  })

  it('get fn from map', () => {
    const lambda = require('./fixtures/web/base-app/src/lambda')
    expect(fnMap.get(lambda.default)).toMatchInlineSnapshot(`
      Object {
        "containerId": "hooks_func::index",
        "httpMethod": "GET",
        "httpPath": "/api",
      }
    `)
  })
})
