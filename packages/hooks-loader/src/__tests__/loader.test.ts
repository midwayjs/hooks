import { resolve } from 'path'
import compiler from './compiler'
import webpack from 'webpack'

const resolveEntry = (path: string) => {
  return resolve(__dirname, './fixtures/src/apis/lambda', path)
}

const getOutput = (stats: webpack.Stats) => {
  return stats.toJson().modules[2].source
}

test('Compile normally exported functions', async () => {
  const stats = await compiler(resolveEntry('index.ts'))
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile nest function', async () => {
  const stats = await compiler(resolveEntry('nest/index.ts'))
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile export default arrow', async () => {
  const stats = await compiler(resolveEntry('arrow.ts'))
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile export types', async () => {
  const stats = await compiler(resolveEntry('type.ts'))
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile type assert', async () => {
  const stats = await compiler(resolveEntry('type-assert.ts'))
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile params', async () => {
  const stats = await compiler(resolveEntry('param.ts'))
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile error export', async () => {
  const fixture = resolveEntry('error.ts')
  try {
    await compiler(fixture)
  } catch (error) {
    expect(error).toBeTruthy()
  }
})
