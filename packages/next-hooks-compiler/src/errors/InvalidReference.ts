import ts from 'typescript'
import { getSourceFilePath } from '../util'

export class InvalidReferenceError extends Error {
  constructor(ref: ts.Node) {
    const messages = [
      `Only call hooks from lambda (api functions) and custom hooks`,
      `variable: ${ref.getText()}`,
      `sourcefile: ${getSourceFilePath(ref)}`,
      'link: https://www.yuque.com/midwayjs/faas/qrsykh#pTyCv',
    ]
    super(messages.join('\n'))
    this.name = 'InvalidReferenceError'
  }
}
