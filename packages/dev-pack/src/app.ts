import { close, createApp, createFunctionApp } from '@midwayjs/mock'
import { createDebug } from '@midwayjs/hooks-core'
import { AppEvents, AppType, ipc, ServerEvents } from './share'
import { analysisDecorator } from './analysis'

const debug = createDebug('hooks-dev-pack:app')

export type AppOptions = {
  baseDir: string
  port: number
  type: AppType
}

const options: AppOptions = JSON.parse(process.argv[2])

const isServer = options.type === AppType.Server
debug('app options: %O', options)

let app: any

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
    debug('uncaughtException: %O', err)
    ipc.send(process, AppEvents.UncaughtException, err)
    await closeApp()
  })

  ipc.once(process, ServerEvents.Close).then(() => closeApp())

  // implement for get server
  if (isServer) {
    ipc.on(process, ServerEvents.GetApis, async () => {
      const apis = await analysisDecorator(options.baseDir)
      ipc.send(process, AppEvents.GetApisResult, apis)
    })
  }
}

registerHooks()
bootstrap()
