import pEvent from 'p-event'
import { EventEmitter } from 'events'
import { ChildProcess } from 'child_process'
import { createDebug } from '@midwayjs/hooks-core'
import consola from 'consola'

export const enum ServerEvents {
  // hard code at @midwayjs/serverless-app
  GetApis = 'functions',
  Close = 'server:close',
}

export const enum AppType {
  Server,
  Serverless,
}

export const enum AppEvents {
  Started = 'app:start:success',
  StartError = 'app:start:error',
  Exit = 'app:exit',
  UncaughtException = 'app:uncaughtException',
  // hard code at @midwayjs/serverless-app
  GetApisResult = 'dev:functions',
}

export const enum ServerState {
  Closed,
  Started,
  Error,
  Restarting,
}

type IPCEvents = ServerEvents | AppEvents

export type IPCMessage<T = any> = {
  type: IPCEvents
  data?: T
}

export type ServerlessAppFunction = {
  handler: string
  events: Triggers[]
}

type Triggers = {
  http: HttpTrigger
}

type HttpTrigger = {
  type: string
  path: string
  method: string
  functionId: string
  handler: string
}

const debug = createDebug('hooks-dev-pack:ipc')

export const ipc = {
  async once<T = any>(
    emitter: EventEmitter,
    type: IPCEvents
  ): Promise<IPCMessage<T>> {
    debug(`on %s`, type)
    const message = await pEvent(
      emitter,
      'message',
      (message: IPCMessage) => message.type === type
    )
    debug(`once %s success, message: %O`, type, message)
    return message
  },
  async on<T = any>(
    emitter: EventEmitter,
    type: IPCEvents,
    callback: (message: IPCMessage<T>) => void
  ) {
    debug(`on %s`, type)
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
    if (proc && typeof proc.send === 'function') {
      proc.send({ type, data })
    }
  },
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const logger = consola.withTag('Midway')
