import {
  HttpInputMetadata,
  HttpTrigger,
  RequestRoute,
} from '@midwayjs/hooks-core'
import { http, Middleware, setupHttpClient } from '..'

import { creator, format } from '../http'
import { HttpContext } from '../type'
import { parseRequestArgs } from '../util'

it('format', () => {
  expect(format('/foo/:bar', { bar: 'baz' })).toBe('/foo/baz')
  expect(format('/:foo/:bar', { foo: 'baz', bar: 'qux' })).toBe('/baz/qux')
  expect(format('/:foo/:bar', { foo: 'baz', bar: 'qux', qux: 'quux' })).toBe(
    '/baz/qux'
  )
})

it('parseRequestArgs & creator', () => {
  const rawOptions = parseRequestArgs([
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

  expect(rawOptions).toMatchSnapshot()
  expect(creator(rawOptions)).toMatchSnapshot()

  const rawOptions2 = parseRequestArgs([
    {
      trigger: {
        path: '/foo',
        method: 'GET',
      },
      useInputMetadata: false,
    } as RequestRoute<HttpTrigger>,
  ])

  expect(rawOptions2).toMatchSnapshot()
  expect(creator(rawOptions2)).toMatchSnapshot()
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

    const middleware: Middleware<HttpContext> = async (ctx, next) => {
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
