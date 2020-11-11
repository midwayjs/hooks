import { useContext, withController } from '@midwayjs/hooks'
import { FaaSContext } from '@midwayjs/faas'

export const controller = withController(
  {
    middleware: ['classMiddleware'],
  },
  async () => {
    const ctx = useContext()
    return ctx.query.from
  }
)

const functionMiddleware = async (ctx: FaaSContext, next: () => Promise<any>) => {
  ctx.query.from = 'functionMiddleware'
  await next()
}

export default withController(
  {
    middleware: [functionMiddleware],
  },
  async () => {
    const ctx = useContext()
    return ctx.query.from
  }
)
