import { bind } from '..'
import { withController } from '../../'

describe('runtime api', () => {
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
