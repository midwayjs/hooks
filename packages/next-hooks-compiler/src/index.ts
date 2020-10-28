import { helper } from './helper'
import { compileWithOptions, MwccConfig } from '@midwayjs/mwcc'

export * from './hintConfig'
export { helper } from './helper'
export { setMidwayHooksPackage, BuiltinHOC } from './const'
export { getFunctionsMeta, clearRoutes, MidwayHooksFunctionStructure } from './routes'
export { getDeployFunctionName } from './plugin/create-lambda'

export async function compileHooks(root: string, hintConfig: MwccConfig) {
  helper.root = root

  const outDir = 'dist'
  process.chdir(root)

  await compileWithOptions(root, outDir, hintConfig)
}
