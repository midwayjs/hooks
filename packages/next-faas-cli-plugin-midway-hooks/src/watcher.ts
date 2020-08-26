import chokidar from 'chokidar'
import { getFuncList as preCompileProject } from '@midwayjs/fcli-plugin-invoke'
import { debug } from './util'
import { compilerEmitter, Events } from './event'

interface HooksWatcherFsEvent {
  type: 'add' | 'unlink' | 'change'
  path: string
}

type HooksWatcherEvent = HooksWatcherFsEvent | { type: 'ready' }

class PromiseSignal<T> {
  private promise: Promise<T>
  private resolve?: (value: T) => void
  private resolved = false

  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  getPromise() {
    return this.promise
  }

  notify(value: T) {
    if (this.resolved) {
      throw new Error('already resolved')
    }
    this.resolved = true
    this.resolve!(value)
  }
}

export type WatcherConfig = {
  //  根目录
  root: string
  // Apis 根目录 -> src/apis
  apis: string
}

export class HooksWatcher {
  private watcher?: chokidar.FSWatcher
  private started = false
  private ready = false
  private eventQueue: HooksWatcherEvent[] = []
  private signal = new PromiseSignal<void>()
  private lastError: Error | null = null
  watcherOptions: chokidar.WatchOptions = {
    ignored: ['**/node_modules/**', '**/.*', '*.gql', '*.graphql'],
  }

  private config: WatcherConfig

  constructor(config: WatcherConfig) {
    this.config = config
  }

  async stop() {
    await this.watcher?.close()
    this.started = false
  }

  async getNext() {
    if (this.lastError) {
      const lastError = this.lastError
      this.lastError = null
      throw lastError
    }

    if (!this.started) {
      await this.start()
    }

    if (this.eventQueue.length === 0) {
      await this.signal.getPromise()
    }

    compilerEmitter.emit(Events.PRE_COMPILE_START)
    /**
     * 过滤 Ready 事件，避免 Ready 带来的重复 Trigger
     */
    const eventQueue = this.eventQueue.filter((event) => event.type !== 'ready')
    this.eventQueue = []
    this.signal = new PromiseSignal()

    if (eventQueue.length !== 0) {
      await preCompileProject({
        functionDir: this.config.root,
        sourceDir: this.config.apis,
      })
      compilerEmitter.emit(Events.PRE_COMPILE_FINISH)
    }
  }

  private pushEvent(event: HooksWatcherEvent) {
    debug('HooksWatcher event: %j', event)

    this.eventQueue.push(event)

    if (this.eventQueue.length === 1) {
      this.signal.notify()
    }
  }

  private async start() {
    if (this.started) {
      throw new Error('already started')
    }
    this.started = true
    this.ready = false

    this.watcher = chokidar.watch(this.config.apis, {
      ...this.watcherOptions,
      persistent: true,
    })

    this.watcher.on('ready', () => {
      this.ready = true
      this.pushEvent({ type: 'ready' })
    })

    this.watcher.on('add', (path) => {
      if (!this.ready) {
        return
      }

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
