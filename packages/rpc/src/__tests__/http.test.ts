import {
  HttpInputMetadata,
  HttpTrigger,
  RequestRoute,
} from '@midwayjs/hooks-core'
import { http, Middleware, setupHttpClient } from '..'

import { buildRequestOptions, format } from '../http'

it('format', () => {
  expect(format('/foo/:bar', { bar: 'baz' })).toBe('/foo/baz')
  expect(format('/:foo/:bar', { foo: 'baz', bar: 'qux' })).toBe('/baz/qux')
  expect(format('/:foo/:bar', { foo: 'baz', bar: 'qux', qux: 'quux' })).toBe(
    '/baz/qux'
  )
})

it('buildRequestOptions', () => {
  const options = buildRequestOptions([
    'a',
    'b',
    {
      params: {
        bar: 'baz',
      },
    } as HttpInputMetadata,
    {
      trigger: {
        path: '/foo/:bar',
        method: 'GET',
      },
      useInputMetadata: true,
    } as RequestRoute<HttpTrigger>,
  ])

  expect(options).toMatchSnapshot()

  const options2 = buildRequestOptions([
    {
      trigger: {
        path: '/foo',
        method: 'GET',
      },
      useInputMetadata: false,
    } as RequestRoute<HttpTrigger>,
  ])

  expect(options2).toMatchSnapshot()
})

describe('http', () => {
  test('normal', async () => {
    const fetcher = jest.fn()
    fetcher.mockReturnValue({ isTest: true })
    setupHttpClient({ fetcher })
    const response = await http({
      trigger: {
        path: '/foo',
        method: 'GET',
      },
      useInputMetadata: false,
    } as RequestRoute<HttpTrigger>)

    expect(fetcher).toBeCalledTimes(1)
    expect(fetcher.mock.calls).toMatchSnapshot()
    expect(response).toEqual({ isTest: true })
  })

  test('withMiddleware', async () => {
    const fetcher = jest.fn()
    fetcher.mockReturnValue({ isTest: true })

    const middleware: Middleware = async (ctx, next) => {
      expect(ctx.req.method).toEqual('GET')
      expect(ctx.req.url).toEqual('/foo')
      await next()
      expect(ctx.res).toEqual({ isTest: true })
      ctx.res = { ...ctx.res, isMiddleware: true }
    }
    setupHttpClient({ fetcher, middleware: [middleware] })

    const response = await http({
      trigger: {
        path: '/foo',
        method: 'GET',
      },
      useInputMetadata: false,
    } as RequestRoute<HttpTrigger>)
    expect(fetcher).toBeCalledTimes(1)
    expect(response).toEqual({ isTest: true, isMiddleware: true })
  })
})
