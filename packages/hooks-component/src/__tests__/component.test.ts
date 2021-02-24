import { createHooksComponent } from '..'
import { IMidwayKoaApplication } from '@midwayjs/koa'
import { createApp, closeApp, supertest } from './util'

describe('hooks component', () => {
  it('should exist', () => {
    expect(createHooksComponent).toBeInstanceOf(Function)
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
