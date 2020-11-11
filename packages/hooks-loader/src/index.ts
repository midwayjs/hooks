import { loader } from 'webpack'
import { buildRequest, RenderParam } from './render'
import { getFunctionsMeta, helper, MidwayHooksFunctionStructure } from '@midwayjs/next-hooks-compiler'
import { debug } from './util'
import { compilerEmitter, Events } from '@midwayjs/faas-cli-plugin-midway-hooks/lib/event'
import { getFuncList as preCompileProject } from '@midwayjs/fcli-plugin-invoke'
import _ from 'lodash'
import { relative, toUnix } from 'upath'

let compileTask: Promise<void> = null
compilerEmitter.on(Events.PRE_COMPILE_START, () => {
  compileTask = new Promise((resolve) => compilerEmitter.once(Events.PRE_COMPILE_FINISH, resolve))
})

export default async function loader(this: loader.LoaderContext, source: string) {
  const callback = this.async()
  const resourcePath = this.resourcePath
  const root = this.rootContext || (this as any).options?.context
  helper.root = root

  if (!helper.isLambdaFile(resourcePath)) {
    return callback(null, source)
  }

  await compileTask
  compileTask = null

  const functions: _.Dictionary<MidwayHooksFunctionStructure[]> = _.groupBy(
    compilerEmitter.isCompiled
      ? getFunctionsMeta()
      : await preCompileProject({ functionDir: helper.root, sourceDir: helper.source }),
    (func) => func.sourceFile
  )

  const relativePath = toUnix(relative(root, resourcePath))
  const parsedFuncs = functions[relativePath] ?? []
  const funcs: RenderParam[] = parsedFuncs.map((func) => {
    const isExportDefault = func.exportFunction === ''

    const url = func.gatewayConfig.url
    // root path
    if (url === '/*') {
      func.gatewayConfig.url = '/'
    } else if (url.endsWith('/*')) {
      func.gatewayConfig.url = url.slice(0, -2)
    }

    return {
      isExportDefault,
      functionId: isExportDefault ? '$default' : func.exportFunction,
      ...func.gatewayConfig,
    }
  })

  debug('compile %s', resourcePath)

  const code = buildRequest(funcs, root, this.query)
  callback(null, code)
}
