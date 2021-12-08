import { IMidwayKoaApplication } from '@midwayjs/koa'

import { creatApp, closeApp, createHttpRequest } from './utils'

describe('test koa', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    app = await creatApp('koa')
  })

  afterAll(async () => {
    await closeApp(app)
  })

  test('hello world', async () => {
    const result = await createHttpRequest(app).get('/hello')
    expect(result.status).toEqual(200)
    expect(result.text).toEqual('Hello World!')
  })

  test('decorate case', async () => {
    const get = await createHttpRequest(app).get('/get')
    expect(get.status).toEqual(200)
    expect(get.text).toEqual('/get')

    const post = await createHttpRequest(app)
      .post('/post')
      .send({ args: ['foo'] })
    expect(post.status).toEqual(200)
    expect(post.body).toEqual({
      path: '/post',
      input: 'foo',
    })
  })

  test('use validator', async () => {
    const { status } = await createHttpRequest(app)
      .post('/post')
      .send({ args: [false] })

    expect(status).toEqual(422)
  })

  test('with middleware', async () => {
    const { header } = await createHttpRequest(app).get('/withMiddleware')
    expect(header.global).toBeTruthy()
    expect(header.module).toBeTruthy()
    expect(header.function).toBeTruthy()
  })
})
