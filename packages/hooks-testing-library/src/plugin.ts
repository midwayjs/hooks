import { SuperAgentRequest } from 'superagent'

import { superjson } from '@midwayjs/hooks-core'

export function SuperJSONPlugin(enableSuperjson: boolean) {
  if (!enableSuperjson) {
    return () => {}
  }
  return (req: SuperAgentRequest) => {
    req.on('response', (res) => {
      if (res.body && res.type.includes('application/json')) {
        res.body = superjson.deserialize(res.body)
      }
    })
  }
}
