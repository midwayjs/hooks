import { createDebug } from '@midwayjs/hooks-core'
import { ChildProcess, fork } from 'child_process'
import detectPort from 'detect-port'
import chokidar from 'chokidar'
import colors from 'picocolors'
import { existsSync } from 'fs'
import { resolve } from 'path'
import {
  AppEvents,
  AppType,
  ipc,
  logger,
  MatchInfo,
  ServerEvents,
  ServerState,
} from './share'
import pEvent from 'p-event'
import { AppOptions } from './app'
import Spinner from 'light-spinner'
import chalk from 'chalk'

const debug = createDebug('hooks-dev-pack:server')

export type CreateOptions = {
  watch?: boolean
  cwd?: string
  sourceDir?: string
  hideSpinner?: boolean
}

export class DevServer {
  app: ChildProcess
  port: number

  state: ServerState = ServerState.Closed
  spinner: Spinner

  constructor(public options: CreateOptions) {}

  async run() {
    this.registerHooks()

    await this.start()
    if (this.options.watch) {
      this.watch()
    }
  }

  registerHooks() {
    process.on('SIGINT', async () => {
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      ipc.once(this.app, AppEvents.Closed).then(() => {
        process.exit(0)
      })
      await this.close('SIGTERM')
    })
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
    if (!this.options.hideSpinner) {
      this.spinner = new Spinner({
        text:
          this.state === ServerState.Restarting
            ? `${logger.tag} Restarting`
            : `${logger.tag} Starting`,
      })

      this.spinner.start()
    }

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
          type: this.isServerlessApp() ? AppType.Serverless : AppType.Server,
        } as AppOptions),
      ],
      {
        cwd: this.options.cwd,
        env: {
          ...process.env,
          // https://dwz.ee/20n
          MIDWAY_SERVER_ENV: 'local',
        },
        execArgv: ['-r', require.resolve('@midwayjs/esrun/register')],
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

    !this.options.hideSpinner && this.spinner.stop()

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
    this.state = ServerState.Started
    this.waitingList.forEach((waiting) => waiting.resolve())
    this.waitingList = []
  }

  private handleError = async (err: any) => {
    this.state = ServerState.Error
    this.waitingList.forEach((waiting) => waiting.reject(err))
    this.waitingList = []
  }

  watch() {
    const watcher = chokidar.watch('**/*.ts', {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      cwd: this.options.cwd,
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
        logger.info(
          `${colors.green('Auto Reload')} ${chalk.hex('#666666')(
            `[${event}] ${path}`
          )}`
        )
      })
    )
  }

  async restart() {
    await this.close('restart')
    this.state = ServerState.Restarting
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

  private matched = new Map<string, boolean>()
  private bundlerAssets = [
    '/node_modules/.vite/',
    '@react-refresh',
    '@id',
    '@fs',
    '@vite',
  ]

  async isMatch(path: string, method: string) {
    if (this.bundlerAssets.some((asset) => path.includes(asset))) {
      return false
    }

    const key = `${method} ${path}`
    if (this.matched.has(key)) {
      return this.matched.get(key)
    }

    ipc.send<MatchInfo>(this.app, ServerEvents.IsMatch, { path, method })
    const message = await ipc.once<boolean>(
      this.app,
      `${AppEvents.IsMatchResult} ${key}`
    )
    debug('isMatch %s %s %s', message.data, method, path)
    this.matched.set(key, message.data)
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
