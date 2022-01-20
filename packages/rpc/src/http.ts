import type {
  HttpInputMetadata,
  HttpRequestOptions,
  HttpTrigger,
  RequestArgs,
} from '@midwayjs/hooks-core'
import { args, parseRequestArgs } from './util'
import compose from 'koa-compose'
import { client, Context, Middleware } from './client'

export async function http(
  ...requestArgs: RequestArgs<HttpTrigger, HttpInputMetadata | any>
) {
  const options = buildRequestOptions(requestArgs)
  const handler: Middleware = async (ctx, next) => {
    ctx.res = await client.fetcher(options, client)
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
    args: inputs,
  } = parseRequestArgs(requestArgs)

  const options: HttpRequestOptions = {
    method: trigger.method,
    url:
      typeof inputMetadata?.params === 'object'
        ? format(trigger.path, inputMetadata.params)
        : trigger.path,
    data: inputs.length > 0 ? args(...inputs) : null,

    query: inputMetadata?.query,
    headers: {
      accept: 'application/json',
      ...inputMetadata?.headers,
    },
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
