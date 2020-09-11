import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from '../index'
import globby from 'globby'
import fse from 'fs-extra'
import { getFunctionsMeta } from '../plugin/routes'

describe('NeXT Hooks Compiler', () => {
  const fixture = path.resolve(__dirname, './fixtures/hook')
  const source = path.resolve(fixture, 'src')
  const dist = path.resolve(fixture, 'dist')

  beforeAll(async () => {
    await compileHooks(fixture, hintConfig)
  })

  const files = globby.sync(source)

  for (const file of files) {
    const relative = path.relative(source, file)
    const target = path.resolve(dist, relative).replace('.ts', '.js')

    it(relative, async () => {
      const content = await fse.readFile(file, 'utf-8')
      const compiled = await fse.readFile(target, 'utf-8')

      expect(`
// 源文件

${content}

// 编译结果

${compiled}
      `).toMatchSnapshot()
    })
  }

  it('路由信息应该生成正确', () => {
    expect(getFunctionsMeta()).toMatchSnapshot()
  })
})
