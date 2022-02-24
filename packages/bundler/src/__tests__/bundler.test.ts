import {
  All,
  Api,
  ApiRouter,
  BaseTrigger,
  Delete,
  Get,
  Head,
  Operator,
  OperatorType,
  Options,
  parseApiModule,
  Patch,
  Post,
  Put,
} from '@midwayjs/hooks-core'
import { AbstractBundlerAdapter } from '..'
import { wrap } from 'jest-snapshot-serializer-raw'

const router = new ApiRouter()

class TestBundlerAdapter extends AbstractBundlerAdapter {
  constructor() {
    super({
      name: 'test',
      router,
    })
  }

  getSource(): string {
    return '/'
  }
}

it('create bundler', async () => {
  const testBundlerAdapter = new TestBundlerAdapter()
  expect(testBundlerAdapter).toBeTruthy()
  expect(testBundlerAdapter).toBeInstanceOf(AbstractBundlerAdapter)
  expect(testBundlerAdapter.getName()).toEqual('test')
})

it('generate client', async () => {
  const testBundlerAdapter = new TestBundlerAdapter()
  expect(testBundlerAdapter.generateClient([])).toMatchSnapshot()

  const apis = parseApiModule(
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
    testBundlerAdapter.getRouter()
  )

  expect(wrap(testBundlerAdapter.generateClient(apis))).toMatchSnapshot()
})

it('with requestClient should not generate client', async () => {
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

  const testBundlerAdapter = new TestBundlerAdapter()

  const apis = parseApiModule(
    {
      custom: Api(CustomTrigger(), async () => {}),
    },
    '/server/api/index.ts',
    testBundlerAdapter.getRouter()
  )

  expect(testBundlerAdapter.generateClient(apis)).toMatchSnapshot()
})

it('with requestClient generate client', async () => {
  const CustomTrigger = (): Operator<void> => {
    return {
      name: 'Custom',
      metadata({ setMetadata: defineProperty }) {
        defineProperty<BaseTrigger>(OperatorType.Trigger, {
          type: 'Custom',
          isCustom: true,
          requestClient: {
            fetcher: 'ws',
            client: '@midwayjs/rpc',
          },
        })
      },
    }
  }

  const testBundlerAdapter = new TestBundlerAdapter()

  const apis = parseApiModule(
    {
      get: Api(Get(), async () => {}),
      custom: Api(CustomTrigger(), async () => {}),
    },
    '/server/api/index.ts',
    testBundlerAdapter.getRouter()
  )

  expect(testBundlerAdapter.generateClient(apis)).toMatchSnapshot()
})

it('with requestClient generate multi client', async () => {
  const CustomTrigger = (): Operator<void> => {
    return {
      name: 'Custom',
      metadata({ setMetadata: defineProperty }) {
        defineProperty<BaseTrigger>(OperatorType.Trigger, {
          type: 'Custom',
          isCustom: true,
          requestClient: {
            fetcher: 'cloud',
            client: 'cloud-invoker',
          },
        })
      },
    }
  }

  const testBundlerAdapter = new TestBundlerAdapter()

  const apis = parseApiModule(
    {
      get: Api(Get(), async () => {}),
      custom: Api(CustomTrigger(), async () => {}),
    },
    '/server/api/index.ts',
    testBundlerAdapter.getRouter()
  )

  expect(wrap(testBundlerAdapter.generateClient(apis))).toMatchSnapshot()
})
