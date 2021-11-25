import {
  listModule,
  CONTROLLER_KEY,
  getClassMetadata,
  WEB_ROUTER_KEY,
} from '@midwayjs/decorator'

import { HooksComponent, registerHTTPRoute } from '../component'

it('component should validate arguments', () => {
  expect(() =>
    HooksComponent({ middleware: null })
  ).toThrowErrorMatchingSnapshot()

  expect(() =>
    registerHTTPRoute({
      trigger: {
        type: 'HTTP',
        method: 'ERROR',
      },
    } as any)
  ).toThrowErrorMatchingSnapshot()
})

it('should register api route as Controller', async () => {
  registerHTTPRoute({
    fn: async () => {},
    trigger: {
      type: 'HTTP',
      method: 'GET',
      path: '/',
    },
    middleware: [],
    functionId: 'api-index',
  })

  registerHTTPRoute({
    fn: async () => {},
    trigger: {
      type: 'HTTP',
      method: 'POST',
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
