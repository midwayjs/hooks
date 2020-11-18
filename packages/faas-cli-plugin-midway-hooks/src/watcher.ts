/* istanbul ignore file */
import chokidar from 'chokidar'
import { getFuncList as preCompileProject } from '@midwayjs/fcli-plugin-invoke'
import { debug } from './util'
import { compilerEmitter, Events } from './event'

interface HooksWatcherFsEvent {
  type: 'add' | 'unlink' | 'change'
  path: string
}

type HooksWatcherEvent = HooksWatcherFsEvent | { type: 'ready' }

export type WatcherConfig = {
  //  根目录
  root: string
  // Apis 根目录 -> src/apis
  source: string
}

export class HooksWatcher {
  private watcher?: chokidar.FSWatcher
  private started = false
  private lastError: Error | null = null
  watcherOptions: chokidar.WatchOptions = {
    ignored: ['**/node_modules/**', '**/.*', '*.gql', '*.graphql'],
    persistent: true,
  }

  private config: WatcherConfig

  constructor(config: WatcherConfig) {
    this.config = config
  }

  async pushEvent(event: HooksWatcherEvent) {
    debug('HooksWatcher event: %j', event)

    if (this.lastError) {
      const lastError = this.lastError
      this.lastError = null
      throw lastError
    }

    compilerEmitter.emit(Events.PRE_COMPILE_START)

    await preCompileProject({
      functionDir: this.config.root,
      sourceDir: this.config.source,
    })

    compilerEmitter.emit(Events.PRE_COMPILE_FINISH)
  }

  async start() {
    if (this.started) {
      throw new Error('already started')
    }
    this.started = true

    this.watcher = chokidar.watch(this.config.source, this.watcherOptions)

    await new Promise<void>((resolve, reject) => {
      this.watcher.on('ready', () => {
        resolve()
      })
    })

    this.watcher.on('add', (path) => {
      this.pushEvent({ type: 'add', path })
    })

    this.watcher.on('change', (path) => {
      this.pushEvent({ type: 'change', path })
    })

    this.watcher.on('unlink', (path) => {
      this.pushEvent({ type: 'unlink', path })
    })

    this.watcher.on('error', (err) => {
      this.lastError = err
    })
  }
}
