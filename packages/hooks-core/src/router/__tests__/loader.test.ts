import noop from 'lodash/noop'
import { Decorate } from '../../decorate/decorate'
import {
  All,
  Delete,
  Get,
  Head,
  Options,
  Patch,
  Post,
  Put,
} from '../../decorate/operator/http'
import { Middleware } from '../../decorate/operator/middleware'
import { Operator, OperatorType } from '../../decorate/type'
import { loadApiRoutesFromFile } from '../loader'
import { FileSystemRouter } from '../file'

const router = new FileSystemRouter({
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
  const routes = loadApiRoutesFromFile(
    {
      get: Decorate(Get(), async () => {}),
      post: Decorate(Post(), async () => {}),
      put: Decorate(Put(), async () => {}),
      del: Decorate(Delete(), async () => {}),
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
      metadata({ setMetadata: defineProperty }) {
        defineProperty(OperatorType.Trigger, {
          type: 'Custom',
          isCustom: true,
        })
      },
    }
  }

  const routes = loadApiRoutesFromFile(
    {
      custom: Decorate(CustomTrigger(), async () => {}),
    },
    '/server/api/index.ts',
    router
  )

  expect(routes).toMatchSnapshot()
})

it('load middleware', () => {
  const routes = loadApiRoutesFromFile(
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
