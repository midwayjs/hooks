import type { FileRecord, HttpRequestOptions } from '@midwayjs/hooks-core'
import { args } from './util'
import { createClient, RequestOptionsCreator } from './client'
import { HttpContext, Middleware, SetupOptions } from './type'
import axios, { Options } from 'redaxios'
import fetch from 'isomorphic-unfetch'

export const client: SetupOptions = {
  baseURL: '',
  async fetcher(req: HttpRequestOptions, options: SetupOptions) {
    const res = await axios({
      method: req.method as Options['method'],
      url: req.url,
      data: req.data,
      params: req.query,
      headers: req.headers,
      baseURL: options.baseURL,
      withCredentials: options.withCredentials,
      fetch,
    })
    return res.data
  },
  middleware: [],
  withCredentials: false,
}

export function setupHttpClient(options: SetupOptions) {
  Object.assign(client, options)
}

export const creator: RequestOptionsCreator<HttpRequestOptions> = (req) => {
  const { trigger, metadata, args: inputs } = req

  const method =
    trigger.method === 'ALL'
      ? inputs.length > 0
        ? 'POST'
        : 'GET'
      : trigger.method

  return {
    method,
    url:
      typeof metadata?.params === 'object'
        ? format(trigger.path, metadata.params)
        : trigger.path,
    data: inputs.length > 0 ? args(...inputs) : null,

    query: metadata?.query,
    headers: {
      accept: 'application/json',
      ...metadata?.headers,
    },
    files: metadata?.files,
  }
}

const request: Middleware<HttpContext> = async (ctx, next) => {
  ctx.res = await client.fetcher(ctx.req, client)
  return next()
}

const formdata: Middleware<HttpContext> = async (ctx, next) => {
  const files: FileRecord = ctx.req.files
  if (!files) {
    throw new Error('no files')
  }

  const formdata = new FormData()
  for (const [key, value] of Object.entries(files)) {
    if (value instanceof FileList) {
      for (const file of value) {
        formdata.append(key, file)
      }
    } else {
      formdata.append(key, value)
    }
  }

  ctx.req.data = formdata

  return next()
}

export const http = createClient<HttpContext>(creator, () => [
  ...client.middleware,
  request,
])

export const upload = createClient<HttpContext>(creator, () => [
  ...client.middleware,
  formdata,
  request,
])

export function format(url: string, params: Record<string, string>) {
  let result = url
  for (const key in params) {
    result = result.replace(`:${key}`, params[key])
  }
  return result
}
