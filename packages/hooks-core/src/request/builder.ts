import flatten from 'lodash/flatten'
import isEqual from 'lodash/isEqual'
import uniq from 'lodash/uniq'

import {
  Route,
  validateFunction,
  lazyRequire,
  FileRouter,
  isExportDefault,
  formatCode,
} from '../'
import { EXPORT_DEFAULT_FUNCTION_ALIAS } from '../const'
import { getGatewayManager } from '../gateway/manager'

export const K_MATCHER_CALLBACK = Symbol('K_MATCHER_CALLBACK')

interface ApiMetadata {
  file: string
  functionName: string
  functionId: string
  route: Route
}

interface ApiBuildMeta {
  client: string
  metadata?: { [key: string]: any }
}

interface ApiRenderMeta extends ApiMetadata, ApiBuildMeta {}

class ApiClientBuilder {
  static instance = new ApiClientBuilder()

  matchers: ApiClientMatcher[] = []

  use(matcher: ApiClientMatcher) {
    this.matchers.push(matcher)
  }

  async build(file: string, code: string, router: FileRouter) {
    if (!router.isApiFile(file)) {
      return
    }

    const { init, parse } =
      lazyRequire<typeof import('es-module-lexer')>('es-module-lexer')

    await init
    const [, exports] = parse(code)

    const route = router.getRoute(file)
    const renderMetas: ApiRenderMeta[] = []

    for (const callback of this.callbacks) {
      for (const functionName of exports) {
        const meta: ApiMetadata = {
          file,
          route,
          functionName: isExportDefault(functionName)
            ? EXPORT_DEFAULT_FUNCTION_ALIAS
            : functionName,
          functionId: router.getFunctionId(
            file,
            functionName,
            isExportDefault(functionName)
          ),
        }

        const buildMeta = callback(meta)
        if (!buildMeta) continue

        renderMetas.push(Object.assign({}, meta, buildMeta))
      }
    }

    const client = this.buildApiClient(renderMetas)
    return formatCode(client)
  }

  private buildApiClient(renderMetas: ApiRenderMeta[]) {
    const clients = uniq(renderMetas.map((buildMeta) => buildMeta.client))

    const imports = clients
      .map(
        (client, index) =>
          `import { request as request$${index} } from '${client}';`
      )
      .join('\n')

    const buildFunction = (meta: ApiRenderMeta) => {
      const clientIndex = clients.findIndex((client) => client === meta.client)

      return `
      export ${
        meta.functionName === EXPORT_DEFAULT_FUNCTION_ALIAS ? 'default' : ''
      } function ${meta.functionName} (...args) {
        const options = Object.assign({
          functionId: '${meta.functionId}',
          data: { args },
        }, ${JSON.stringify(meta.metadata || {}, null, 2)})

        return request$${clientIndex}(options)
      }
    `
    }

    const functions = renderMetas.map(buildFunction).join('\n')

    return `
      ${imports}
      ${functions}
    `
  }

  private get callbacks() {
    return flatten(this.matchers.map((matcher) => matcher[K_MATCHER_CALLBACK]))
  }
}

type MatcherCallback = (meta: ApiMetadata) => ApiBuildMeta

export class ApiClientMatcher {
  private [K_MATCHER_CALLBACK]: MatcherCallback[] = []

  route(route: Partial<Route>, buildMeta: ApiBuildMeta) {
    this[K_MATCHER_CALLBACK].push((meta: ApiMetadata) => {
      const isMatch = Object.keys(route).every((key) =>
        isEqual(route[key], meta.route[key])
      )
      if (isMatch) {
        return buildMeta
      }
    })

    return this
  }

  match(matcher: MatcherCallback) {
    validateFunction(matcher, 'matcher')
    this[K_MATCHER_CALLBACK].push(matcher)
    return this
  }
}

export function useApiClientMatcher(matcher: ApiClientMatcher) {
  return ApiClientBuilder.instance.use(matcher)
}

export function createApiClientMatcher() {
  return new ApiClientMatcher()
}

export function buildApiClient(
  file: string,
  code: string,
  router: FileRouter,
  initializeGatewayManager = true
) {
  // Ensure that the gateway manager is initialized
  if (initializeGatewayManager) {
    getGatewayManager(router.root, router.projectConfig)
  }
  return ApiClientBuilder.instance.build(file, code, router)
}
