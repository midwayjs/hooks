import { HttpTriggerType } from '@midwayjs/hooks-core'
import { setConfig, setProjectRoot } from '@midwayjs/hooks/internal'
import { MidwayBundlerAdapter } from '../adapter'

const desc = process.version.startsWith('v12') ? describe.skip : describe

desc('file system router', () => {
  beforeEach(() => {
    setProjectRoot('/')
    setConfig({
      source: '/',
      routes: [
        {
          baseDir: '/api',
          basePath: '/api',
        },
      ],
    })
  })

  test('MidwayBundlerAdapter', async () => {
    const adapter = new MidwayBundlerAdapter()
    const apis: any = ['/foo', '/bar'].map((path) => ({
      file: '/api/foo.ts',
      trigger: { type: HttpTriggerType, path },
    }))

    adapter.transformApiRoutes(apis)
    adapter.transformApiRoutes(apis)
    adapter.transformApiRoutes(apis)

    const result = adapter.transformApiRoutes(apis)
    expect(result).toMatchSnapshot()
  })
})
