import { SuperAgentRequest } from 'superagent'
import { deserialize, parse } from 'superjson'

export function SuperJSONPlugin() {
  return (req: SuperAgentRequest) => {
    req.on('response', (response) => {
      if (response.body) {
        response.body = deserialize(response.body)
      }
      if (response.text) {
        response.text = parse(response.text)
      }
    })
  }
}
