import ts from 'typescript'
import { getSourceFilePath } from '../util'
import { buildErrorCodeFrame } from './code-frame'
import { relative } from 'upath'
import { helper } from '../helper'

export class InvalidReferenceError extends Error {
  constructor(ref: ts.Node) {
    const messages = [
      buildErrorCodeFrame(
        ref,
        'Only call hooks from lambda(api function) and custom hooks (https://www.yuque.com/midwayjs/faas/qrsykh#pTyCv)'
      ),
      `\n\nsourcefile: ${relative(helper.root, getSourceFilePath(ref))}`,
    ]
    super(messages.join('\n'))
  }
}
