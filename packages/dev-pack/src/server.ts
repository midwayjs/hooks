import { createDebug } from '@midwayjs/hooks-core'
import { fork, ChildProcess } from 'child_process'
import detectPort from 'detect-port'
import chokidar from 'chokidar'
import { existsSync } from 'fs'
import { resolve } from 'path'
import {
  AppEvents,
  ServerEvents,
  ServerlessAppFunction,
  ServerlessAppEvents,
  ipc,
} from './share'
import pathToRegexp from 'path-to-regexp'
import pEvent from 'p-event'

const debug = createDebug('hooks-dev-pack:server')

export type CreateOptions = {
  watch?: boolean
  cwd?: string
  sourceDir?: string
}

export class DevServer {
  app: ChildProcess
  port: number

  constructor(public options: CreateOptions) {}

  async run() {
    this.registerHooks()

    await this.start()
    if (this.options.watch) {
      await this.watch()
    }
  }

  registerHooks() {
    ;['SIGINT', 'SIGTERM'].forEach((signal) =>
      process.on(signal, async () => {
        await this.close()
        process.exit()
      })
    )

    process.on('exit', async () => {
      await this.close()
    })
    process.on('uncaughtException', async (error: any) => {
      console.error(error)
      await this.close()
    })
  }

  async start() {
    const port = await this.ensurePort(7001)
    debug('dev server port: %s', port)

    let app: string
    try {
      app = require.resolve('./app')
    } catch {
      app = require.resolve('../app')
    }

    this.app = fork(
      app,
      [
        JSON.stringify({
          baseDir: this.options.sourceDir,
          port,
        }),
      ],
      {
        cwd: this.options.cwd,
        env: {
          ...process.env,
          // https://dwz.ee/20n
          IN_CHILD_PROCESS: 'true',
          MIDWAY_SERVER_ENV: 'local',
        },
        execArgv: ['-r', '@midwayjs/esrun/register'],
        serialization: 'advanced',
        silent: true,
      }
    )

    this.app.stdout.on('data', (data) => process.stdout.write(data))
    this.app.stderr.on('data', (data) => process.stderr.write(data))

    await ipc.on(this.app, AppEvents.Start)
    debug('dev server started')
  }

  async watch() {
    const watcher = chokidar.watch('**/*.ts', {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      cwd: this.options.sourceDir,
    })

    ;['midway.config.ts', 'midway.config.js', 'f.yml']
      .map((file) => resolve(this.options.sourceDir, file))
      .filter((file) => existsSync(file))
      .forEach((file) => watcher.add(file))

    watcher.on(
      'all',
      createPromiseLock(async (event: string, path: string) => {
        debug('watch event: %s, path: %s', event, path)
        await this.restart()
        debug('dev server restarted')
      })
    )
  }

  async restart() {
    await this.close()
    await this.start()
  }

  async close() {
    debug('dev server closing')
    if (!this.app || !this.app.connected) {
      return
    }

    ipc.send(this.app, ServerEvents.Close)
    await pEvent(this.app, 'exit')
    this.app.kill?.()
    this.app = null
  }

  async isMatch(url: string) {
    const functions = await this.getFunctions()

    for (const func of Object.values(functions)) {
      for (const event of func.events) {
        if (!event.http) continue
        if (pathToRegexp(event.http.path).test(url)) {
          return true
        }
      }
    }

    return false
  }

  async getFunctions() {
    ipc.send(this.app, ServerlessAppEvents.GetFunctions)

    const message = await ipc.on<Record<string, ServerlessAppFunction>>(
      this.app,
      ServerlessAppEvents.GetFunctionsResult
    )

    return message.data
  }

  async ensurePort(defaultPort: number) {
    const MIDWAY_HTTP_PORT = 'MIDWAY_HTTP_PORT'

    if (!process.env[MIDWAY_HTTP_PORT]) {
      const port = await detectPort(defaultPort)
      process.env[MIDWAY_HTTP_PORT] = port.toString()
    }

    this.port = parseInt(process.env[MIDWAY_HTTP_PORT])
    return this.port
  }
}

function createPromiseLock(callback: (...args: any[]) => Promise<void>) {
  let lock = false
  return async (...args: any[]) => {
    if (lock) {
      return
    }
    lock = true
    try {
      await callback(...args)
    } finally {
      lock = false
    }
  }
}
