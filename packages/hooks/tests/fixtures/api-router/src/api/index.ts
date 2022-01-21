import { z } from 'zod'
import {
  Api,
  ApiConfig,
  ContentType,
  Get,
  HttpCode,
  Middleware,
  Post,
  Query,
  Params,
  Headers,
  Redirect,
  SetHeader,
  useContext,
  Validate,
  ValidateHttp,
} from '../../../../../src'
import { createLogger } from '../middleware'
import { Context } from '@midwayjs/koa'

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

const QuerySchema = z.object({ isQuery: z.string() })
const HeadersSchema = z.object({ isHeader: z.string() })
const ParamsSchema = z.object({ isParams: z.string().regex(/^\d+$/) })
const DataSchema = z.string()

export const withValidateHttp = Api(
  Post('/api/withValidateHttp/:isParams'),
  Query<z.infer<typeof QuerySchema>>(),
  Headers<z.infer<typeof HeadersSchema>>(),
  Params<z.infer<typeof ParamsSchema>>(),
  ValidateHttp({
    query: QuerySchema,
    headers: HeadersSchema,
    params: ParamsSchema,
    data: [DataSchema],
  }),
  async (name: string) => {
    const ctx = useContext<Context>()
    return {
      data: `Hello ${name}`,
      query: ctx.query.isQuery,
      header: ctx.header.isHeader,
      params: ctx.params.isParams,
    }
  }
)
