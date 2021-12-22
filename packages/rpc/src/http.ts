import type {
  HttpTrigger,
  RequestArgs,
  HttpInputMetadata,
  HttpRequestOptions,
} from '@midwayjs/hooks-core'
import { buildRPCArgs, parseRequestArgs } from './util'
import compose from 'koa-compose'
import { client, Context, Middleware } from './client'

export async function http(
  ...requestArgs: RequestArgs<HttpTrigger, HttpInputMetadata | any>
) {
  const options = buildRequestOptions(requestArgs)
  const handler: Middleware = async (ctx, next) => {
    ctx.res = await client.fetcher(options)
    return next()
  }
  const ctx: Context = { req: options, res: null }
  const stack = [...client.middleware, handler]
  await compose(stack)(ctx)

  return ctx.res
}

export function buildRequestOptions(
  requestArgs: RequestArgs<HttpTrigger, HttpInputMetadata | any>
) {
  const {
    route: { trigger },
    inputMetadata,
    args,
  } = parseRequestArgs(requestArgs)

  const options: HttpRequestOptions = {
    method: trigger.method,
    url:
      typeof inputMetadata?.params === 'object'
        ? format(trigger.path, inputMetadata.params)
        : trigger.path,
    data: args.length > 0 ? buildRPCArgs(args) : null,

    query: inputMetadata?.query,
    headers: inputMetadata?.headers,

    withCredentials: client.withCredentials,
    baseURL: client.baseURL,
  }

  return options
}

export function format(url: string, params: Record<string, string>) {
  let result = url
  for (const key in params) {
    result = result.replace(`:${key}`, params[key])
  }
  return result
}
