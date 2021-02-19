import { HooksRouter } from '..'
import path from 'path'
import os from 'os'
import fse from 'fs-extra'

function createRouter(fYml: string, duplicateLogger?: any) {
  const tmp = path.join(
    os.tmpdir(),
    `${path.basename(fYml, 'yml')}-${Date.now()}`
  )
  fse.ensureDirSync(tmp)
  fse.copyFileSync(
    path.join(__dirname, 'fixture', fYml),
    path.join(tmp, 'f.yml')
  )
  return {
    router: new HooksRouter(tmp, duplicateLogger),
    dir: tmp,
  }
}

describe('hooks-router', () => {
  test('should exist', () => {
    expect(HooksRouter).toBeTruthy()
    const { router } = createRouter('basic.yml')
    expect(router).toBeInstanceOf(HooksRouter)
  })

  test('should parse f.yml', () => {
    expect(createRouter('basic.yml').router.spec).toMatchSnapshot()
  })

  test('should detected runtime', () => {
    expect(createRouter('basic.yml').router.isAsyncHooksRuntime).toBeFalsy()
    expect(
      createRouter('with-async_hooks.yml').router.isAsyncHooksRuntime
    ).toBeTruthy()
  })

  test('test functions', () => {
    const { router, dir } = createRouter('basic.yml')
    expect(router.source.endsWith('/src')).toBeTruthy()

    const render = path.resolve(dir, 'src/render/[...index].ts')
    expect(router.isLambdaFile(render)).toBeTruthy()

    expect(router.isProjectFile(__dirname)).toBeFalsy()
    expect(router.isProjectFile(render)).toBeTruthy()

    expect(router.getDistPath(render)).toMatchInlineSnapshot(
      `"render/[...index].js"`
    )

    const rule = router.getRuleBySourceFilePath(render)
    expect(rule).toMatchInlineSnapshot(`
      Object {
        "baseDir": "render",
        "events": Object {
          "http": Object {
            "basePath": "/",
          },
        },
      }
    `)
    expect(router.getLambdaDirectory(rule).endsWith('src/render')).toBeTruthy()
  })

  test('getHTTPPath', () => {
    const { router, dir } = createRouter('basic.yml')
    const api = path.resolve(dir, 'src/render/api.ts')

    expect(router.getHTTPPath(api, '', true)).toMatchInlineSnapshot(`"/api"`)
    expect(router.getHTTPPath(api, 'foo', true)).toMatchInlineSnapshot(`"/api"`)
    expect(router.getHTTPPath(api, 'bar', false)).toMatchInlineSnapshot(
      `"/api/bar"`
    )

    const catchAll = path.resolve(dir, 'src/render/[...index].ts')
    expect(router.getHTTPPath(catchAll, '', true)).toMatchInlineSnapshot(`"/*"`)
    expect(router.getHTTPPath(catchAll, 'foo', true)).toMatchInlineSnapshot(
      `"/*"`
    )
    expect(router.getHTTPPath(catchAll, 'bar', false)).toMatchInlineSnapshot(
      `"/bar/*"`
    )

    const underscore = path.resolve(dir, 'src/underscore/index.ts')
    expect(router.getHTTPPath(underscore, '', true)).toMatchInlineSnapshot(
      `"/"`
    )
    expect(router.getHTTPPath(underscore, 'bar', false)).toMatchInlineSnapshot(
      `"/_bar"`
    )
  })

  test('getHTTPPath duplicate path', () => {
    const duplicateLogger = jest.fn()
    const { router, dir } = createRouter('basic.yml', duplicateLogger)
    const api = path.resolve(dir, 'src/render/api.ts')
    const api2 = path.resolve(dir, 'src/render/api/index.ts')

    router.getHTTPPath(api, '', true)
    router.getHTTPPath(api2, '', true)

    expect(duplicateLogger).toHaveBeenCalledTimes(1)
  })
})
