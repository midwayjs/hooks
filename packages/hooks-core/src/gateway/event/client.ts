import { ApiBaseParam, FileRouter, formatCode } from '../../index'
import { lazyRequire } from '../../util'



interface RenderParam extends ApiBaseParam {
  isExportDefault: boolean
  name: string
}

export async function createEventApiClient(
  file: string,
  code: string,
  router: FileRouter
) {
  const { init, parse } = lazyRequire('es-module-lexer')

  await init
  const [, exports] = parse(code)

  if (exports.length === 0) {
    return null
  }

  const {
    request: { client },
  } = router.projectConfig

  const funcs: RenderParam[] = exports.map((name) => {
    const isExportDefault = name === 'default'
    return {
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
          functionId: '${func.functionId}',
          data: { args }
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
