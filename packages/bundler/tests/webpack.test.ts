import { ApiRouter } from '@midwayjs/hooks-core'
import { wrap } from 'jest-snapshot-serializer-raw'
import Memoryfs from 'memory-fs'
import { resolve as pathResolve } from 'path'
import webpack from 'webpack'
import { AbstractBundlerAdapter, createBundlerPlugin } from '../src'
import prettier from 'prettier'

const formatCode = (code: string) => {
  return prettier.format(code, {
    semi: true,
    singleQuote: true,
    parser: 'babel',
  })
}

const root = pathResolve(__dirname, './fixtures/base-app')

class TestBundlerAdapter extends AbstractBundlerAdapter {
  getSource(): string {
    return root
  }
}

const router = new ApiRouter()

const testBundlerAdapter = new TestBundlerAdapter({
  name: 'test',
  router,
})

const { webpack: WebpackPlugin } = createBundlerPlugin(testBundlerAdapter)

describe('unplugin-hooks webpack', () => {
  const getEntry = (path: string) => {
    return pathResolve(root, path)
  }

  test('Compile render', async () => {
    const output = await compile(root, getEntry('render/index.ts'))
    expect(wrap(formatCode(output))).toMatchSnapshot()
  })

  test('Compile lambda', async () => {
    const output = await compile(root, getEntry('lambda/index.ts'))
    expect(wrap(formatCode(output))).toMatchSnapshot()
  })

  test('the second build should match the first.', async () => {
    const first = await compile(root, getEntry('lambda/index.ts'))
    const second = await compile(root, getEntry('lambda/index.ts'))
    expect(first).toEqual(second)
  })

  test('non-lambda files should not be compiled', async () => {
    const output = await compile(root, getEntry('util/util.ts'))
    expect(wrap(formatCode(output))).toMatchSnapshot()
  })
})

function compile(context: string, entry: string): Promise<string> {
  return new Promise((resolve) => {
    const compiler = webpack({
      context,
      entry,
      plugins: [WebpackPlugin()],
      output: {
        path: '/',
        filename: 'client.js',
      },
      externals: {
        '@midwayjs/rpc': 'fetch',
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
