import ts from 'typescript'
import { BuiltinHooks } from '../const'
import { getSourceFilePath } from '../util'

export class BuiltinHooksError extends Error {
  constructor(ref: ts.Identifier) {
    const messages = [
      `Currently only the following built-in Hooks are supported: ${BuiltinHooks.join(',')}`,
      `variable: ${ref.getText()}`,
      `sourcefile: ${getSourceFilePath(ref)}`,
    ]
    super(messages.join('\n'))
    this.name = 'BuiltinHooksError'
  }
}
