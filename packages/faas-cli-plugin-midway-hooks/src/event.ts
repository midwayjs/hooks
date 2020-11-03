import { EventEmitter } from 'events'

class CompilerEmitter extends EventEmitter {
  isCompiled = false
}

export const compilerEmitter = new CompilerEmitter()

export enum Events {
  PRE_COMPILE_START = 'PRE_COMPILE_START',
  PRE_COMPILE_FINISH = 'PRE_COMPILE_FINISH',
}
