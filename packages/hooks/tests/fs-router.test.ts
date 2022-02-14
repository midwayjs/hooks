import { getApiTrigger, HttpTrigger } from '../src'
import { IMidwayKoaApplication } from '@midwayjs/koa'
import { closeApp, createApp, createHttpRequest } from './utils'
import * as index from './fixtures/fs-router/src/api/index'
import { args } from '@midwayjs/rpc'
import supertest from 'supertest'

describe('test koa with fs-router', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    app = await createApp('fs-router')
  })

  afterAll(async () => {
    await closeApp(app)
  })

  function createRequest(api: any): supertest.Test {
    const trigger = getApiTrigger(api) as HttpTrigger
    return createHttpRequest(app)[trigger.method.toLowerCase()](trigger.path)
  }

  test('hello world', async () => {
    const result = await createRequest(index.hello)
    expect(result.status).toEqual(200)
    expect(result.text).toEqual('Hello World!')
  })

  test('api case', async () => {
    const get = await createRequest(index.get)
    expect(get.status).toEqual(200)
    expect(get.text).toEqual('/get')

    const post = await createRequest(index.post).send(args('foo'))
    expect(post.status).toEqual(200)
    expect(post.body).toEqual({
      path: '/post',
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
