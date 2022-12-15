import pEvent from 'p-event'
import { EventEmitter } from 'events'
import { ChildProcess } from 'child_process'
import { createDebug } from '@midwayjs/hooks-core'
import colors from 'picocolors'

export const enum ServerEvents {
  Close = 'server:close',
  IsMatch = 'server:isMatch',
}

export const enum AppType {
  Server,
  Serverless,
}

export const enum AppEvents {
  Started = 'app:start:success',
  StartError = 'app:start:error',
  UncaughtException = 'app:uncaughtException',
  IsMatchResult = 'app:isMatch:result',
  Closed = 'app:closed',
}

export const enum ServerState {
  Closed,
  Started,
  Error,
  Restarting,
}

type IPCEvents = ServerEvents | AppEvents | string

export type IPCMessage<T = any> = {
  type: IPCEvents
  data?: T
}

export type MatchInfo = {
  path: string
  method: string
}

const debug = createDebug('hooks-dev-pack:ipc')

export const ipc = {
  async once<T = any>(
    emitter: EventEmitter,
    type: IPCEvents
  ): Promise<IPCMessage<T>> {
    const message = await pEvent(
      emitter,
      'message',
      (message: IPCMessage) => message.type === type
    )
    debug(`once %s success, message: %O`, type, message)
    return message
  },
  on<T = any>(
    emitter: EventEmitter,
    type: IPCEvents,
    callback: (message: IPCMessage<T>) => void
  ) {
    emitter.on('message', (message: IPCMessage) => {
      if (message.type === type) {
        debug(`on %s success, message: %O`, type, message)
        callback(message)
      }
    })
  },
  send<T = any>(
    proc: NodeJS.Process | ChildProcess,
    type: IPCEvents,
    data?: T
  ): void {
    debug(`send %s`, type)
    if (proc && typeof proc.send === 'function' && proc.connected) {
      proc.send({ type, data }, (error) => {
        if (error) {
          console.error(colors.red(`send ${type} error: ${error.message}`))
        }
      })
    }
  },
}

export const logger = {
  sameCount: 0,
  lastMsg: '',
  tag: colors.cyan(colors.bold('[Midway]')),
  info(...args: any[]) {
    const timestamp = colors.dim(new Date().toLocaleTimeString())
    if (logger.lastMsg === args[0]) {
      logger.sameCount++
      args.push(colors.yellow(`(x${logger.sameCount + 1})`))
    } else {
      logger.sameCount = 0
    }
    console.log(timestamp, logger.tag, ...args)
    logger.lastMsg = args[0]
  },
  error(msg: string) {
    console.error(logger.tag, msg)
  },
}
