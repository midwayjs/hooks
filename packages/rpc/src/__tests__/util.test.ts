import {
  HttpInputMetadata,
  HttpTrigger,
  RequestRoute,
} from '@midwayjs/hooks-core'
import { buildArgs, parseRequestArgs } from '../util'

test('buildRPCArgs', () => {
  expect(() => buildArgs(null)).toThrowError('args must be an array')
  expect(buildArgs([])).toEqual({ args: [] })
  expect(buildArgs(['a', 'b'])).toEqual({ args: ['a', 'b'] })
})

test('parseRequestArgs useInputMetadata', () => {
  const { route, inputMetadata, args } = parseRequestArgs([
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

  expect(route).toEqual({
    trigger: {
      path: '/foo/:bar',
      method: 'GET',
    },
    useInputMetadata: true,
  })

  expect(inputMetadata).toEqual({
    params: {
      bar: 'baz',
    },
  })

  expect(args).toEqual(['a', 'b'])
})

test('parseRequestArgs without useInputMetadata', () => {
  const { route, inputMetadata, args } = parseRequestArgs([
    'a',
    'b',
    {
      params: {
        bar: 'baz',
      },
    },
    {
      trigger: {
        path: '/foo/:bar',
        method: 'GET',
      },
      useInputMetadata: false,
    } as RequestRoute<HttpTrigger>,
  ])

  expect(route).toEqual({
    trigger: {
      path: '/foo/:bar',
      method: 'GET',
    },
    useInputMetadata: false,
  })

  expect(inputMetadata).toEqual(null)

  expect(args).toEqual([
    'a',
    'b',
    {
      params: {
        bar: 'baz',
      },
    },
  ])
})
