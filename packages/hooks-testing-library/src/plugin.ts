import { SuperAgentRequest } from 'superagent'
import { deserialize, parse } from 'superjson'

export function SuperJSONPlugin() {
  return (req: SuperAgentRequest) => {
    req.on('response', (res) => {
      if (res.body) res.body = deserialize(res.body)
      if (res.text) res.text = parse(res.text)
    })
  }
}
