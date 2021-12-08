import { wrap } from 'jest-snapshot-serializer-raw'
import Memoryfs from 'memory-fs'
import { resolve as pathResolve } from 'path'

import webpack from 'webpack'

import { HooksWebpackPlugin } from '../src'

describe.skip('unplugin-hooks webpack', () => {
  const root = pathResolve(__dirname, './fixtures/base-app')
  const cwd = process.cwd()

  const getEntry = (path: string) => {
    return pathResolve(root, 'src/', path)
  }

  beforeEach(() => {
    process.chdir(root)
  })

  afterEach(() => {
    process.chdir(cwd)
  })

  test('Compile render', async () => {
    const output = await compile(root, getEntry('render/[...index].ts'))
    expect(wrap(output)).toMatchSnapshot()
  })

  test('Compile lambda', async () => {
    const output = await compile(root, getEntry('lambda/index.ts'))
    expect(wrap(output)).toMatchSnapshot()
  })

  test('Compile event', async () => {
    const output = await compile(root, getEntry('wechat/index.ts'))
    expect(wrap(output)).toMatchSnapshot()
  })

  test('the second build should match the first.', async () => {
    const first = await compile(root, getEntry('lambda/index.ts'))
    const second = await compile(root, getEntry('lambda/index.ts'))
    expect(first).toEqual(second)
  })

  test('non-lambda files should not be compiled', async () => {
    const output = await compile(root, getEntry('util/util.ts'))
    expect(wrap(output)).toMatchSnapshot()
  })
})

function compile(context: string, entry: string): Promise<string> {
  return new Promise((resolve) => {
    const compiler = webpack({
      context,
      entry,
      plugins: [HooksWebpackPlugin()],
      output: {
        path: '/',
        filename: 'client.js',
      },
      externals: {
        '@midwayjs/hooks/request': '@midwayjs/hooks/request',
        axios: 'axios',
      },
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
    })

    compiler.outputFileSystem = new Memoryfs()

    compiler.run((err: any, stats) => {
      if (err) {
        console.error(err.stack || err)
        if (err.details) {
          console.error(err.details)
        }
        return
      }

      const info = stats.toJson()

      if (stats.hasErrors()) {
        console.error(info.errors)
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings)
      }

      const module = info.modules.find((mod) => mod.identifier.includes(entry))
      resolve(module.source)
    })
  })
}
