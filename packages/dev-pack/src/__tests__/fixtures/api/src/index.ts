import { Api, Get, useContext } from '@midwayjs/hooks'
import type { Context } from '@midwayjs/faas'

export default Api(Get('/'), async () => {
  const ctx = useContext<Context>()
  return {
    message: 'Hello World!',
    ip: ctx.ip,
  }
})

export const handleQuery = Api(Get('/api/query'), async () => {
  const ctx = useContext()
  return { query: ctx.query }
})

export const handleApi = Api(Get('/api/:id'), async () => {
  const ctx = useContext<Context>()
  return {
    id: ctx.params.id,
  }
})
