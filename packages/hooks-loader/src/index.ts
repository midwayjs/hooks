import { loader } from 'webpack'
import { buildRequest } from './render'
import { helper } from '@midwayjs/next-hooks-compiler'
import { debug } from './util'
import { parse } from './parser'

export { parse } from './parser'

export default async function loader(this: loader.LoaderContext, source: string) {
  const callback = this.async()
  const resourcePath = this.resourcePath

  if (resourcePath.includes('node_modules')) {
    return callback(null, source)
  }

  const root = this.rootContext || (this as any).options?.context
  helper.root = root

  if (!helper.isLambdaFile(resourcePath)) {
    return callback(null, source)
  }

  debug('compile %s', resourcePath)
  const { err, funcs } = parse(resourcePath, source)

  if (err) {
    callback(err)
    return
  }

  const code = buildRequest(funcs, root, this.query)
  callback(null, code)
}
