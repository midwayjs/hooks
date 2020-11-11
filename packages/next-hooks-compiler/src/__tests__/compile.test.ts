import path, { toUnix } from 'upath'
import { compileHooks } from './util'
import globby from 'globby'
import fse from 'fs-extra'
import { getFunctionsMeta } from '../routes'
import { wrap } from 'jest-snapshot-serializer-raw'

describe('NeXT Hooks Compiler', () => {
  const fixture = path.resolve(__dirname, './fixtures/hook')
  const source = path.resolve(fixture, 'src')
  const dist = path.resolve(fixture, 'dist')

  beforeAll(async () => {
    await compileHooks(fixture)
  })

  const files = globby.sync(toUnix(source))

  for (const file of files) {
    const relative = path.relative(source, file)
    const target = path.resolve(dist, relative).replace('.ts', '.js')

    it(toUnix(relative), async () => {
      const content = await fse.readFile(file, 'utf-8')
      const compiled = await fse.readFile(target, 'utf-8')

      expect(
        wrap(`
// source

${content}

// target

${compiled}
      `)
      ).toMatchSnapshot()
    })
  }

  it('路由信息应该生成正确', () => {
    expect(wrap(JSON.stringify(getFunctionsMeta(), null, 2))).toMatchSnapshot()
  })
})
