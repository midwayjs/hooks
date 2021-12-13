import omit from 'lodash/omit'
import { createUnplugin, UnpluginOptions } from 'unplugin'
import {
  ApiRoute,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  FileRouter,
  loadApiRoutesFromFile,
  RouterConfig,
} from '@midwayjs/hooks-core'

interface BundlerConfig extends RouterConfig {
  name: string
  unplugin?: UnpluginOptions
}

export abstract class AbstractBundlerAdapter {
  private router: FileRouter

  constructor(private config: BundlerConfig) {
    this.router = new FileRouter(config)
  }

  getName() {
    return this.config.name
  }

  getRouter() {
    return this.router
  }

  getUnplugin() {
    return this.config.unplugin || {}
  }

  transformApiRoutes(apis: ApiRoute[]) {
    return apis
  }

  generateClient(apis: ApiRoute[]) {
    let fetcherId = 0
    const importClient = new Map<string, [string, string, number]>()

    const importCodes = new Set<string>()
    const functionCodes = []

    for (const {
      trigger,
      functionName,
      functionId,
      hasMetadataInput,
    } of apis) {
      if (!trigger.requestClient) continue
      const { fetcher, client } = trigger.requestClient

      const clientId = `${client}_${fetcher}`
      if (!importClient.has(clientId)) {
        importClient.set(clientId, [client, fetcher, fetcherId++])
      }

      const [clientName, fetcherName, idx] = importClient.get(clientId)
      const uniqueFetcher = `request$${idx}`
      importCodes.add(
        `import { ${fetcherName} as ${uniqueFetcher} } from '${clientName}'`
      )

      const exportModifer =
        functionName === EXPORT_DEFAULT_FUNCTION_ALIAS ? 'default' : ''
      functionCodes.push(`
        export ${exportModifer} function ${functionName} (...args) {
          const route = {
            trigger: ${JSON.stringify(omit(trigger, 'requestClient'))},
            functionId: '${functionId}',
            hasMetadataInput: ${!!hasMetadataInput},
          }
          return ${uniqueFetcher}(route, ...args)
        }
      `)
    }

    const code = [...importCodes, ...functionCodes].join('\n')
    return this.formatCode(code)
  }

  private formatCode(code: string) {
    try {
      const prettier = require('prettier')
      return prettier.format(code, {
        semi: true,
        singleQuote: true,
        parser: 'babel',
      })
    } catch (e) {
      console.log('format code error', e)
      return code
    }
  }
}

export function createBundlerPlugin(adapter: AbstractBundlerAdapter) {
  return createUnplugin((options) => {
    return {
      name: adapter.getName(),
      enforce: 'pre',
      transformInclude(id: string) {
        return adapter.getRouter().isApiFile(id)
      },
      async transform(code: string, id: string) {
        const apis = loadApiRoutesFromFile(require(id), id, adapter.getRouter())
        const transformedApis = adapter.transformApiRoutes(apis)
        return adapter.generateClient(transformedApis)
      },
      ...adapter.getUnplugin(),
    }
  })
}
