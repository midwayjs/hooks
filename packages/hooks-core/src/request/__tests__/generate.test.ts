import { generate } from '../generate'
import { wrap } from 'jest-snapshot-serializer-raw'

test('should transform exports to api function', async () => {
  const fixtures: Parameters<typeof generate>[] = [
    [
      '/',
      'export default async () => {}',
      false,
      '@midwayjs/hooks-core/request',
    ],
    [
      '/api',
      'export const foo = async () => {}',
      false,
      '@midwayjs/hooks-core/request',
    ],
    [
      '/api',
      'export async function bar () {}',
      false,
      '@midwayjs/hooks-core/request',
    ],
    [
      '/superjson',
      'export default async () => {}; export const foo = async () => {};',
      true,
      '@midwayjs/hooks-core/request',
    ],
    [
      '/superjson',
      'export default async () => {}; export async function bar () {};',
      true,
      '@midwayjs/hooks-superjson-request',
    ],
  ]

  for (const fixture of fixtures) {
    expect(wrap(await generate(...fixture))).toMatchSnapshot()
  }
})
