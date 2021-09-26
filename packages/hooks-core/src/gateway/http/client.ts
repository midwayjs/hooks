import { EXPORT_DEFAULT_FUNCTION_ALIAS } from '../../const'
import { createApiClientMatcher } from '../../index'
import { HTTPRouter } from './router'

function getUrl(baseUrl: string, name: string) {
  if (name === EXPORT_DEFAULT_FUNCTION_ALIAS) {
    return baseUrl
  }

  if (baseUrl.endsWith('/')) {
    return `${baseUrl}${name}`
  }

  return `${baseUrl}/${name}`
}

export function createHTTPClientMatcher(router: HTTPRouter) {
  return createApiClientMatcher().match((meta) => {
    const { file, route, functionName } = meta

    if (!route.basePath) {
      return
    }

    const baseUrl = router.getBaseUrl(file)
    const url = getUrl(baseUrl, functionName)
    const client =
      router.projectConfig?.request?.client || '@midwayjs/hooks/request'

    return {
      client,
      metadata: {
        url,
        meta: {},
      },
    }
  })
}
