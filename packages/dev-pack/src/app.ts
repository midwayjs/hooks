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

async function closeApp() {
  if (app) await close(app)
  process.exit(0)
}

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

function registerHooks() {
  process.on('uncaughtException', async (err: Error) => {
    ipc.send(process, AppEvents.UncaughtException, err)
    await closeApp()
  })

  process.on('exit', () => {
    console.log('child process exit')
  })

  ipc.once(process, ServerEvents.Close).then(() => closeApp())

  let service: MidwayWebRouterService
  ipc.on<MatchInfo>(process, ServerEvents.IsMatch, async ({ data }) => {
    if (!service) {
      service = isServer
        ? await app.getApplicationContext().getAsync(MidwayWebRouterService)
        : await app
            .getApplicationContext()
            .getAsync(MidwayServerlessFunctionService)
    }

    const info = await service.getMatchedRouterInfo(data.path, data.method)
    ipc.send(process, AppEvents.IsMatchResult, !!info)
  })
}

registerHooks()
bootstrap()
