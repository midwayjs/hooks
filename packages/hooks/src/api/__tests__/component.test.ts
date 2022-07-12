import { ApiRoute, HttpMethod, HttpTrigger } from '@midwayjs/hooks-core'
import { HooksComponent } from '../component'
import { MidwayFrameworkAdapter } from '../component/adapter'

describe('component', () => {
  const adapter = new MidwayFrameworkAdapter(null, null, null)

  it('component should validate arguments', () => {
    expect(() =>
      HooksComponent({ middleware: null })
    ).toThrowErrorMatchingSnapshot()

    expect(() =>
      adapter.createHttpApi({
        trigger: {
          type: 'HTTP',
          method: 'ERROR',
        },
      } as any)
    ).toThrowErrorMatchingSnapshot()
  })

  it('should register api route as Controller', async () => {
    const fns: ApiRoute<HttpTrigger>[] = [
      {
        fn: async () => {},
        file: '/index.ts',
        functionName: 'index',
        trigger: {
          type: 'HTTP',
          method: HttpMethod.GET,
          path: '/',
        },
        middleware: [],
        functionId: 'api-index',
      },
      {
        fn: async () => {},
        file: '/index.ts',
        functionName: 'post',
        trigger: {
          type: 'HTTP',
          method: HttpMethod.POST,
          path: '/post',
        },
        middleware: [async () => {}],
        functionId: 'api-index-post',
      },
    ]

    for (const fn of fns) {
      expect(adapter.createHttpApi(fn)).toMatchSnapshot()
    }
  })
})
