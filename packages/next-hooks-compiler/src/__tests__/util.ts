import { helper, hintConfig } from '..'
import path from 'upath'
import { MwccConfig, compileWithOptions } from '@midwayjs/mwcc'

export async function compileFixture(fixture: string) {
  return compileHooks(path.resolve(__dirname, './fixtures', fixture), hintConfig)
}

export async function compileHooks(root: string, hintConfig: MwccConfig) {
  helper.root = root

  const outDir = 'dist'
  process.chdir(root)

  await compileWithOptions(root, outDir, hintConfig)
}
