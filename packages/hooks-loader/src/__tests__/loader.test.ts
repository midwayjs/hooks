import { resolve } from 'path'
import compiler from './compiler'
import webpack from 'webpack'

const root = resolve(__dirname, './fixtures/normal')

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

test('Compile nest function', async () => {
  const stats = await compiler(resolveEntry('nest/index.ts'), root)
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile export default arrow', async () => {
  const stats = await compiler(resolveEntry('arrow.ts'), root)
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile export types', async () => {
  const stats = await compiler(resolveEntry('type.ts'), root)
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile type assert', async () => {
  const stats = await compiler(resolveEntry('type-assert.ts'), root)
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile params', async () => {
  const stats = await compiler(resolveEntry('param.ts'), root)
  const output = getOutput(stats)
  expect(output).toMatchSnapshot()
})

test('Compile IoC', async () => {
  try {
    await compiler(resolveEntry('ioc.ts'), root)
  } catch (error) {
    expect(error).toBeTruthy()
  }
})

test('Compile error export', async () => {
  const fixture = resolveEntry('error.ts')
  try {
    await compiler(fixture, root)
  } catch (error) {
    expect(error).toBeTruthy()
  }
})
