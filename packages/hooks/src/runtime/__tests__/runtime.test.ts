import { bind, call } from '..'
import { withController } from '../../'
import { FaaSContext } from '@midwayjs/faas'

describe('bind', () => {
  it('bind should exist', () => {
    expect(bind).toBeTruthy()
  })

  it('should support bind context', () => {
    const ctx = { from: 'bind' }
    const handler = function (this: any) {
      return this
    }
    const bound = bind(handler, ctx)
    expect(bound()).toEqual(ctx)
  })

  it('not function inputs should be returned as is', () => {
    const obj = { is: 'obj' } as any
    expect(bind(obj, {})).toEqual(obj)
  })

  it('function should copy properties', () => {
    const middleware = [{ is: 'middleware' }]
    const handler = withController(
      {
        middleware,
      },
      async function () {}
    )

    const target = bind(handler, {})
    expect(target.middleware).toBeInstanceOf(Array)
    expect(target.middleware[0]).toEqual({ is: 'middleware' })
  })
})

describe('call', () => {
  it('call should exist', () => {
    expect(call).toBeTruthy()
  })

  it('should call internal hooks', () => {
    const mockContext = {
      hooks: {
        useConfig: jest.fn(),
      } as any,
    } as Partial<FaaSContext>
    call('useConfig', { ctx: mockContext })()
    expect(mockContext.hooks.useConfig).toBeCalled()
  })
})
