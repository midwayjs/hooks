import { createFunctionApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/faas'
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

  const app = await createFunctionApp<Framework>(process.cwd(), options)
  ipc.send(process, AppEvents.Start)

  async function closeApp() {
    await close(app)
    process.exit()
  }

  process.on('message', async (message: IPCMessage) => {
    if (message.type === ServerEvents.Close) {
      await closeApp()
    }
  })
  process.on('exit', async () => {
    await closeApp()
  })
}

bootstrap()
