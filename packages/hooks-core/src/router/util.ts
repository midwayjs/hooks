import { ServerRouter } from './'
import { extname, relative } from 'upath'
import _ from 'lodash'

export function getFunctionId(config: {
  router: ServerRouter
  sourceFilePath: string
  functionName: string
  isExportDefault: boolean
}) {
  const { router, sourceFilePath, functionName, isExportDefault } = config

  const rule = router.getRouteConfigBySourceFilePath(sourceFilePath)
  const lambdaDirectory = router.getApiDirectory(rule.baseDir)

  const length = router.config.routes.length
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
