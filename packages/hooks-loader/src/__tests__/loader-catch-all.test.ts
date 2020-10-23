import { resolve } from 'path'
import compiler from './compiler'
import webpack from 'webpack'

const root = resolve(__dirname, './fixtures/catch-all')

const resolveEntry = (path: string) => {
  return resolve(__dirname, root, 'src/apis/', path)
}
const getOutput = (stats: webpack.Stats) => {
  return stats.toJson().modules[2].source
}

describe('hooks-loader', () => {
  test('Compile render', async () => {
    const stats = await compiler(resolveEntry('render/[...index].ts'), root)
    const output = getOutput(stats)
    expect(output).toMatchSnapshot()
  })

  test.skip('Compile lambda', async () => {
    const stats = await compiler(resolveEntry('lambda/index.ts'), root)
    const output = getOutput(stats)
    expect(output).toMatchSnapshot()
  })
})
