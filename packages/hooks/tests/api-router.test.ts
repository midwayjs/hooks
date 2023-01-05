import { getApiTrigger, HttpTrigger } from '../src'
import {
  closeApp,
  createApp,
  createHttpRequest,
  supertest,
  IMidwayKoaApplication,
} from '@midwayjs/test-util'
import * as index from './fixtures/api-router/src/api/index'
import { args } from '@midwayjs/rpc'
import { HOOKS_DEV_MODULE_PATH } from '@midwayjs/hooks-internal'
import { resolve, join } from 'path'

describe('test koa with api router', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    const fixture = join(__dirname, 'fixtures', 'api-router')
    app = await createApp(fixture)
  })

  afterAll(async () => {
    await closeApp(app)
  })

  function createRequest(api: any): supertest.Test {
    const trigger = getApiTrigger<HttpTrigger>(api)
    const request: supertest.Test = createHttpRequest(app)[
      trigger.method.toLowerCase()
    ](trigger.path)
    request.set('accept', 'application/json')
    return request
  }

  test('get', async () => {
    const get = await createRequest(index.get)
    expect(get.status).toEqual(200)
    expect(get.text).toEqual('/api/get')
  })

  test('post', async () => {
    const post = await createRequest(index.post).send(args('foo'))
    expect(post.status).toEqual(200)
    expect(post.body).toEqual({
      path: '/api/post',
      input: 'foo',
    })
  })

  test('use validator', async () => {
    const { status } = await createRequest(index.post).send(args(false))
    expect(status).toEqual(422)
  })

  test('with middleware', async () => {
    const { header } = await createRequest(index.withMiddleware)
    expect(header.global).toBeTruthy()
    expect(header.module).toBeTruthy()
    expect(header.function).toBeTruthy()
  })

  test('withHttpOperator', async () => {
    const { status, text, header, type } = await createRequest(
      index.withHttpOperator
    )
    expect(text).toEqual('withHttpCode')
    expect(header.from).toEqual('operator')
    expect(header.framework).toEqual('koa')
    expect(type).toEqual('text/html')
    expect(status).toEqual(201)
  })

  test('withRedirectOperator', async () => {
    const { status, text, header } = await createRequest(
      index.withRedirectOperator
    )
    expect(status).toEqual(301)
    expect(header.location).toEqual('/redirect')
    expect(text).toEqual('withRedirectOperator')
  })

  test('withValidateHttp', async () => {
    // Incorrect params format, expect number, but got string
    await createHttpRequest(app)
      .post('/api/withValidateHttp/foo')
      .set('accept', 'application/json')
      .expect(422)

    // Missing Query
    await createHttpRequest(app)
      .post('/api/withValidateHttp/123')
      .set('accept', 'application/json')
      .expect(422)

    // Missing Header
    await createHttpRequest(app)
      .post('/api/withValidateHttp/123')
      .set('accept', 'application/json')
      .query({ isQuery: 'foo' })
      .expect(422)

    // Incorrect data format, expect string, but got number
    await createHttpRequest(app)
      .post('/api/withValidateHttp/123')
      .set('accept', 'application/json')
      .set('isHeader', 'foo')
      .query({ isQuery: 'foo' })
      .send(args(1))
      .expect(422)

    // Valid Case
    const response = await createHttpRequest(app)
      .post('/api/withValidateHttp/123')
      .set('accept', 'application/json')
      .set('isheader', 'foo')
      .query({ isQuery: 'foo' })
      .send(args('Midway'))
      .expect(200)

    expect(response.body).toMatchSnapshot()
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

describe('load dev modules', () => {
  let app: IMidwayKoaApplication

  process.env[HOOKS_DEV_MODULE_PATH] = resolve(
    __dirname,
    './fixtures/api-router/dev'
  )

  beforeEach(async () => {
    const fixture = join(__dirname, 'fixtures', 'api-router')
    app = await createApp(fixture)
  })

  afterEach(async () => {
    await closeApp(app)
  })

  test('load dev modules', async () => {
    const { status, text } = await createHttpRequest(app).get('/dev_only')
    expect(status).toEqual(200)
    expect(text).toEqual('/dev_only')
  })
})
