import { ServerRouter } from '../router'
import { init, parse } from 'es-module-lexer'

export async function parseAndGenerateSDK(
  router: ServerRouter,
  sourceFilePath: string,
  code: string,
  module: 'cjs' | 'esm' = 'esm'
) {
  await init
  const [, exports] = parse(code)

  if (exports.length === 0) {
    return null
  }

  const baseUrl = router.getBaseUrl(sourceFilePath)

  return `
import { createRequest } from '@midwayjs/hooks-core/lib/${
    module === 'esm' ? 'esm/' : ''
  }request/sdk';

${exports
  .map((id) => {
    if (id === 'default') {
      return `export default createRequest('${baseUrl}', '${id}');`
    }
    return `export const ${id} = createRequest('${baseUrl}', '${id}');`
  })
  .join('\n')}
  `.trim()
}
