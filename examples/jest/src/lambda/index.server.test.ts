import {
  createApp as createMockApp,
  close,
  createHttpRequest as supertest,
} from '@midwayjs/mock'
import { Framework, IMidwayKoaApplication } from '@midwayjs/koa'
import { join } from 'path'
import { remove } from 'fs-extra'

describe('test new features', () => {
  let app: IMidwayKoaApplication
  beforeAll(async () => {
    const rootDir = join(__dirname, '../..')
    app = await createApp(rootDir)
  })

  afterAll(async () => {
    await closeApp(app)
  })

  it('decorator should work', async () => {
    const result = await supertest(app)
      .get('/set_header')
      .query({ name: 'harry' })
    expect(result.status).toEqual(200)
    expect(result.text).toEqual('bbb')
    expect(result.headers['bbb']).toEqual('aaa')
    expect(result.headers['ccc']).toEqual('ddd')
  })

  it('hooks func should return expect result', async () => {
    await supertest(app).get('/api').expect(200, 'Hello World')
    await supertest(app).get('/api/getPath').expect(200, '/api/getPath')
    await supertest(app)
      .post('/api/post')
      .send({ args: ['hello'] })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        method: 'POST',
        name: 'hello',
      })
  })
})

export async function createApp(cwd?: string, options = {}) {
  return await createMockApp<Framework>(cwd, options, Framework)
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
