import { IMidwayKoaApplication } from '@midwayjs/koa'
import { closeApp, creatApp, createHttpRequest } from './utils'

describe('test koa with decorate-router', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    app = await creatApp('decorate-router')
  })

  afterAll(async () => {
    await closeApp(app)
  })

  test('decorate case', async () => {
    const get = await createHttpRequest(app).get('/rpc/get')
    expect(get.status).toEqual(200)
    expect(get.text).toEqual('/rpc/get')

    const post = await createHttpRequest(app)
      .post('/rpc/post')
      .send({ args: ['foo'] })

    expect(post.status).toEqual(200)
    expect(post.body).toEqual({
      path: '/rpc/post',
      input: 'foo',
    })
  })

  test('use validator', async () => {
    const { status } = await createHttpRequest(app)
      .post('/rpc/post')
      .send({ args: [false] })

    expect(status).toEqual(422)
  })

  test('with middleware', async () => {
    const { header } = await createHttpRequest(app).get('/rpc/withMiddleware')
    expect(header.global).toBeTruthy()
    expect(header.module).toBeTruthy()
    expect(header.function).toBeTruthy()
  })

  test('withHttpDecorator', async () => {
    const { status, text, header, type } = await createHttpRequest(app).get(
      '/rpc/withHttpDecorator'
    )
    expect(text).toEqual('withHttpCode')
    expect(header.from).toEqual('operator')
    expect(header.framework).toEqual('koa')
    expect(type).toEqual('text/html')
    expect(status).toEqual(201)
  })

  test('withRedirectDecorator', async () => {
    const { status, text, header } = await createHttpRequest(app).get(
      '/rpc/withRedirectDecorator'
    )
    expect(status).toEqual(301)
    expect(header.location).toEqual('/redirect')
    expect(text).toEqual('withRedirectDecorator')
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
