import { EventEmitter } from 'events'

export const compilerEmitter = new EventEmitter()

export enum Events {
  PRE_COMPILE_START = 'PRE_COMPILE_START',
  PRE_COMPILE_FINISH = 'PRE_COMPILE_FINISH',
}
