import { createFunctionApp, close } from '@midwayjs/mock'
import { Framework, IMidwayFaaSApplication } from '@midwayjs/faas'
import { createDebug } from '@midwayjs/hooks-core'
import { AppEvents, ipc, IPCMessage, ServerEvents } from './share'

const debug = createDebug('hooks-dev-pack:app')

export type AppOptions = {
  baseDir: string
  port: number
}

async function bootstrap() {
  const options: AppOptions = JSON.parse(process.argv[2])
  debug('app options: %O', options)

  ipc.on(process, ServerEvents.Close).then(() => closeApp())

  process.on('uncaughtException', async (err: Error) => {
    debug('uncaughtException: %O', err)
    ipc.send(process, AppEvents.UncaughtException, err)
    await closeApp()
  })

  let app: IMidwayFaaSApplication
  try {
    app = await createFunctionApp<Framework>(process.cwd(), options)
    ipc.send(process, AppEvents.Started)
  } catch (error) {
    ipc.send(process, AppEvents.StartError, error)
  }

  async function closeApp() {
    if (app) await close(app)
    process.exit(0)
  }
}

bootstrap()
