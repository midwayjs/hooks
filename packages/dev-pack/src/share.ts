import pEvent from 'p-event'
import { EventEmitter } from 'events'
import { ChildProcess } from 'child_process'
import { createDebug } from '@midwayjs/hooks-core'
import consola from 'consola'

export const enum ServerEvents {
  Close = 'server:close',
}

// for @midwayjs/serverless-app
export const enum ServerlessAppEvents {
  GetFunctions = 'functions',
  GetFunctionsResult = 'dev:functions',
}

export const enum AppEvents {
  Started = 'app:start:success',
  StartError = 'app:start:error',
  Exit = 'app:exit',
  UncaughtException = 'app:uncaughtException',
}

export const enum ServerState {
  Closed,
  Started,
  Error,
  Restarting,
}

type IPCEvents = ServerEvents | AppEvents | ServerlessAppEvents

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
  on<T = any>(emitter: EventEmitter, type: IPCEvents): Promise<IPCMessage<T>> {
    debug(`on %s`, type)
    return pEvent(
      emitter,
      'message',
      (message: IPCMessage) => message.type === type
    )
  },
  send<T = any>(
    proc: NodeJS.Process | ChildProcess,
    type: IPCEvents,
    data?: T
  ): void {
    debug(`send %s, data: %O`, type, data)
    proc?.send?.({ type, data })
  },
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const logger = consola.withTag('Midway')
