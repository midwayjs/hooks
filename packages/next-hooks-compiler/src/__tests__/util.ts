import { helper, hintConfig } from '..'
import path from 'upath'
import { MwccConfig, compileWithOptions } from '@midwayjs/mwcc'
import { invoke } from '@midwayjs/fcli-plugin-invoke'

export async function compileFixture(fixture: string) {
  return compileHooks(path.resolve(__dirname, './fixtures', fixture), hintConfig)
}

export async function compileHooks(root: string, hintConfig: MwccConfig) {
  helper.root = root

  const outDir = 'dist'
  process.chdir(root)

  await compileWithOptions(root, outDir, hintConfig)
}

export function createInvoker(cwd: string) {
  process.env.MIDWAY_TS_MODE = 'false'
  return (functionName: string, args?: any[]) => {
    return invoke({
      functionDir: cwd,
      functionName,
      clean: false,
      trigger: 'http',
      data: [
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          query: {
            q: 'testq',
          },
          pathParameters: {
            id: 'id',
          },
          path: '/test',
          body: {
            args: ['lxxyx'],
          },
        },
      ],
    })
  }
}
