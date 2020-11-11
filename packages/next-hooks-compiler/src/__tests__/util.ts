import { helper, hintConfig } from '..'
import { compileWithOptions } from '@midwayjs/mwcc'
import { invoke } from '@midwayjs/fcli-plugin-invoke'

export async function compileHooks(root: string) {
  helper.root = root

  const outDir = 'dist'
  process.chdir(root)

  await compileWithOptions(root, outDir, hintConfig)
}

export function createInvoker(cwd: string) {
  process.env.MIDWAY_TS_MODE = 'false'
  return (functionName: string) => {
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
