import { SuperAgentRequest } from 'superagent'
import { superjson } from '@midwayjs/hooks-core'

export function SuperJSONPlugin() {
  return (req: SuperAgentRequest) => {
    req.on('response', (res) => {
      if (res.body) res.body = superjson.deserialize(res.body)
      if (res.text) res.text = superjson.parse(res.text)
    })
  }
}
