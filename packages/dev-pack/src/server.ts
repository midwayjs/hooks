import { createDebug } from '@midwayjs/hooks-core'
import { ChildProcess, fork } from 'child_process'
import detectPort from 'detect-port'
import chokidar from 'chokidar'
import { existsSync } from 'fs'
import { resolve } from 'path'
import {
  AppEvents,
  AppType,
  ipc,
  logger,
  ServerEvents,
  ServerlessAppFunction,
  ServerState,
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

  state: ServerState = ServerState.Closed

  constructor(public options: CreateOptions) {}

  async run() {
    this.registerHooks()

    await this.start()
    if (this.options.watch) {
      await this.watch()
    }
  }

  registerHooks() {
    ;['SIGINT', 'SIGTERM', 'exit'].forEach((signal) =>
      process.on(signal, async () => {
        await this.close(signal)
        if (signal !== 'exit') {
          process.exit()
        }
      })
    )
  }

  async ready() {
    if (
      this.state === ServerState.Closed ||
      this.state === ServerState.Restarting
    ) {
      return new Promise((resolve, reject) => {
        this.waitingList.push({ resolve, reject })
      })
    }
  }

  private waitingList: { resolve: Function; reject: Function }[] = []
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
          sourceDir: this.options.sourceDir,
          port,
          type: this.isServerlessApp() ? AppType.Serverless : AppType.Server,
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

    const event = await Promise.race([
      ipc.once<AppEvents>(this.app, AppEvents.Started),
      ipc.once<AppEvents>(this.app, AppEvents.StartError),
    ])

    switch (event.type) {
      case AppEvents.Started:
        debug('dev server started')
        await this.handleStarted()
        break
      case AppEvents.StartError:
        debug('dev server start error')
        await this.handleError(event.data)
        logger.error(event.data)
    }

    ipc.once(this.app, AppEvents.UncaughtException).then(async (event) => {
      debug('dev server uncaught exception')
      logger.error(event.data)
      await this.handleError(event.data)
      await this.restart()
    })
  }

  private isServerlessApp() {
    return existsSync(resolve(this.options.cwd, 'f.yml'))
  }

  private handleStarted = async () => {
    this.functions = await this.getFunctions()
    this.state = ServerState.Started
    this.waitingList.forEach((waiting) => waiting.resolve())
    this.waitingList = []
  }

  private handleError = async (err: any) => {
    this.state = ServerState.Error
    this.waitingList.forEach((waiting) => waiting.reject(err))
    this.waitingList = []
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
    this.state = ServerState.Restarting

    await this.close('restart')
    await this.start()
  }

  async close(reason?: string) {
    debug(`dev server closing, reason: %s`, reason)

    if (!this.app || !this.app.connected) {
      return
    }

    ipc.send(this.app, ServerEvents.Close)
    await pEvent(this.app, 'exit')
    this.app?.kill?.()
    this.app = null
    this.state = ServerState.Closed
  }

  private functions: Record<string, ServerlessAppFunction> = null

  isMatch(url: string) {
    for (const func of Object.values(this.functions)) {
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
    ipc.send(this.app, ServerEvents.GetApis)

    const message = await ipc.once<Record<string, ServerlessAppFunction>>(
      this.app,
      AppEvents.GetApisResult
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
