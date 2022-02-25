import noop from 'lodash/noop'
import {
  All,
  Api,
  Delete,
  Get,
  Head,
  Middleware,
  Operator,
  OperatorType,
  Options,
  Patch,
  Post,
  Put,
} from '../../api'
import { ApiRouter } from '../api'
import { parseApiModule } from '../loader'

const router = new ApiRouter()

it('load file route with http trigger', () => {
  const routes = parseApiModule(
    {
      get: Api(Get(), async () => {}),
      post: Api(Post(), async () => {}),
      put: Api(Put(), async () => {}),
      del: Api(Delete(), async () => {}),
      patch: Api(Patch(), async () => {}),
      head: Api(Head(), async () => {}),
      options: Api(Options(), async () => {}),
      default: Api(All(), async () => {}),
    },
    '/index.ts',
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

  const routes = parseApiModule(
    {
      custom: Api(CustomTrigger(), async () => {}),
    },
    '/index.ts',
    router
  )

  expect(routes).toMatchSnapshot()
})

it('load middleware', () => {
  const routes = parseApiModule(
    {
      get: Api(Get(), Middleware(noop), async () => {}),
      post: Api(Post(), Middleware([noop, noop]), async () => {}),
      config: {
        middleware: [noop],
      },
    },
    '/index.ts',
    router
  )

  expect(routes[0].middleware.length).toBe(2)
  expect(routes[1].middleware.length).toBe(3)
})
