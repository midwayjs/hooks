import { wrap } from 'jest-snapshot-serializer-raw'
import { resolve } from 'path'

import compiler from './compiler'

const root = resolve(__dirname, './fixtures/base-app')
const cwd = process.cwd()

const resolveEntry = (path: string | string[]) => {
  if (!Array.isArray(path)) {
    return resolve(__dirname, root, 'src/', path)
  }
  return path.map((p) => resolve(__dirname, root, 'src/', p))
}

async function compile(entry: string) {
  const stats = await compiler(resolveEntry(entry), root)
  const output = stats.toJson().modules.find((mod) => mod.name.includes(entry))

  if (output?.modules?.length) {
    return output.modules.find((mod) => mod.name.includes(entry)).source
  }

  return output.source
}

describe('hooks loader with proxy', () => {
  beforeEach(() => {
    process.chdir(root)
  })

  afterEach(() => {
    process.chdir(cwd)
  })

  test('Compile render', async () => {
    const output = await compile('render/[...index].ts')
    expect(wrap(output)).toMatchInlineSnapshot(`
      import { request as request$0 } from '@midwayjs/hooks/request';

      export default function $default(...args) {
        const options = Object.assign(
          {
            functionId: 'render-index',
            data: { args },
          },
          {
            url: '/',
            meta: {},
          }
        );

        return request$0(options);
      }

      export function foo(...args) {
        const options = Object.assign(
          {
            functionId: 'render-index-foo',
            data: { args },
          },
          {
            url: '/foo',
            meta: {},
          }
        );

        return request$0(options);
      }

      export function bar(...args) {
        const options = Object.assign(
          {
            functionId: 'render-index-bar',
            data: { args },
          },
          {
            url: '/bar',
            meta: {},
          }
        );

        return request$0(options);
      }

    `)
  })

  test('Compile lambda', async () => {
    const output = await compile('lambda/index.ts')
    expect(wrap(output)).toMatchInlineSnapshot(`
      import { request as request$0 } from '@midwayjs/hooks/request';

      export default function $default(...args) {
        const options = Object.assign(
          {
            functionId: 'lambda-index',
            data: { args },
          },
          {
            url: '/api',
            meta: {},
          }
        );

        return request$0(options);
      }

    `)
  })

  test('Compile event', async () => {
    const output = await compile('wechat/index.ts')
    expect(wrap(output)).toMatchInlineSnapshot(`
      import { request as request$0 } from '@midwayjs/hooks-miniprogram-client';

      export default function $default(...args) {
        const options = Object.assign(
          {
            functionId: 'wechat-index',
            data: { args },
          },
          {}
        );

        return request$0(options);
      }

    `)
  })

  test('the second build should match the first.', async () => {
    const first = await compile('lambda/index.ts')
    const second = await compile('lambda/index.ts')
    expect(first).toEqual(second)
  })

  test('non-lambda files should not be compiled', async () => {
    const output = await compile('util/util.ts')
    expect(wrap(output)).toMatchInlineSnapshot(`
      export function isTrue(value) {
          return value === 'true' || value === true;
      }

    `)
  })
})
