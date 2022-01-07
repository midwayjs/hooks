import { z } from 'zod'
import {
  Api,
  ApiConfig,
  ContentType,
  Get,
  HttpCode,
  Middleware,
  Post,
  Redirect,
  SetHeader,
  useContext,
  Validate,
} from '../../../../../src'
import { createLogger } from '../middleware'

export const hello = () => {
  return 'Hello World!'
}

export const get = Api(Get(), async () => {
  const ctx = useContext()
  return ctx.path
})

export const post = Api(Post(), Validate(z.string()), async (input: string) => {
  const ctx = useContext()
  return {
    path: ctx.path,
    input,
  }
})

export const config: ApiConfig = {
  middleware: [createLogger('Module')],
}

export const withMiddleware = Api(
  Get(),
  Middleware(createLogger('Function')),
  async () => {
    const ctx = useContext()
    return ctx.header
  }
)

export const withHttpOperator = Api(
  Get(),
  HttpCode(201),
  SetHeader('framework', 'koa'),
  SetHeader('from', 'operator'),
  ContentType('text/html'),
  async () => {
    return 'withHttpCode'
  }
)

export const withRedirectOperator = Api(
  Get(),
  Redirect('/redirect', 301),
  async () => {
    return 'withRedirectOperator'
  }
)
