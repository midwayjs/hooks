import { resolve } from 'path'
import compiler from './compiler'
import webpack from 'webpack'
import { wrap } from 'jest-snapshot-serializer-raw'

const root = resolve(__dirname, './fixtures/catch-all')

const resolveEntry = (path: string | string[]) => {
  if (!Array.isArray(path)) {
    return resolve(__dirname, root, 'src/apis/', path)
  }
  return path.map((p) => resolve(__dirname, root, 'src/apis/', p))
}

const getOutput = (stats: webpack.Stats) => {
  return stats.toJson().modules[2].source
}

describe('hooks-loader', () => {
  test('Compile render', async () => {
    const stats = await compiler(resolveEntry('render/[...index].ts'), root)
    const output = getOutput(stats)
    expect(wrap(output)).toMatchSnapshot()
  })

  test('Compile lambda', async () => {
    const stats = await compiler(resolveEntry('lambda/index.ts'), root)
    const output = getOutput(stats)
    expect(wrap(output)).toMatchSnapshot()
  })

  test('the second build should match the first.', async () => {
    const first = await compiler(resolveEntry('lambda/index.ts'), root)
    const second = await compiler(resolveEntry('lambda/index.ts'), root)
    expect(getOutput(first)).toEqual(getOutput(second))
  })

  test('non-lambda files should not be compiled', async () => {
    const stats = await compiler(resolveEntry('util/util.ts'), root)
    expect(wrap(stats.toJson().modules[0].source)).toMatchSnapshot()
  })
})
