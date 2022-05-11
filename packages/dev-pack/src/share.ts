import pEvent from 'p-event'
import { EventEmitter } from 'events'
import { ChildProcess } from 'child_process'

export const enum ServerEvents {
  Close = 'server:close',
}

// for @midwayjs/serverless-app
export const enum ServerlessAppEvents {
  GetFunctions = 'functions',
  GetFunctionsResult = 'dev:functions',
}

export const enum AppEvents {
  Start = 'app:start',
  Exit = 'app:exit',
  StartError = 'app:start:error',
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

export const ipc = {
  on<T = any>(emitter: EventEmitter, type: IPCEvents): Promise<IPCMessage<T>> {
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
    proc.send({ type, data })
  },
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
