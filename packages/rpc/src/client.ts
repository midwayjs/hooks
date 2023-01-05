import type {
  BaseTrigger,
  RawRequestOptions,
  RequestArgs,
} from '@midwayjs/hooks-core'
import { Middleware, RequestContext } from './type'
import compose from 'koa-compose'
import { parseRequestArgs } from './util'

export type RequestOptionsCreator<T> = (req: RawRequestOptions) => T

export function createClient<
  T extends RequestContext<any>,
  R = T extends RequestContext<infer Req> ? Req : null
>(
  requestOptionsCreator: RequestOptionsCreator<R>,
  getMiddlewares: () => Middleware<T>[]
) {
  return async (...requestArgs: RequestArgs<BaseTrigger, any>) => {
    const rawOptions = parseRequestArgs(requestArgs)
    const req = requestOptionsCreator(rawOptions)

    const ctx = { req, res: null } as unknown as T
    const middlewares = getMiddlewares()
    await compose(middlewares)(ctx)

    return ctx.res
  }
}
