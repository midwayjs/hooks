import { resolve } from 'path'
import compiler from './compiler'
import { wrap } from 'jest-snapshot-serializer-raw'

const root = resolve(__dirname, './fixtures/catch-all')

const resolveEntry = (path: string | string[]) => {
  if (!Array.isArray(path)) {
    return resolve(__dirname, root, 'src/apis/', path)
  }
  return path.map((p) => resolve(__dirname, root, 'src/apis/', p))
}

async function compile(entry: string) {
  const stats = await compiler(resolveEntry(entry), root)
  const output = stats.toJson().modules.find((mod) => mod.name.includes(entry))
  return output.source
}

describe('hooks-loader', () => {
  test('Compile render', async () => {
    const output = await compile('render/[...index].ts')
    expect(wrap(output)).toMatchSnapshot()
  })

  test('Compile lambda', async () => {
    const output = await compile('lambda/index.ts')
    expect(wrap(output)).toMatchSnapshot()
  })

  test('the second build should match the first.', async () => {
    const first = await compile('lambda/index.ts')
    const second = await compile('lambda/index.ts')
    expect(first).toEqual(second)
  })

  test('non-lambda files should not be compiled', async () => {
    const output = await compile('util/util.ts')
    expect(wrap(output)).toMatchSnapshot()
  })
})
