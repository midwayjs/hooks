import { helper } from './helper'
import { compileWithOptions, MwccConfig } from '@midwayjs/mwcc'

export * from './hintConfig'
export { helper } from './helper'
export { setMidwayHooksPackage } from './const'
export { getFunctionsMeta, clearRoutes, MidwayHooksFunctionStructure } from './plugin/routes'
export { getFunctionHandlerName } from './plugin/create-lambda-ctx'

export async function compileHooks(root: string, hintConfig: MwccConfig) {
  helper.root = root

  const outDir = 'dist'
  process.chdir(root)

  await compileWithOptions(root, outDir, hintConfig)
}
