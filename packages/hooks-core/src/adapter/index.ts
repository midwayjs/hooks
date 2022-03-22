import { createDebug, validateFunction } from '../common'
import { ResponseMetaData } from '../api/operator/http'

const debug = createDebug('hooks-core: adapter')

type FrameworkAdapter = {
  name: string
  handleResponseMetaData(metadata: ResponseMetaData[]): Promise<any>
}

export let framework: FrameworkAdapter = null

export function useFrameworkAdapter(adapter: FrameworkAdapter) {
  validateFunction(
    adapter.handleResponseMetaData,
    'adapter.handleResponseMetaData'
  )
  debug('use framework adapter: %s', adapter.name)
  framework = adapter
}
