import { BootstrapStarter } from '@midwayjs/bootstrap'
import { MidwayContainer, createConfiguration } from '@midwayjs/core'
import { Framework } from '@midwayjs/faas'
import { start } from '@midwayjs/serverless-fc-starter'
import { HTTPTrigger } from '@midwayjs/serverless-fc-trigger'

import { createSnapshot, useContext, SnapShot, hooks } from '../../'

const testConfig = {
  root: '/',
  projectConfig: {
    source: 'src',
    routes: [
      {
        baseDir: 'api',
        basePath: '/api',
      },
    ],
  },
  modules: [
    {
      file: '/src/api/index.ts',
      mod: {
        async default() {
          const ctx = useContext()
          return {
            message: 'Hello Midway Hooks!',
            query: ctx.query,
          }
        },
      },
    },
    {
      file: '/src/api/demo.ts',
      mod: {
        async post(name: string) {
          return {
            message: `Hello ${name}`,
          }
        },
      },
    },
  ],
}

async function createHTTPInvoker(snapshot: Partial<SnapShot>) {
  let framework: Framework

  const container = new MidwayContainer()

  snapshot.container = container
  createSnapshot(snapshot as SnapShot)

  const layers = [
    (engine) => {
      engine.addRuntimeExtension({
        async beforeFunctionStart(runtime) {
          const configuration = createConfiguration({
            imports: [hooks()],
          })
          container.load(configuration)

          framework = new Framework()
          framework.configure({ applicationAdapter: runtime })

          const boot = new BootstrapStarter()
          boot
            .configure({
              appDir: __dirname,
              applicationContext: container,
            })
            .load(framework)

          await boot.init()
          await boot.run()
        },
      })
    },
  ]

  const runtime = await start({
    layers,
    initContext: {},
    runtimeConfig: {},
  })

  return async (handler: string, trigger: HTTPTrigger) => {
    const args = await trigger.toArgs()
    trigger.createCallback((err, response) => response)

    return runtime.asyncEvent(async (ctx) => {
      return framework.handleInvokeWrapper(handler)(ctx)
    })(...args)
  }
}

test.skip('load snapshot', async () => {
  const container = new MidwayContainer()
  createSnapshot({
    container,
    ...testConfig,
  })

  hooks()

  expect(container.get('api-index')).toBeTruthy()
  expect(container.get('api-demo-post')).toBeTruthy()
})

test('hydrate', async () => {
  const invoke = await createHTTPInvoker(testConfig)

  const getResponse = await invoke(
    'api-index.handler',
    new HTTPTrigger({
      path: '/api',
      method: 'GET',
      query: {
        name: 'Jake',
      },
    })
  )

  expect(JSON.parse(getResponse.body)).toEqual({
    message: 'Hello Midway Hooks!',
    query: {
      name: 'Jake',
    },
  })

  const postResponse = await invoke(
    'api-demo-post.handler',
    new HTTPTrigger({
      path: '/api/demo/post',
      method: 'POST',
      body: {
        args: ['MIDWAY_HOOKS'],
      },
    })
  )

  expect(JSON.parse(postResponse.body)).toEqual({
    message: 'Hello MIDWAY_HOOKS',
  })
})
