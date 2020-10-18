import { resolve } from 'path'
import compiler from './compiler'
import webpack from 'webpack'

const root = resolve(__dirname, './fixtures/remove-underscore')

const resolveEntry = (path: string) => {
  return resolve(__dirname, root, 'src/apis/lambda', path)
}
const getOutput = (stats: webpack.Stats) => {
  return stats.toJson().modules[2].source
}

test('Compile normally exported functions', async () => {
  const stats = await compiler(resolveEntry('index.ts'), root)
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile normally exported functions', async () => {
  const stats = await compiler(resolveEntry('param.ts'), root)
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})
