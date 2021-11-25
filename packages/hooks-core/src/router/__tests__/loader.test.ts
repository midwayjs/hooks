import noop from 'lodash/noop'

import { Pipe } from '../../pipe'
import {
  Get,
  Post,
  Del,
  All,
  Patch,
  Head,
  Options,
  Put,
} from '../../pipe/operator/http'
import { Middleware } from '../../pipe/operator/middleware'
import { Operator, OperatorType } from '../../pipe/type'
import { loadFileApiRoutes } from '../loader'
import { NewFileRouter } from '../new-router'

const router = new NewFileRouter({
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
      get: Pipe(Get(), async () => {}),
      post: Pipe(Post(), async () => {}),
      put: Pipe(Put(), async () => {}),
      delete: Pipe(Del(), async () => {}),
      patch: Pipe(Patch(), async () => {}),
      head: Pipe(Head(), async () => {}),
      options: Pipe(Options(), async () => {}),
      default: Pipe(All(), async () => {}),
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
      custom: Pipe(CustomTrigger(), async () => {}),
    },
    '/server/api/index.ts',
    router
  )

  expect(routes).toMatchSnapshot()
})

it('load middleware', () => {
  const routes = loadFileApiRoutes(
    {
      get: Pipe(Get(), Middleware(noop), async () => {}),
      post: Pipe(Post(), Middleware([noop, noop]), async () => {}),
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
