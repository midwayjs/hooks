import { Api, Get } from '@midwayjs/hooks-core'

export default Api(Get('/*'), async () => {
  return 'Hello World!'
})

export const foo = Api(Get(), async () => {})

export const bar = Api(Get(), async () => {})
