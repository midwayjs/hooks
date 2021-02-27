import { ServerlessRouter, ServerRouter } from './'
import { extname, relative } from 'upath'
import _ from 'lodash'

export function getFunctionId(config: {
  router: ServerlessRouter | ServerRouter
  sourceFilePath: string
  functionName: string
  isExportDefault: boolean
}) {
  const { router, sourceFilePath, functionName, isExportDefault } = config

  const rule = router.getRouteConfigBySourceFilePath(sourceFilePath)
  const lambdaDirectory = router.getLambdaDirectory(rule.baseDir)

  const length =
    router instanceof ServerlessRouter
      ? router.functionsRule.rules.length
      : router.config.routes.length
  // 多个 source 的情况下，根据各自的 lambdaDirectory 来增加前缀命名
  const relativeDirectory = length > 1 ? router.source : lambdaDirectory
  const relativePath = relative(relativeDirectory, sourceFilePath)
  // a/b/c -> a-b-c
  const id = _.kebabCase(removeExtension(relativePath))
  const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
  return name.toLowerCase()
}

export function removeExtension(file: string) {
  return file.replace(extname(file), '')
}

export function getHTTPMethod(length: number) {
  return length === 0 ? 'GET' : 'POST'
}
