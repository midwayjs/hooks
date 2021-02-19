import { ts } from '@midwayjs/mwcc'
import { getSourceFilePath } from '../util'
import { buildErrorCodeFrame } from './code-frame'
import { relative } from 'upath'
import { router } from '../helper'

export class InvalidReferenceError extends Error {
  constructor(ref: ts.Node) {
    const messages = [
      buildErrorCodeFrame(
        ref,
        'Only call hooks from lambda(api function) and custom hooks (https://www.yuque.com/midwayjs/faas/qrsykh#pTyCv)'
      ),
      `\n\nsourcefile: ${relative(router.root, getSourceFilePath(ref))}`,
    ]
    super(messages.join('\n'))
  }
}
