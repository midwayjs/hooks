import { init, parse } from 'es-module-lexer'

import { ApiParam, formatCode } from '../../index'
import { HTTPRouter } from './router'

interface RenderParam extends Partial<ApiParam> {
  isExportDefault?: boolean
  name?: string
}

export async function createHTTPApiClient(
  file: string,
  code: string,
  router: HTTPRouter
) {
  await init
  const [, exports] = parse(code)

  if (exports.length === 0) {
    return null
  }

  const baseUrl = router.getBaseUrl(file)
  const {
    superjson,
    request: { client },
  } = router.projectConfig

  const funcs: RenderParam[] = exports.map((name) => {
    const isExportDefault = name === 'default'
    return {
      url: getUrl(baseUrl, name),
      meta: {
        superjson,
      },
      functionId: router.getFunctionId(file, name, isExportDefault),
      isExportDefault: isExportDefault,
      name: isExportDefault ? '$default' : name,
    }
  })

  return formatCode(buildClient(client, funcs))
}

function buildClient(client: string, funcs: RenderParam[]) {
  const buildFunction = (func: RenderParam) => {
    return `
      export ${func.isExportDefault ? 'default' : ''} function ${
      func.name
    } (...args) {
        return request({
          url: '${func.url}',
          method: args.length === 0 ? 'GET' : 'POST',
          data: { args },
          meta: ${JSON.stringify(func.meta, null, 2)}
        })
      }
    `
  }

  const functions = funcs.map(buildFunction).join('\n')

  return `
    import { request } from '${client}';
    ${functions}
  `
}

function getUrl(baseUrl: string, name: string) {
  if (name === 'default') {
    return baseUrl
  }

  if (baseUrl.endsWith('/')) {
    return `${baseUrl}${name}`
  }

  return `${baseUrl}/${name}`
}
