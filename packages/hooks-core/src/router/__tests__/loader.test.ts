import noop from 'lodash/noop'
import { Decorate } from '../../decorate'
import {
  All,
  Del,
  Get,
  Head,
  Options,
  Patch,
  Post,
  Put,
} from '../../decorate/operator/http'
import { Middleware } from '../../decorate/operator/middleware'
import { Operator, OperatorType } from '../../decorate/type'
import { loadFileApiRoutes } from '../loader'
import { FileRouter } from '../router'

const router = new FileRouter({
  root: '/',
  source: 'server',
  routes: [
    {
      baseDir: 'api',
      basePath: '/',
    },
  ],
})

it('load file route with http trigger', () => {
  const routes = loadFileApiRoutes(
    {
      get: Decorate(Get(), async () => {}),
      post: Decorate(Post(), async () => {}),
      put: Decorate(Put(), async () => {}),
      delete: Decorate(Del(), async () => {}),
      patch: Decorate(Patch(), async () => {}),
      head: Decorate(Head(), async () => {}),
      options: Decorate(Options(), async () => {}),
      default: Decorate(All(), async () => {}),
    },
    '/server/api/index.ts',
    router
  )
  expect(routes).toMatchSnapshot()
})

it('load file route with custom trigger', () => {
  const CustomTrigger = (): Operator<void> => {
    return {
      name: 'Custom',
      defineMeta({ setProperty: defineProperty }) {
        defineProperty(OperatorType.Trigger, {
          type: 'Custom',
          isCustom: true,
        })
      },
    }
  }

  const routes = loadFileApiRoutes(
    {
      custom: Decorate(CustomTrigger(), async () => {}),
    },
    '/server/api/index.ts',
    router
  )

  expect(routes).toMatchSnapshot()
})

it('load middleware', () => {
  const routes = loadFileApiRoutes(
    {
      get: Decorate(Get(), Middleware(noop), async () => {}),
      post: Decorate(Post(), Middleware([noop, noop]), async () => {}),
      config: {
        middleware: [noop],
      },
    },
    '/server/api/index.ts',
    router
  )

  expect(routes[0].middleware.length).toBe(2)
  expect(routes[1].middleware.length).toBe(3)
})
