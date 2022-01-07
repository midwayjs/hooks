import { IMidwayKoaApplication } from '@midwayjs/koa'
import { closeApp, creatApp, createHttpRequest } from './utils'

describe('test koa with fs-router', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    app = await creatApp('fs-router')
  })

  afterAll(async () => {
    await closeApp(app)
  })

  test('hello world', async () => {
    const result = await createHttpRequest(app).get('/hello')
    expect(result.status).toEqual(200)
    expect(result.text).toEqual('Hello World!')
  })

  test('api case', async () => {
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

  test('withHttpOperator', async () => {
    const { status, text, header, type } = await createHttpRequest(app).get(
      '/withHttpOperator'
    )
    expect(text).toEqual('withHttpCode')
    expect(header.from).toEqual('operator')
    expect(header.framework).toEqual('koa')
    expect(type).toEqual('text/html')
    expect(status).toEqual(201)
  })

  test('withRedirectOperator', async () => {
    const { status, text, header } = await createHttpRequest(app).get(
      '/withRedirectOperator'
    )
    expect(status).toEqual(301)
    expect(header.location).toEqual('/redirect')
    expect(text).toEqual('withRedirectOperator')
  })

  test('slot', async () => {
    const { status, body } = await createHttpRequest(app)
      .get('/slot/withSlot')
      .query({ query: 'query' })
      .set('header', 'header')

    expect(status).toEqual(200)

    expect(body.header.header).toEqual('header')
    expect(body.query.query).toEqual('query')
    expect(body.params.slot).toEqual('slot')
  })
})
