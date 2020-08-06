import { debug } from '../util'

export class CompileError extends Error {
  constructor(message: string) {
    super(message)
    debug(message)
  }
}
