import {
  CONTROLLER_KEY,
  getClassMetadata,
  listModule,
  WEB_ROUTER_KEY,
} from '@midwayjs/decorator'
import { HttpMethod } from '@midwayjs/hooks-core'
import { HooksComponent, MidwayFrameworkAdapter } from '../component'

describe('component', () => {
  const framework = new MidwayFrameworkAdapter(null, null, null)

  it('component should validate arguments', () => {
    expect(() =>
      HooksComponent({ middleware: null })
    ).toThrowErrorMatchingSnapshot()

    expect(() =>
      framework.createHttpApi({
        trigger: {
          type: 'HTTP',
          method: 'ERROR',
        },
      } as any)
    ).toThrowErrorMatchingSnapshot()
  })

  it('should register api route as Controller', async () => {
    framework.createHttpApi({
      fn: async () => {},
      route: {
        baseDir: '',
        basePath: '/',
      },
      functionName: 'index',
      trigger: {
        type: 'HTTP',
        method: HttpMethod.GET,
        path: '/',
      },
      middleware: [],
      functionId: 'api-index',
    })

    framework.createHttpApi({
      fn: async () => {},
      functionName: 'post',
      route: {
        baseDir: '',
        basePath: '/',
      },
      trigger: {
        type: 'HTTP',
        method: HttpMethod.POST,
        path: '/post',
      },
      middleware: [async () => {}],
      functionId: 'api-index-post',
    })

    const Controllers = listModule(CONTROLLER_KEY)
    expect(Controllers.length).toBe(2)

    for (const Controller of Controllers) {
      const ControllerRoute = getClassMetadata(WEB_ROUTER_KEY, Controller)
      const ControllerMeta = getClassMetadata(CONTROLLER_KEY, Controller)

      expect({
        route: ControllerRoute,
        controller: ControllerMeta,
      }).toMatchSnapshot()
    }
  })
})
