import { close, createApp, createFunctionApp } from '@midwayjs/mock'
import { createDebug } from '@midwayjs/hooks-core'
import { AppEvents, AppType, ipc, MatchInfo, ServerEvents } from './share'
import type { IMidwayApplication } from '@midwayjs/core'
import {
  MidwayServerlessFunctionService,
  MidwayWebRouterService,
} from '@midwayjs/core'

const debug = createDebug('hooks-dev-pack:app')

export type AppOptions = {
  baseDir: string
  port: number
  type: AppType
}

const options: AppOptions = JSON.parse(process.argv[2])

const isServer = options.type === AppType.Server
debug('app options: %O', options)

let app: IMidwayApplication

async function bootstrap() {
  try {
    app = isServer
      ? await createApp(process.cwd(), options)
      : await createFunctionApp(process.cwd(), options)
    ipc.send(process, AppEvents.Started)
  } catch (error) {
    ipc.send(process, AppEvents.StartError, error)
  }
}

async function closeApp(exitCode: 0 | 1) {
  if (app) await close(app)
  ipc.send(process, AppEvents.Closed)
  process.exit(exitCode)
}

function registerHooks() {
  process.on('uncaughtException', async (err: Error) => {
    ipc.send(process, AppEvents.UncaughtException, err)
    await closeApp(1)
  })

  process.on('SIGINT', async () => {
    await closeApp(0)
  })

  ipc.once(process, ServerEvents.Close).then(() => closeApp(0))

  let service: MidwayWebRouterService
  ipc.on<MatchInfo>(process, ServerEvents.IsMatch, async ({ data }) => {
    if (!service) {
      const appCtx = app.getApplicationContext()
      service = isServer
        ? await appCtx.getAsync(MidwayWebRouterService)
        : await appCtx.getAsync(MidwayServerlessFunctionService)
    }

    const info = await service.getMatchedRouterInfo(data.path, data.method)
    const key = `${data.method} ${data.path}`
    ipc.send(process, `${AppEvents.IsMatchResult} ${key}`, !!info)
  })
}

registerHooks()
bootstrap()
