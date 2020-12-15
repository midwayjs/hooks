import { ts } from '@midwayjs/mwcc'
import { relative } from 'upath'
import { helper } from '..'
import { BuiltinHooks } from '../const'
import { getSourceFilePath } from '../util'
import { buildErrorCodeFrame } from './code-frame'

export class BuiltinHooksError extends Error {
  constructor(ref: ts.Identifier) {
    const messages = [
      buildErrorCodeFrame(ref, `Only built-in Hooks are supported. built-in hooks: ${BuiltinHooks.join(', ')}`),
      `\n\nsourcefile: ${relative(helper.root, getSourceFilePath(ref))}`,
    ]
    super(messages.join('\n'))
  }
}
